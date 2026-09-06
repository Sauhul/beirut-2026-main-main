import { formatCOP } from "@shared/utils/format";

export type OrderMessageInput = {
  orderNumber: number;
  name: string;
  phone: string;
  deliveryMethod: "domicilio" | "recogida";
  address?: string;
  city?: string;
  notes?: string;
  paymentMethod: string;
  lines: { name: string; quantity: number; lineTotal: number }[];
  total: number;
};

const PAYMENT_LABELS: Record<string, string> = {
  wompi: "Pago en línea (tarjeta / PSE / Nequi)",
  transferencia: "Transferencia bancaria / Nequi",
};

export function buildOrderMessage(o: OrderMessageInput) {
  const items = o.lines
    .map((l) => `• ${l.quantity} x ${l.name} — ${formatCOP(l.lineTotal)}`)
    .join("\n");

  const entrega =
    o.deliveryMethod === "domicilio"
      ? `Domicilio: ${o.address ?? ""}${o.city ? `, ${o.city}` : ""}`
      : "Recogida en tienda";

  return [
    `*NUEVO PEDIDO BEIRUT #${o.orderNumber}*`,
    "",
    "*Productos*",
    items,
    "",
    `*Total:* ${formatCOP(o.total)}`,
    "",
    "*Cliente*",
    `Nombre: ${o.name}`,
    `Teléfono: ${o.phone}`,
    entrega,
    `Pago: ${PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}`,
    o.notes ? `Notas: ${o.notes}` : "",
    "",
    "Pedido generado desde beirut.com",
  ]
    .filter(Boolean)
    .join("\n");
}
