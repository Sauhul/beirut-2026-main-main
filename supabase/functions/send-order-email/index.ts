/**
 * Supabase Edge Function: send-order-email
 *
 * Envía el correo de confirmación de pedido al cliente desde confirmacion@beirutmarket.co
 * utilizando Resend API (o servicio SMTP/Webhook).
 *
 * Variables de entorno (Supabase → Edge Functions → Secrets):
 *   RESEND_API_KEY — Key de Resend (re_...)
 *   EMAIL_FROM     — Remitente (default: "Almacén Beirut <confirmacion@beirutmarket.co>")
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderLine {
  name: string;
  quantity: number;
  lineTotal: number;
}

interface RequestBody {
  orderNumber: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: "domicilio" | "recogida" | "tienda";
  address?: string;
  city?: string;
  notes?: string;
  paymentMethod: string;
  lines: OrderLine[];
  total: number;
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildHtmlEmail(data: RequestBody): string {
  const itemsHtml = data.lines
    .map(
      (l) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #2a2826; color: #f5f0eb; font-weight: 600;">${l.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #2a2826; color: #c4b5a5; text-align: center;">${l.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #2a2826; color: #d4af37; font-weight: 700; text-align: right;">${formatCOP(l.lineTotal)}</td>
    </tr>
  `,
    )
    .join("");

  const deliveryText =
    data.deliveryMethod === "domicilio"
      ? `Domicilio a ${data.address || ""}${data.city ? `, ${data.city}` : ""}`
      : "Recogida en tienda";

  const paymentText =
    data.paymentMethod === "wompi"
      ? "Pago en línea (Wompi)"
      : "Transferencia bancaria / Nequi";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Confirmación de Pedido #${data.orderNumber} - Almacén Beirut</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0c0b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f5f0eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0d0c0b; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #171614; border: 1px solid #d4af37; border-radius: 8px; overflow: hidden; max-width: 600px; width: 100%;">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 30px; background-color: #11100e; border-bottom: 2px solid #d4af37;">
              <h1 style="margin: 0; color: #d4af37; font-size: 28px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">BEIRUT</h1>
              <p style="margin: 5px 0 0 0; color: #c4b5a5; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Delikatessen Beyrouth</p>
            </td>
          </tr>

          <!-- Banner Confirmación -->
          <tr>
            <td style="padding: 30px 40px 10px 40px; text-align: center;">
              <h2 style="margin: 0; color: #f5f0eb; font-size: 22px;">¡Gracias por tu compra, ${data.customerName}!</h2>
              <p style="margin: 10px 0 0 0; color: #d4af37; font-size: 16px; font-weight: 700; letter-spacing: 1px;">PEDIDO CONFIRMADO #${data.orderNumber}</p>
              <p style="margin: 10px 0 0 0; color: #a39688; font-size: 14px; line-height: 1.6;">Hemos recibido tu pedido correctamente. A continuación encuentras el resumen detallado de tu orden.</p>
            </td>
          </tr>

          <!-- Detalle de Productos -->
          <tr>
            <td style="padding: 20px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 14px;">
                <thead>
                  <tr style="background-color: #211f1c; color: #d4af37; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">
                    <th align="left" style="padding: 10px 12px;">Producto</th>
                    <th align="center" style="padding: 10px 12px;">Cant.</th>
                    <th align="right" style="padding: 10px 12px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Resumen de Pago -->
          <tr>
            <td style="padding: 10px 40px 30px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #211f1c; padding: 20px; border-radius: 6px; font-size: 14px;">
                <tr>
                  <td style="color: #a39688; padding-bottom: 8px;">Método de Entrega:</td>
                  <td align="right" style="color: #f5f0eb; font-weight: 600; padding-bottom: 8px;">${deliveryText}</td>
                </tr>
                <tr>
                  <td style="color: #a39688; padding-bottom: 8px;">Método de Pago:</td>
                  <td align="right" style="color: #f5f0eb; font-weight: 600; padding-bottom: 8px;">${paymentText}</td>
                </tr>
                ${
                  data.notes
                    ? `
                <tr>
                  <td style="color: #a39688; padding-bottom: 8px;">Notas:</td>
                  <td align="right" style="color: #f5f0eb; padding-bottom: 8px;">${data.notes}</td>
                </tr>`
                    : ""
                }
                <tr>
                  <td style="color: #d4af37; font-size: 16px; font-weight: 700; padding-top: 10px; border-top: 1px solid #383430;">TOTAL:</td>
                  <td align="right" style="color: #d4af37; font-size: 20px; font-weight: 800; padding-top: 10px; border-top: 1px solid #383430;">${formatCOP(data.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; background-color: #11100e; border-top: 1px solid #2a2826; text-align: center; color: #7a7065; font-size: 12px;">
              <p style="margin: 0 0 5px 0;">Almacén Beirut · Cra. 43 #84-26, Barranquilla</p>
              <p style="margin: 0 0 5px 0;">Si tienes dudas sobre tu envío, contáctanos al WhatsApp +57 312 852 7325</p>
              <p style="margin: 10px 0 0 0; color: #524b43; font-size: 11px;">Mensaje enviado desde beirutmarket.co</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();

    if (!body.customerEmail) {
      return new Response(JSON.stringify({ error: "Missing customerEmail" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const senderEmail = Deno.env.get("EMAIL_FROM") || "Almacén Beirut <confirmacion@beirutmarket.co>";

    if (!resendApiKey) {
      console.warn("RESEND_API_KEY no está configurada en Edge Functions.");
      return new Response(
        JSON.stringify({ success: false, message: "RESEND_API_KEY not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [body.customerEmail],
        subject: `¡Pedido Confirmado #${body.orderNumber}! - Almacén Beirut`,
        html: buildHtmlEmail(body),
      }),
    });

    const resData = await resendRes.json();

    return new Response(JSON.stringify({ success: resendRes.ok, data: resData }), {
      status: resendRes.ok ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error in send-order-email:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
