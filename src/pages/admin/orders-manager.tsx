import { useEffect, useMemo, useState } from "react";
import { supabase } from "@data/supabase/client";
import { formatCOP, titleCase } from "@shared/utils/format";
import type { OrderItemRow, OrderRow } from "./admin.types";

/* ── Pedidos ───────────────────────────────────────────────── */

export function OrdersManager() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    void (async () => {
      setLoading(true);
      const [{ data: ords }, { data: its }] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("order_items").select("order_id, product_name, quantity, line_total"),
      ]);
      setOrders((ords as OrderRow[]) ?? []);
      setItems((its as OrderItemRow[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const itemsByOrder = useMemo(() => {
    const map = new Map<string, OrderItemRow[]>();
    items.forEach((i) => {
      const list = map.get(i.order_id) ?? [];
      list.push(i);
      map.set(i.order_id, list);
    });
    return map;
  }, [items]);

  if (loading) return <p className="text-sm text-muted-foreground">Cargando…</p>;

  if (orders.length === 0)
    return (
      <p className="py-16 text-center text-sm text-muted-foreground">Todavía no hay pedidos.</p>
    );

  return (
    <div className="space-y-4">
      {orders.map((o) => (
        <article key={o.id} className="card-onyx p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-display text-lg text-sand">Pedido #{o.order_number}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleString("es-CO")}
              </p>
            </div>
          </div>
          <div className="mt-3 grid gap-1 text-xs text-muted-foreground md:grid-cols-2">
            <p>
              <strong className="text-sand">{o.customer_name}</strong> · {o.customer_phone}
            </p>
            <p>
              {o.delivery_method === "domicilio"
                ? `Domicilio: ${o.address ?? ""}${o.city ? `, ${o.city}` : ""}`
                : "Recogida en tienda"}{" "}
              · Pago: {o.payment_method}
            </p>
          </div>
          <ul className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
            {(itemsByOrder.get(o.id) ?? []).map((i, idx) => (
              <li key={idx} className="flex justify-between py-0.5">
                <span>
                  {i.quantity} × {titleCase(i.product_name)}
                </span>
                <span className="font-display text-sand">{formatCOP(i.line_total)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-right font-display text-xl text-gold">{formatCOP(o.total)}</p>
        </article>
      ))}
    </div>
  );
}