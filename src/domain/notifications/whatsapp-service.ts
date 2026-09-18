import { buildOrderMessage, type OrderMessageInput } from "@domain/whatsapp/order-message";
import { SITE } from "@config/site";

/**
 * Envía la notificación de pedido al dueño de la tienda (573128527325).
 * Construye el mensaje de WhatsApp y abre el link directamente.
 */
export function sendOrderWhatsAppNotification(input: OrderMessageInput): void {
  const message = buildOrderMessage(input);
  const recipient = SITE.whatsappNumber;
  const url = `https://wa.me/${recipient}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
  console.log(`[WhatsApp] Abriento chat con ${recipient} para pedido #${input.orderNumber}`);
}
