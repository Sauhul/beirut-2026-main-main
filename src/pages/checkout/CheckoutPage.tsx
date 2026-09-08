import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Loader2, MessageCircle, Truck, ShieldCheck } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { useCart } from "@domain/cart/use-cart";
import { formatCOP, titleCase } from "@shared/utils/format";
import { formatPresentation } from "@shared/utils/product-format";
import { createOrder, type PaymentMethod, type CreatedOrder } from "@domain/orders/order-service";
import { openWompiCheckout } from "@domain/payments/wompi";
import { notifyOrderWebhook } from "@domain/orders/order-webhook";
import { buildOrderMessage } from "@domain/whatsapp/order-message";
import { whatsappLink } from "@config/site";
import { inputClass } from "@shared/utils/input-class";
import { checkoutSchema, type CheckoutForm } from "./checkout.schema";
import { usePageTitle } from "@hooks/usePageTitle";
import { getMotionQuality } from "@hooks/useAnimationQuality";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  sub: string;
}[] = [
  { value: "wompi", label: "Pago en línea", sub: "Tarjeta, PSE, Nequi — procesado por Wompi" },
  {
    value: "transferencia",
    label: "Transferencia / Nequi",
    sub: "Te enviamos los datos por WhatsApp",
  },
];

function finalizeByWhatsapp(order: CreatedOrder, data: CheckoutForm, extra?: string) {
  const message = buildOrderMessage({
    orderNumber: order.orderNumber,
    name: data.customer_name,
    phone: data.customer_phone,
    deliveryMethod: data.delivery_method,
    address: data.address || undefined,
    city: data.city || undefined,
    notes: [data.notes, extra].filter(Boolean).join(" · ") || undefined,
    paymentMethod: data.payment_method,
    lines: order.lines,
    total: order.total,
  });

  window.open(whatsappLink(message), "_blank", "noopener");
}

export function CheckoutPage() {
  usePageTitle("Finalizar compra · Beirut");
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      delivery_method: "domicilio",
      payment_method: "wompi",
      address: "",
      city: "",
      customer_email: "",
      notes: "",
    },
  });

  const delivery = watch("delivery_method");

  useGSAP(
    () => {
      const motion = getMotionQuality();
      gsap.set(".checkout-motion", { autoAlpha: 1 });
      if (motion === "minimal") return;

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".checkout-title", { y: 36, autoAlpha: 0, duration: 0.78 })
        .from(
          ".checkout-fieldset",
          { y: 26, autoAlpha: 0, stagger: 0.06, duration: 0.52 },
          "-=0.42",
        )
        .from(".checkout-summary", { x: 36, autoAlpha: 0, scale: 0.96, duration: 0.78 }, "-=0.32");
    },
    { scope: containerRef, dependencies: [items.length], revertOnUpdate: true },
  );

  if (items.length === 0) {
    return (
      <div className="route-page mx-auto max-w-xl px-5 py-28 text-center">
        <p className="font-display text-4xl text-sand">Tu carrito está vacío</p>
        <Link to="/tienda" className="btn-gold mx-auto mt-8 max-w-max">
          Ver productos
        </Link>
      </div>
    );
  }

  async function onSubmit(data: CheckoutForm) {
    setSubmitting(true);
    const sendToWebhook = (
      order: CreatedOrder,
      paymentStatus: "aprobado" | "pendiente" | "rechazado",
      wompiTransactionId?: string | null,
    ) => {
      notifyOrderWebhook({
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        createdAt: new Date().toISOString(),
        customer: {
          name: data.customer_name,
          phone: data.customer_phone,
          email: data.customer_email || undefined,
        },
        delivery: {
          method: data.delivery_method,
          address: data.address || undefined,
          city: data.city || undefined,
          notes: data.notes || undefined,
        },
        paymentMethod: data.payment_method,
        paymentStatus,
        wompiTransactionId: wompiTransactionId ?? null,
        total: order.total,
        lines: order.lines,
      });
    };

    try {
      const order = await createOrder({
        ...data,
        customer_email: data.customer_email || undefined,
        address: data.address || undefined,
        city: data.city || undefined,
        notes: data.notes || undefined,
        items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
      });

      if (data.payment_method === "wompi") {
        try {
          const result = await openWompiCheckout({
            reference: `ORDER-${order.orderNumber}-${order.orderId}`,
            amountInCents: Math.round(order.total * 100),
            customerEmail: data.customer_email,
            customerName: data.customer_name,
            customerPhone: data.customer_phone,
          });

          if (result.status === "UNKNOWN" && !result.transactionId) {
            toast.info("Cerraste la pasarela de pago. Tu pedido sigue guardado, puedes intentar de nuevo.");
            return;
          }

          clear();

          if (result.status === "APPROVED") {
            sendToWebhook(order, "aprobado", result.transactionId);
            finalizeByWhatsapp(order, data, `Transacción Wompi: ${result.transactionId}`);
            navigate(`/pedido-confirmado?numero=${order.orderNumber}`);
          } else if (result.status === "PENDING") {
            sendToWebhook(order, "pendiente", result.transactionId);
            finalizeByWhatsapp(
              order,
              data,
              `Pago pendiente en Wompi (transacción ${result.transactionId})`,
            );
            navigate(`/pedido-confirmado?numero=${order.orderNumber}`);
          } else {
            sendToWebhook(order, "rechazado", result.transactionId);
            toast.error(`El pago no fue aprobado (${result.status}). Tu pedido quedó registrado.`);
            navigate(`/pedido-confirmado?numero=${order.orderNumber}`);
          }
          return;
        } catch (error) {
          console.error("[Wompi checkout error]", error);
          const msg = error instanceof Error ? error.message : "";
          if (msg.includes("REACT_APP_WOMPI_PUBLIC_KEY")) {
            toast.error("LA PASARELA DE PAGO NO ESTÁ CONFIGURADA. CONTACTA AL ADMINISTRADOR.");
          } else if (msg.includes("widget de Wompi")) {
            toast.error("NO SE PUDO CARGAR LA PASARELA DE PAGO. VERIFICA TU CONEXIÓN E INTENTA DE NUEVO.");
          } else {
            toast.error("NO PUDIMOS ABRIR LA PASARELA DE PAGO. INTENTA DE NUEVO.");
          }
          return;
        }
      }

      clear();
      sendToWebhook(order, "pendiente");
      finalizeByWhatsapp(order, data);
      navigate(`/pedido-confirmado?numero=${order.orderNumber}`);
    } catch (error) {
      console.error(error);
      toast.error("No pudimos registrar tu pedido. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={containerRef} className="route-page mx-auto max-w-7xl px-5 pb-24 pt-10">
      <div className="checkout-title checkout-motion border-b border-border pb-8 mb-10">
        <p className="eyebrow">Paso final</p>
        <h1 className="mt-3 font-display text-5xl text-sand">Finalizar compra</h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          const firstError = Object.values(errors)[0];
          if (firstError?.message) {
            toast.error((firstError.message as string).toUpperCase());
          } else {
            toast.error("REVISA LOS CAMPOS MARCADOS EN ROJO");
          }
        })}
        noValidate
        className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]"
      >
        <div className="space-y-6">
          <fieldset className="checkout-fieldset checkout-motion card-onyx p-6">
            <legend className="px-2 eyebrow">Tus datos</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Nombre completo
                <input {...register("customer_name")} maxLength={100} className={inputClass} />
                {errors.customer_name && (
                  <span className="mt-1 block text-xs text-destructive">
                    {errors.customer_name.message}
                  </span>
                )}
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Teléfono / WhatsApp
                <input {...register("customer_phone")} maxLength={30} className={inputClass} />
                {errors.customer_phone && (
                  <span className="mt-1 block text-xs text-destructive">
                    {errors.customer_phone.message}
                  </span>
                )}
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground sm:col-span-2">
                Correo electrónico (opcional)
                <input
                  {...register("customer_email")}
                  type="email"
                  maxLength={150}
                  className={inputClass}
                />
                {errors.customer_email && (
                  <span className="mt-1 block text-xs text-destructive">
                    {errors.customer_email.message}
                  </span>
                )}
              </label>
            </div>
          </fieldset>

          <fieldset className="checkout-fieldset checkout-motion card-onyx p-6">
            <legend className="px-2 eyebrow">Entrega</legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="flex flex-wrap gap-3">
                  <label className="flex cursor-pointer items-center gap-2 border border-input px-5 py-3 text-[0.65rem] font-bold tracking-[0.18em] uppercase transition has-[:checked]:border-gold has-[:checked]:bg-gold/10 hover:border-gold">
                    <input
                      type="radio"
                      {...register("delivery_method")}
                      value="domicilio"
                      className="sr-only"
                    />
                    <Truck className="h-4 w-4 text-gold" /> A domicilio
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 border border-input px-5 py-3 text-[0.65rem] font-bold tracking-[0.18em] uppercase transition has-[:checked]:border-gold has-[:checked]:bg-gold/10 hover:border-gold">
                    <input
                      type="radio"
                      {...register("delivery_method")}
                      value="tienda"
                      className="sr-only"
                    />
                    <Truck className="h-4 w-4 text-gold" /> Recoger en tienda
                  </label>
                </div>
              </div>
              {delivery === "domicilio" && (
                <>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground sm:col-span-2">
                    Dirección
                    <input {...register("address")} maxLength={200} className={inputClass} />
                    {errors.address && (
                      <span className="mt-1 block text-xs text-destructive">
                        {errors.address.message}
                      </span>
                    )}
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Ciudad
                    <input {...register("city")} maxLength={100} className={inputClass} />
                    {errors.city && (
                      <span className="mt-1 block text-xs text-destructive">{errors.city.message}</span>
                    )}
                  </label>
                </>
              )}
            </div>
          </fieldset>

          <fieldset className="checkout-fieldset checkout-motion card-onyx p-6">
            <legend className="px-2 eyebrow">Pago</legend>
            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="group flex cursor-pointer items-center gap-3 border border-input px-5 py-4 transition has-[:checked]:border-gold has-[:checked]:bg-gold/10 hover:border-gold"
                >
                  <input
                    type="radio"
                    {...register("payment_method")}
                    value={opt.value}
                    className="sr-only"
                  />
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-gold/40 group-has-[:checked]:border-gold">
                    <div className="h-2.5 w-2.5 scale-0 rounded-full bg-gold transition-transform group-has-[:checked]:scale-100" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sand">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="checkout-fieldset checkout-motion card-onyx p-6">
            <legend className="px-2 eyebrow">Notas (opcional)</legend>
            <textarea {...register("notes")} maxLength={300} rows={3} className={inputClass} />
          </fieldset>
        </div>

        <div className="checkout-summary checkout-motion sticky top-24 self-start">
          <div className="border border-border bg-card p-8 shadow-[var(--shadow-soft)]">
            <h2 className="font-display text-2xl text-sand">Resumen</h2>
            <ul className="mt-6 divide-y divide-border">
              {items.map((item) => (
                <li key={item.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold text-sand truncate">{titleCase(item.name)}</p>
                    <p className="text-xs text-muted-foreground">{formatPresentation(item.unit)}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-display text-sand text-right">
                      {formatCOP(item.price * item.quantity)}
                    </span>
                    <span className="text-xs text-muted-foreground">x {item.quantity}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between border-t border-border pt-6 text-xl">
              <span className="text-sand">Total</span>
              <span className="font-display text-3xl text-gold">{formatCOP(subtotal)}</span>
            </div>
            <div className="mt-4 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Pago seguro
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-3.5 w-3.5 text-gold" /> Envío calculado al confirmar
              </li>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold w-full mt-7 py-4 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Confirmar y pagar
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}