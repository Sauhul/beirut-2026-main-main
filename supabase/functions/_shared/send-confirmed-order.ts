import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { buildOrderConfirmation } from "./order-confirmation-template.ts";

export async function sendConfirmedOrder(
  db: SupabaseClient,
  orderId: string,
  transaction: string,
  sandbox: boolean,
): Promise<void> {
  const sandboxRecipient = Deno.env.get("WOMPI_SANDBOX_EMAIL_TO")?.trim().toLowerCase();
  if (sandbox && !sandboxRecipient) return;

  const { data: order, error } = await db
    .from("orders")
    .select(
      "order_number,total,customer_name,customer_email,customer_phone,created_at,delivery_method,address,city,notes,confirmation_email_sent_at,order_items(id,product_name,quantity,unit_price,line_total)",
    )
    .eq("id", orderId)
    .eq("payment_status", sandbox ? "prueba_aprobada" : "pagado")
    .maybeSingle();
  if (error) throw new Error("No se pudieron leer los datos de la confirmación");
  if (!order || order.confirmation_email_sent_at || !order.customer_email) return;
  if (sandbox && order.customer_email.toLowerCase() !== sandboxRecipient) return;
  if (!order.order_items.length) throw new Error("El pedido no tiene productos");

  const key = Deno.env.get("RESEND_API_KEY")?.trim();
  const from =
    Deno.env.get("EMAIL_FROM")?.trim() ||
    (sandbox ? "Beirut · Pruebas <onboarding@resend.dev>" : undefined);
  if (!key || !from) throw new Error("Remitente o servicio de correo sin configurar");

  const email = buildOrderConfirmation({
    number: order.order_number,
    name: order.customer_name,
    email: order.customer_email,
    phone: order.customer_phone,
    date: order.created_at,
    delivery: order.delivery_method,
    address: order.address,
    city: order.city,
    notes: order.notes,
    items: order.order_items
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((item) => ({
        name: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.line_total,
      })),
    total: order.total,
    transaction,
    sandbox,
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `beirut-order-confirmation/${orderId}`,
    },
    body: JSON.stringify({ from, to: [order.customer_email], ...email }),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`El proveedor rechazó el correo (${response.status})`);

  const { error: saveError } = await db
    .from("orders")
    .update({ confirmation_email_sent_at: new Date().toISOString() })
    .eq("id", orderId)
    .is("confirmation_email_sent_at", null);
  if (saveError) throw new Error("No se pudo registrar el envío");
}
