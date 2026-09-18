import { formatCOP } from "@shared/utils/format";

export type OrderEmailInput = {
  orderNumber: number;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: "domicilio" | "recogida" | "tienda";
  address?: string;
  city?: string;
  notes?: string;
  paymentMethod: string;
  lines: { name: string; quantity: number; lineTotal: number }[];
  total: number;
};

export type StatusUpdateEmailInput = {
  orderNumber: number;
  customerEmail: string;
  customerName: string;
  newStatus: string;
};

const SENDER_EMAIL = "Almacén Beirut <confirmacion@beirutmarket.co>";

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  preparando: "En Preparación",
  despachado: "Despachado / En Camino",
  cancelado: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pendiente: "#f59e0b",
  preparando: "#3b82f6",
  despachado: "#8b5cf6",
  cancelado: "#ef4444",
};

function generateOrderEmailHtml(input: OrderEmailInput): string {
  const itemsHtml = input.lines
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
    input.deliveryMethod === "domicilio"
      ? `Domicilio a ${input.address || ""}${input.city ? `, ${input.city}` : ""}`
      : "Recogida en tienda";

  const paymentText =
    input.paymentMethod === "wompi"
      ? "Pago en línea (Wompi)"
      : input.paymentMethod === "test"
      ? "Prueba Rápida (Test)"
      : "Transferencia bancaria / Nequi";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Confirmación de Pedido #${input.orderNumber} - Almacén Beirut</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0c0b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f5f0eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0d0c0b; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #171614; border: 1px solid #d4af37; border-radius: 8px; overflow: hidden; max-width: 600px; width: 100%;">
          <tr>
            <td align="center" style="padding: 30px; background-color: #11100e; border-bottom: 2px solid #d4af37;">
              <h1 style="margin: 0; color: #d4af37; font-size: 28px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">BEIRUT</h1>
              <p style="margin: 5px 0 0 0; color: #c4b5a5; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Delikatessen Beyrouth</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px 10px 40px; text-align: center;">
              <h2 style="margin: 0; color: #f5f0eb; font-size: 22px;">¡Gracias por tu compra, ${input.customerName}!</h2>
              <p style="margin: 10px 0 0 0; color: #d4af37; font-size: 16px; font-weight: 700; letter-spacing: 1px;">PEDIDO CONFIRMADO #${input.orderNumber}</p>
              <p style="margin: 10px 0 0 0; color: #a39688; font-size: 14px; line-height: 1.6;">Hemos recibido tu pedido correctamente. A continuación encuentras el resumen detallado de tu orden.</p>
            </td>
          </tr>
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
                ${input.notes ? `<tr><td style="color: #a39688; padding-bottom: 8px;">Notas:</td><td align="right" style="color: #f5f0eb; padding-bottom: 8px;">${input.notes}</td></tr>` : ""}
                <tr>
                  <td style="color: #d4af37; font-size: 16px; font-weight: 700; padding-top: 10px; border-top: 1px solid #383430;">TOTAL:</td>
                  <td align="right" style="color: #d4af37; font-size: 20px; font-weight: 800; padding-top: 10px; border-top: 1px solid #383430;">${formatCOP(input.total)}</td>
                </tr>
              </table>
            </td>
          </tr>
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

function generateStatusUpdateEmailHtml(input: StatusUpdateEmailInput): string {
  const label = STATUS_LABELS[input.newStatus] || input.newStatus;
  const color = STATUS_COLORS[input.newStatus] || "#d4af37";

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Actualización de Pedido #${input.orderNumber} - Almacén Beirut</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0d0c0b; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f5f0eb;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0d0c0b; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #171614; border: 1px solid #d4af37; border-radius: 8px; overflow: hidden; max-width: 600px; width: 100%;">
          <tr>
            <td align="center" style="padding: 30px; background-color: #11100e; border-bottom: 2px solid #d4af37;">
              <h1 style="margin: 0; color: #d4af37; font-size: 28px; font-weight: 800; letter-spacing: 3px; text-transform: uppercase;">BEIRUT</h1>
              <p style="margin: 5px 0 0 0; color: #c4b5a5; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Delikatessen Beyrouth</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; color: #f5f0eb; font-size: 20px;">Hola ${input.customerName},</h2>
              <p style="margin: 0 0 20px 0; color: #a39688; font-size: 15px; line-height: 1.6;">
                El estado de tu pedido <strong style="color: #d4af37;">#${input.orderNumber}</strong> ha cambiado.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td style="background-color: ${color}; color: #ffffff; font-size: 16px; font-weight: 800; padding: 14px 32px; border-radius: 6px; letter-spacing: 1px; text-transform: uppercase;">
                    ${label}
                  </td>
                </tr>
              </table>
              <p style="margin: 25px 0 0 0; color: #a39688; font-size: 14px; line-height: 1.6;">
                ${input.newStatus === "pendiente"
                  ? "Estamos verificando tu pedido. Te mantendremos informado."
                  : input.newStatus === "preparando"
                  ? "¡Buenas noticias! Tu pedido ya se está preparando con cuidado."
                  : input.newStatus === "despachado"
                  ? "Tu pedido sale de camino. ¡Pronto lo tendrás en tus manos!"
                  : "Lamentamos informarte que tu pedido ha sido cancelado. Si tienes dudas, contáctanos."}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px; background-color: #11100e; border-top: 1px solid #2a2826; text-align: center; color: #7a7065; font-size: 12px;">
              <p style="margin: 0 0 5px 0;">Almacén Beirut · Cra. 43 #84-26, Barranquilla</p>
              <p style="margin: 0 0 5px 0;">Si tienes dudas, contáctanos al WhatsApp +57 312 852 7325</p>
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

/** Envía un correo usando Resend API. */
async function resendFetch(subject: string, html: string, to: string): Promise<boolean> {
  const apiKey = process.env.REACT_APP_RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: SENDER_EMAIL,
        to: [to],
        subject,
        html,
      }),
    });

    if (res.ok) {
      console.log(`[Email] Correo enviado a ${to} vía Resend`);
      return true;
    }
    const err = await res.json();
    console.warn("[Email Resend Error]", err);
  } catch (err) {
    console.error("[Email Resend exception]", err);
  }
  return false;
}

/** Envía correo de confirmación de pedido al cliente. */
export async function sendOrderConfirmationEmail(input: OrderEmailInput): Promise<boolean> {
  if (!input.customerEmail) return false;
  const subject = `¡Pedido Confirmado #${input.orderNumber}! - Almacén Beirut`;
  const html = generateOrderEmailHtml(input);
  return resendFetch(subject, html, input.customerEmail);
}

/** Envía correo de actualización de estado al cliente. */
export async function sendStatusUpdateEmail(input: StatusUpdateEmailInput): Promise<boolean> {
  if (!input.customerEmail) return false;
  const label = STATUS_LABELS[input.newStatus] || input.newStatus;
  const subject = `Pedido #${input.orderNumber} — Estado: ${label} | Almacén Beirut`;
  const html = generateStatusUpdateEmailHtml(input);
  return resendFetch(subject, html, input.customerEmail);
}
