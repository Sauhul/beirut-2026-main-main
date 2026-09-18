/**
 * Envío del pedido a un webhook externo (n8n, Make, backend propio…).
 * Configura la URL en REACT_APP_ORDER_WEBHOOK_URL (.env).
 *
 * Es "fire and forget": si el webhook falla o no está configurado, el flujo
 * de WhatsApp y la confirmación siguen funcionando igual.
 */

export type OrderWebhookPayload = {
  orderId: string;
  orderNumber: number;
  createdAt: string;
  customer: { name: string; phone: string; email?: string };
  delivery: {
    method: "domicilio" | "recogida";
    address?: string;
    city?: string;
    notes?: string;
  };
  paymentMethod: "wompi" | "transferencia" | "test";
  paymentStatus: "aprobado" | "pendiente" | "rechazado";
  wompiTransactionId?: string | null;
  total: number;
  formattedTotal: string;
  lines: { name: string; quantity: number; lineTotal: number; formattedLineTotal: string }[];
};

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function notifyOrderWebhook(payload: OrderWebhookPayload): Promise<boolean> {
  const url = process.env.REACT_APP_ORDER_WEBHOOK_URL;
  if (!url) return Promise.resolve(false);

  return fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  })
    .then((res) => {
      if (!res.ok) throw new Error(`Webhook respondió ${res.status}`);
      return true;
    })
    .catch((err) => {
      console.error("[Order webhook]", err);
      return false;
    });
}
