import { withSupabase } from "npm:@supabase/server";
import { sendConfirmedOrder } from "../_shared/send-confirmed-order.ts";

const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const transactionIdPattern = /^[a-zA-Z0-9_-]{8,100}$/;
const statuses = ["PENDING", "APPROVED", "DECLINED", "VOIDED", "ERROR"];

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function config() {
  const publicKey = Deno.env.get("WOMPI_PUBLIC_KEY")?.trim() ?? "";
  const privateKey = Deno.env.get("WOMPI_PRIVATE_KEY")?.trim() ?? "";
  const integrity = Deno.env.get("WOMPI_INTEGRITY_SECRET")?.trim() ?? "";
  const sandbox = publicKey.startsWith("pub_test_");
  const mode = sandbox ? "test" : "prod";
  const ready =
    publicKey.startsWith(`pub_${mode}_`) &&
    privateKey.startsWith(`prv_${mode}_`) &&
    integrity.startsWith(`${mode}_integrity_`);
  return { publicKey, privateKey, integrity, sandbox, mode, ready };
}

const checkout = withSupabase({ auth: "none" }, async (request, ctx) => {
  const settings = config();
  if (request.method === "GET") {
    return Response.json({ ready: settings.ready, sandbox: settings.sandbox });
  }
  if (request.method !== "POST") {
    return Response.json({ error: "Método inválido" }, { status: 405 });
  }
  if (!settings.ready) {
    return Response.json({ error: "Wompi aún no está configurado" }, { status: 503 });
  }
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > 20000) {
    return Response.json({ error: "Solicitud demasiado grande" }, { status: 413 });
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Solicitud inválida" }, { status: 400 });
  }
  if (!payload || typeof payload !== "object") {
    return Response.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  if (payload.action === "prepare") {
    if (!payload.order || typeof payload.order !== "object" || Array.isArray(payload.order)) {
      return Response.json({ error: "Pedido inválido" }, { status: 400 });
    }
    const { data, error } = await ctx.supabaseAdmin.rpc("create_order", {
      p_order: { ...payload.order, payment_method: "wompi" },
    });
    if (error) {
      const status = error.code === "PT429" ? 429 : error.code === "P0001" ? 400 : 503;
      return Response.json(
        { error: status === 503 ? "No se pudo registrar el pedido" : error.message },
        { status },
      );
    }
    const amountInCents = Number(data?.total) * 100;
    if (!data?.id || !Number.isSafeInteger(amountInCents) || amountInCents <= 0) {
      return Response.json({ error: "Total del pedido inválido" }, { status: 422 });
    }

    const { error: markError } = await ctx.supabaseAdmin
      .from("orders")
      .update({ payment_status: settings.sandbox ? "prueba_pendiente" : "wompi_pendiente" })
      .eq("id", data.id)
      .eq("payment_status", "pendiente")
      .select("id")
      .single();
    if (markError) return Response.json({ error: "No se pudo habilitar el pago" }, { status: 503 });

    const expirationTime = new Date(Date.now() + 20 * 60_000).toISOString();
    const signature = await sha256(
      `${data.id}${amountInCents}COP${expirationTime}${settings.integrity}`,
    );
    return Response.json({
      orderId: data.id,
      orderNumber: data.order_number,
      amountInCents,
      publicKey: settings.publicKey,
      signature,
      expirationTime,
      sandbox: settings.sandbox,
    });
  }

  let orderId = payload.orderId;
  let transactionId = payload.transactionId;
  if (payload.event === "transaction.updated") {
    const secret = Deno.env.get("WOMPI_EVENTS_SECRET")?.trim();
    const { properties, checksum } = payload.signature ?? {};
    if (
      !secret ||
      payload.environment !== settings.mode ||
      !Number.isSafeInteger(payload.timestamp) ||
      !Array.isArray(properties) ||
      properties.length < 1 ||
      properties.length > 20 ||
      typeof checksum !== "string"
    ) {
      return Response.json({ error: "Evento inválido" }, { status: 401 });
    }
    const values = properties.map((path) =>
      typeof path === "string" && /^[a-zA-Z_]+(?:\.[a-zA-Z_]+)*$/.test(path)
        ? path.split(".").reduce((value, key) => value?.[key], payload.data)
        : undefined,
    );
    if (values.some((value) => typeof value !== "string" && typeof value !== "number")) {
      return Response.json({ error: "Evento inválido" }, { status: 401 });
    }
    const expected = await sha256(values.join("") + payload.timestamp + secret);
    if (expected !== checksum.toLowerCase()) {
      return Response.json({ error: "Firma de evento inválida" }, { status: 401 });
    }
    orderId = payload.data?.transaction?.reference;
    transactionId = payload.data?.transaction?.id;
  } else if (payload.action !== "verify") {
    return Response.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  if (
    typeof orderId !== "string" ||
    !uuid.test(orderId) ||
    typeof transactionId !== "string" ||
    !transactionIdPattern.test(transactionId)
  ) {
    return Response.json({ error: "Referencia de pago inválida" }, { status: 400 });
  }
  const pending = settings.sandbox ? "prueba_pendiente" : "wompi_pendiente";
  const approved = settings.sandbox ? "prueba_aprobada" : "pagado";
  const { data: order, error: lookupError } = await ctx.supabaseAdmin
    .from("orders")
    .select("order_number,total,payment_status")
    .eq("id", orderId)
    .eq("payment_method", "wompi")
    .in("payment_status", [pending, approved])
    .maybeSingle();
  if (lookupError)
    return Response.json({ error: "No se pudo verificar el pedido" }, { status: 503 });
  if (!order) return Response.json({ error: "Pago no encontrado" }, { status: 404 });

  const host = settings.sandbox ? "https://sandbox.wompi.co" : "https://production.wompi.co";
  try {
    const result = await fetch(`${host}/v1/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${settings.privateKey}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!result.ok) {
      return Response.json(
        { error: "Wompi aún no pudo verificar la transacción" },
        { status: 502 },
      );
    }
    const { data } = await result.json();
    if (
      data?.id !== transactionId ||
      data.reference !== orderId ||
      data.currency !== "COP" ||
      data.amount_in_cents !== Number(order.total) * 100 ||
      !statuses.includes(data.status)
    ) {
      return Response.json({ error: "La transacción no coincide con el pedido" }, { status: 409 });
    }
    if (data.status === "APPROVED" && order.payment_status === pending) {
      const { error } = await ctx.supabaseAdmin
        .from("orders")
        .update({ payment_status: approved })
        .eq("id", orderId)
        .eq("payment_status", pending);
      if (error)
        return Response.json({ error: "No se pudo actualizar el pedido" }, { status: 503 });
    }
    if (data.status === "APPROVED") {
      try {
        await sendConfirmedOrder(ctx.supabaseAdmin, orderId, transactionId, settings.sandbox);
      } catch (error) {
        console.error(
          "Confirmación de pedido:",
          error instanceof Error ? error.message : "Error de envío",
        );
        if (payload.event === "transaction.updated") {
          return Response.json({ error: "Confirmación por correo pendiente" }, { status: 502 });
        }
      }
    }
    return Response.json({
      status: data.status,
      orderNumber: order.order_number,
      sandbox: settings.sandbox,
    });
  } catch {
    return Response.json({ error: "Wompi no está disponible en este momento" }, { status: 502 });
  }
});

export default {
  async fetch(request: Request) {
    // Checkout de invitado. No devuelve datos de contacto ni firma montos del cliente.
    const origin = request.headers.get("origin");
    const allowed =
      origin === "https://beirut-2026-main-main.saulu053.workers.dev" ||
      Boolean(origin && /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin));
    const headers = new Headers({ "Cache-Control": "no-store", Vary: "Origin" });
    if (allowed && origin) {
      headers.set("Access-Control-Allow-Origin", origin);
      headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      headers.set(
        "Access-Control-Allow-Headers",
        "content-type, authorization, apikey, x-client-info",
      );
    }
    if (origin && !allowed) return new Response(null, { status: 403, headers });
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });

    const response = await checkout(request);
    const combined = new Headers(response.headers);
    headers.forEach((value, key) => combined.set(key, value));
    return new Response(response.body, { status: response.status, headers: combined });
  },
};
