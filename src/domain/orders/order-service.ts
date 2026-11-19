/** Creación de pedidos mediante la RPC de Supabase. */
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

/** Registra el pedido y devuelve los datos para el checkout. */
export async function createOrder(input: CreateOrderInput): Promise<CreatedOrder> {
  if (!supabase) throw new Error("Supabase no está configurado");
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

  if (!resolvedLines.length || resolvedLines.length !== input.items.length) throw new Error("No se encontraron los productos del pedido");

  const { items, ...customer } = input;
  const { data, error } = await supabase.rpc("create_order", {
    p_order: {
      ...customer,
      items: items.map(({ id, quantity }) => ({ product_id: id, quantity })),
    },
  });

  if (error || !data?.id || !data?.order_number) {
    throw new Error(error?.message ?? "Supabase no devolvió el pedido");
  }

  return {
    orderId: data.id,
    orderNumber: Number(data.order_number),
    total: resolvedLines.reduce((sum, line) => sum + line.lineTotal, 0),
    lines: resolvedLines.map(({ name, quantity, lineTotal }) => ({ name, quantity, lineTotal })),
  };
}
