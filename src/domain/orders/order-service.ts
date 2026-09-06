/**
 * Creación de pedidos.
 * Los precios siempre se resuelven contra el catálogo (nunca desde el carrito).
 *
 * Persistencia:
 *  - Con Supabase configurado: el pedido se guarda en las tablas orders/order_items
 *    y el número de pedido lo asigna la base de datos.
 *  - Sin Supabase (o si falla): se usa un contador local en localStorage.
 */
import { getCatalog } from "@domain/catalog/service";
import { supabase } from "@data/supabase/client";

export type OrderLine = {
  name: string;
  quantity: number;
  lineTotal: number;
};

export type PaymentMethod = "wompi" | "transferencia";

export type CreateOrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_method: "domicilio" | "recogida";
  address?: string;
  city?: string;
  notes?: string;
  payment_method: PaymentMethod;
  items: { id: string; quantity: number }[];
};

export type CreatedOrder = {
  orderId: string;
  orderNumber: number;
  total: number;
  lines: OrderLine[];
};

const ORDERS_KEY = "beirut-orders-v1";
const COUNTER_KEY = "beirut-order-counter-v1";

function nextLocalOrderNumber(): number {
  const current = Number(localStorage.getItem(COUNTER_KEY) ?? "1000");
  const next = Number.isFinite(current) && current >= 1000 ? current + 1 : 1001;
  localStorage.setItem(COUNTER_KEY, String(next));
  return next;
}

type ResolvedOrder = {
  orderId: string;
  createdAt: string;
  input: CreateOrderInput;
  lines: (OrderLine & { productId: string; unitPrice: number })[];
  total: number;
};

async function persistToSupabase(order: ResolvedOrder): Promise<number | null> {
  if (!supabase) return null;

  // La BD asigna el número de pedido vía la función create_order (SECURITY DEFINER).
  const { data, error } = await supabase.rpc("create_order", {
    p_order: {
      customer_name: order.input.customer_name,
      customer_phone: order.input.customer_phone,
      customer_email: order.input.customer_email || null,
      delivery_method: order.input.delivery_method,
      address: order.input.address || null,
      city: order.input.city || null,
      notes: order.input.notes || null,
      payment_method: order.input.payment_method,
      total: order.total,
      items: order.lines.map((l) => ({
        product_id: l.productId || null,
        product_name: l.name,
        unit_price: l.unitPrice,
        quantity: l.quantity,
        line_total: l.lineTotal,
      })),
    },
  });

  if (error || !data) {
    console.error("[Pedidos] No se pudo guardar en Supabase:", error?.message);
    return null;
  }

  return Number(data.order_number);
}

function saveLocalCopy(orderNumber: number, order: ResolvedOrder) {
  try {
    const record = {
      id: order.orderId,
      order_number: orderNumber,
      created_at: order.createdAt,
      ...order.input,
      total: order.total,
      lines: order.lines,
      payment_status: "pendiente",
      status: "pendiente",
    };
    const raw = localStorage.getItem(ORDERS_KEY);
    const orders = raw ? (JSON.parse(raw) as unknown[]) : [];
    orders.push(record);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // Si localStorage falla, el pedido sigue siendo válido para WhatsApp/BD.
  }
}

/** Crea el pedido: resuelve precios, persiste en BD (si hay) y devuelve el resumen. */
export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  const { products } = await getCatalog();

  const resolvedLines = input.items.flatMap((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product || !product.in_stock) return [];
    return [
      {
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal: product.price * item.quantity,
      },
    ];
  });

  if (!resolvedLines.length) throw new Error("No se encontraron los productos del pedido");

  const order: ResolvedOrder = {
    orderId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    input,
    lines: resolvedLines,
    total: resolvedLines.reduce((sum, l) => sum + l.lineTotal, 0),
  };

  // La BD es la fuente de verdad del número de pedido; fallback: contador local.
  const dbOrderNumber = await persistToSupabase(order);
  const orderNumber = dbOrderNumber ?? nextLocalOrderNumber();

  saveLocalCopy(orderNumber, order);

  return {
    orderId: order.orderId,
    orderNumber,
    total: order.total,
    lines: resolvedLines.map(({ name, quantity, lineTotal }) => ({ name, quantity, lineTotal })),
  };
}
