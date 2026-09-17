import { useEffect, useMemo, useState } from "react";
import { Clock, PackageCheck, Truck, RefreshCw, Archive, FileText, Phone, MapPin, CreditCard, Trash2, X } from "lucide-react";
import { supabase } from "@data/supabase/client";
import { formatCOP, titleCase } from "@shared/utils/format";
import { sendStatusUpdateEmail } from "@domain/notifications/email-service";
import { toast } from "sonner";
import type { OrderItemRow, OrderRow } from "./admin.types";

const STATUS_BUTTONS: {
  status: string;
  label: string;
  color: string;
  icon: typeof Clock;
}[] = [
  { status: "pendiente", label: "Pendiente", color: "bg-amber-500/20 text-amber-400 border-amber-500/40", icon: Clock },
  { status: "preparando", label: "En Preparación", color: "bg-blue-500/20 text-blue-400 border-blue-500/40", icon: RefreshCw },
  { status: "despachado", label: "Despachado", color: "bg-purple-500/20 text-purple-400 border-purple-500/40", icon: Truck },
];

export function OrdersManager() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [archivedOrders, setArchivedOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewArchived, setViewArchived] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  async function loadData() {
    if (!supabase) return;
    setLoading(true);
    try {
      const [{ data: ords }, { data: its }] = await Promise.all([
        supabase.from("orders").select("*").order("created_at", { ascending: false }),
        supabase.from("order_items").select("order_id, product_name, quantity, line_total"),
      ]);

      const allOrders = (ords as OrderRow[]) ?? [];
      const allItems = (its as OrderItemRow[]) ?? [];

      const now = new Date().getTime();
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      const NINETY_DAYS = 90 * 24 * 60 * 60 * 1000;

      const activeList: OrderRow[] = [];
      const archiveList: OrderRow[] = [];

      allOrders.forEach((o) => {
        const age = now - new Date(o.created_at).getTime();
        if (age < THIRTY_DAYS) {
          activeList.push(o);
        } else if (age < NINETY_DAYS) {
          archiveList.push(o);
        }
      });

      setOrders(activeList);
      setArchivedOrders(archiveList);
      setItems(allItems);
    } catch (err) {
      console.error("[Admin Orders]", err);
      toast.error("Error cargando los pedidos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
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

  async function handleStatusChange(orderId: string, newStatus: string) {
    if (!supabase) return;
    setUpdatingId(orderId);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;

      // Actualizar estado local
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      setArchivedOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );

      // Enviar correo de actualización al cliente
      const allOrders = [...orders, ...archivedOrders];
      const order = allOrders.find((o) => o.id === orderId);
      if (order?.customer_email) {
        void sendStatusUpdateEmail({
          orderNumber: order.order_number,
          customerEmail: order.customer_email,
          customerName: order.customer_name,
          newStatus,
        });
      }

      toast.success(`Pedido actualizado a "${newStatus.toUpperCase()}"`);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo actualizar el estado. Verifica la consola.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(orderId: string) {
    if (!supabase) return;
    setUpdatingId(orderId);
    try {
      // Primero eliminar los items del pedido
      const { error: itemsError } = await supabase
        .from("order_items")
        .delete()
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      // Luego eliminar el pedido
      const { error: orderError } = await supabase
        .from("orders")
        .delete()
        .eq("id", orderId);

      if (orderError) throw orderError;

      // Actualizar el estado local
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setArchivedOrders((prev) => prev.filter((o) => o.id !== orderId));
      setConfirmDelete(null);
      toast.success("Pedido eliminado correctamente");
    } catch (err) {
      console.error(err);
      toast.error("No se pudo eliminar el pedido. Verifica la consola.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">
        <RefreshCw className="mx-auto h-6 w-6 animate-spin text-gold mb-2" />
        Cargando panel de pedidos...
      </div>
    );
  }

  const currentList = viewArchived ? archivedOrders : orders;

  return (
    <div className="space-y-6">
      {/* Barra de estado */}
      <div className="flex flex-wrap items-center justify-between gap-4 card-onyx p-4 border-l-4 border-gold">
        <div>
          <h2 className="font-display text-xl text-sand">
            {viewArchived ? "Archivador de Resguardo (1 a 3 meses)" : "Pedidos Activos (Mes en curso)"}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {viewArchived
              ? "Resguardo automático de pedidos anteriores (se eliminan definitivamente a los 90 días)."
              : "Visión clara para el personal de despacho. Los pedidos se archivan automáticamente tras 30 días."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewArchived(!viewArchived)}
            className={`btn-outline-gold !py-2 !px-4 text-xs flex items-center gap-2 ${
              viewArchived ? "!bg-gold !text-primary-foreground font-bold" : ""
            }`}
          >
            <Archive className="h-4 w-4" />
            {viewArchived
              ? `Ver Pedidos del Mes (${orders.length})`
              : `Backup / Resguardo (${archivedOrders.length})`}
          </button>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="card-onyx p-6 max-w-sm w-full border border-red-500/40 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-full bg-red-500/20 p-2">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="font-display text-lg text-sand">Eliminar Pedido</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Esta acción es <strong className="text-red-400">irreversible</strong>. Se eliminará el pedido y todos sus items de la base de datos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-outline-gold flex-1 !py-2 text-xs flex items-center justify-center gap-2"
              >
                <X className="h-4 w-4" /> Cancelar
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                disabled={updatingId === confirmDelete}
                className="flex-1 !py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-2"
              >
                {updatingId === confirmDelete ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {currentList.length === 0 ? (
        <div className="card-onyx py-16 text-center text-muted-foreground space-y-3">
          <FileText className="mx-auto h-10 w-10 text-gold/40" />
          <p className="text-base font-medium text-sand">
            {viewArchived
              ? "No hay pedidos en el resguardo de 1 a 3 meses."
              : "No hay pedidos nuevos en este mes."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {currentList.map((o) => {
            const orderItems = itemsByOrder.get(o.id) ?? [];
            const currentStatus = o.status || "pendiente";

            return (
              <article
                key={o.id}
                className="card-onyx p-6 flex flex-col justify-between border border-border/80 hover:border-gold/50 transition-colors shadow-lg"
              >
                <div>
                  {/* Cabecera del pedido */}
                  <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4">
                    <div>
                      <span className="eyebrow text-gold font-bold">Orden #{o.order_number}</span>
                      <h3 className="font-display text-2xl text-sand mt-0.5">{o.customer_name}</h3>
                      <p className="text-[0.7rem] text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Clock className="h-3 w-3 text-gold" />
                        {new Date(o.created_at).toLocaleString("es-CO", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2">
                      <div>
                        <span className="text-xs text-muted-foreground block uppercase font-bold tracking-wider">Total</span>
                        <span className="font-display text-2xl text-gold">{formatCOP(o.total)}</span>
                      </div>
                      {/* Botón eliminar */}
                      <button
                        onClick={() => setConfirmDelete(o.id)}
                        disabled={updatingId === o.id}
                        className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/30 transition-colors"
                        title="Eliminar este pedido"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Datos del Cliente y Envío */}
                  <div className="mt-4 grid gap-2 text-xs text-sand/90 bg-background/50 p-3 rounded border border-border/40">
                    <p className="flex items-center gap-2 font-medium">
                      <Phone className="h-3.5 w-3.5 text-gold shrink-0" />
                      <a href={`https://wa.me/${o.customer_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-gold">
                        {o.customer_phone} (WhatsApp)
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                      {o.delivery_method === "domicilio"
                        ? `Domicilio: ${o.address || ""}${o.city ? `, ${o.city}` : ""}`
                        : "Recogida en tienda"}
                    </p>
                    <p className="flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5 text-gold shrink-0" />
                      Pago: <span className="uppercase font-bold text-gold">{o.payment_method}</span>
                    </p>
                  </div>

                  {/* Lista de Productos */}
                  <div className="mt-4">
                    <p className="text-[0.68rem] font-bold uppercase tracking-widest text-gold mb-2">
                      Productos ({orderItems.reduce((acc, i) => acc + i.quantity, 0)} items):
                    </p>
                    <ul className="divide-y divide-border/40 bg-onyx/80 rounded border border-border/40 px-3 py-1">
                      {orderItems.length === 0 ? (
                        <li className="py-2 text-xs text-muted-foreground italic">Sin detalle de items.</li>
                      ) : (
                        orderItems.map((i, idx) => (
                          <li key={idx} className="py-2 flex items-center justify-between text-xs">
                            <span className="font-medium text-sand">
                              <strong className="text-gold font-bold text-sm mr-2">{i.quantity}x</strong>
                              {titleCase(i.product_name)}
                            </span>
                            <span className="text-muted-foreground font-mono">{formatCOP(i.line_total)}</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                </div>

                {/* Botones de Estado */}
                <div className="mt-6 border-t border-border/60 pt-4">
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Estado del Pedido:
                  </p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {STATUS_BUTTONS.map((b) => {
                      const isActive = currentStatus.toLowerCase() === b.status;
                      const Icon = b.icon;

                      return (
                        <button
                          key={b.status}
                          disabled={updatingId === o.id}
                          onClick={() => handleStatusChange(o.id, b.status)}
                          className={`flex flex-col items-center justify-center p-2 rounded text-[0.68rem] font-bold transition-all border ${
                            isActive
                              ? `${b.color} ring-2 ring-gold scale-105 font-extrabold shadow-md`
                              : "border-border bg-onyx/40 text-muted-foreground hover:border-gold/50 hover:text-sand"
                          }`}
                        >
                          <Icon className={`h-4 w-4 mb-1 ${isActive ? "text-gold" : ""}`} />
                          {b.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
