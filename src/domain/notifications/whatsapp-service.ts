import { buildOrderMessage, type OrderMessageInput } from "@domain/whatsapp/order-message";
import { SITE } from "@config/site";
import { supabase } from "@data/supabase/client";

/**
 * Envía la notificación de pedido en segundo plano directamente al dueño de la tienda (573128527325).
 * No abre ventanas emergentes ni links para el cliente; el mensaje se despacha silenciosamente.
 */
export async function sendOrderWhatsAppNotification(input: OrderMessageInput): Promise<boolean> {
  const message = buildOrderMessage(input);
  const recipient = SITE.whatsappNumber; // 573128527325
  let delivered = false;

  // 1. Invocar Edge Function de Supabase si está disponible
  if (supabase) {
    try {
      const { data, error } = await supabase.functions.invoke("notify-order-whatsapp", {
        body: {
          recipient,
          message,
          order: input,
        },
      });
      if (!error && data?.success) {
        console.log(`[WhatsApp Auto] Notificación enviada al dueño (${recipient}) en segundo plano.`);
        delivered = true;
      }
    } catch {
      // Edge Function no desplegado — se ignora silenciosamente
    }
  }

  // 2. Si hay URL de Webhook de WhatsApp configurada (n8n, UltraMsg, Twilio, etc.), notificar
  const webhookUrl = process.env.REACT_APP_WHATSAPP_WEBHOOK_URL || process.env.REACT_APP_ORDER_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient,
          phone: recipient,
          message,
          orderNumber: input.orderNumber,
          order: input,
        }),
      });
      if (res.ok) {
        console.log(`[WhatsApp Webhook] Notificación de pedido #${input.orderNumber} enviada al backend.`);
        delivered = true;
      }
    } catch (err) {
      console.warn("[WhatsApp Webhook Error]", err);
    }
  }

  return delivered;
}
