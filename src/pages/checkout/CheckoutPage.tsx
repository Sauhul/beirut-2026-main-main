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
import { formatCOP } from "@shared/utils/format";
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
  const paymentMethod = watch("payment_method");

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
        <p className="font-script text-5xl text-primary">Tu carrito está vacío</p>
        <Link to="/tienda" className="liquid-button mx-auto mt-8 max-w-max">
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
    <div ref={containerRef} className="route-page checkout-lab mx-auto max-w-7xl px-5 pb-24 pt-10">
      <h1 className="checkout-title checkout-motion display-slab">Finalizar compra</h1>

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
          <fieldset className="checkout-fieldset checkout-motion rounded-[2rem] border border-foreground/10 bg-background/70 p-6 backdrop-blur-xl">
            <legend className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Tus datos
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium">
                Nombre completo
                <input {...register("customer_name")} maxLength={100} className={inputClass} />
                {errors.customer_name && (
                  <span className="mt-1 block text-xs text-coral">
                    {errors.customer_name.message}
                  </span>
                )}
              </label>
              <label className="block text-sm font-medium">
                Teléfono / WhatsApp
                <input {...register("customer_phone")} maxLength={30} className={inputClass} />
                {errors.customer_phone && (
                  <span className="mt-1 block text-xs text-coral">
                    {errors.customer_phone.message}
                  </span>
                )}
              </label>
              <label className="block text-sm font-medium sm:col-span-2">
                Correo electrónico (opcional)
                <input
                  {...register("customer_email")}
                  type="email"
                  maxLength={150}
                  className={inputClass}
                />
                {errors.customer_email && (
                  <span className="mt-1 block text-xs text-coral">
                    {errors.customer_email.message}
                  </span>
                )}
              </label>
            </div>
          </fieldset>

          <fieldset className="checkout-fieldset checkout-motion rounded-[2rem] border border-foreground/10 bg-background/70 p-6 backdrop-blur-xl">
            <legend className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Entrega
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="flex flex-wrap gap-3">
                  <label className="flex cursor-pointer items-center gap-2 rounded-full border border-foreground/10 px-5 py-3 text-sm font-black uppercase tracking-[0.13em] transition has-[:checked]:border-primary has-[:checked]:bg-primary/10 hover:border-primary">
                    <input
                      type="radio"
                      {...register("delivery_method")}
                      value="domicilio"
                      className="sr-only"
                    />
                    <Truck className="h-4 w-4 text-primary" /> A domicilio
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-full border border-foreground/10 px-5 py-3 text-sm font-black uppercase tracking-[0.13em] transition has-[:checked]:border-primary has-[:checked]:bg-primary/10 hover:border-primary">
                    <input
                      type="radio"
                      {...register("delivery_method")}
                      value="tienda"
                      className="sr-only"
                    />
                    <Truck className="h-4 w-4 text-primary" /> Recoger en tienda
                  </label>
                </div>
              </div>
              {delivery === "domicilio" && (
                <>
                  <label className="block text-sm font-medium sm:col-span-2">
                    Dirección
                    <input {...register("address")} maxLength={200} className={inputClass} />
                    {errors.address && (
                      <span className="mt-1 block text-xs text-coral">
                        {errors.address.message}
                      </span>
                    )}
                  </label>
                  <label className="block text-sm font-medium">
                    Ciudad
                    <input {...register("city")} maxLength={100} className={inputClass} />
                    {errors.city && (
                      <span className="mt-1 block text-xs text-coral">{errors.city.message}</span>
                    )}
                  </label>
                </>
              )}
            </div>
          </fieldset>

          <fieldset className="checkout-fieldset checkout-motion rounded-[2rem] border border-foreground/10 bg-background/70 p-6 backdrop-blur-xl">
            <legend className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Pago
            </legend>
            <div className="space-y-3">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="group flex cursor-pointer items-center gap-3 rounded-xl border border-foreground/10 px-5 py-4 transition has-[:checked]:border-primary has-[:checked]:bg-primary/10 hover:border-primary"
                >
                  <input
                    type="radio"
                    {...register("payment_method")}
                    value={opt.value}
                    className="sr-only"
                  />
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-foreground/30 transition has-[:checked]:border-primary group-has-[:checked]:border-primary">
                    <div className="h-2.5 w-2.5 scale-0 rounded-full bg-primary transition-transform group-has-[:checked]:scale-100" />
                  </div>
                  <div className="flex-1">
                    <p className="font-black">{opt.label}</p>
                    <p className="text-xs text-foreground/55">{opt.sub}</p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="checkout-fieldset checkout-motion rounded-[2rem] border border-foreground/10 bg-background/70 p-6 backdrop-blur-xl">
            <legend className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Notas (opcional)
            </legend>
            <textarea {...register("notes")} maxLength={300} rows={3} className={inputClass} />
          </fieldset>
        </div>

        <div className="checkout-summary checkout-motion sticky top-24 self-start">
          <div className="rounded-[2rem] border border-foreground/10 bg-background/80 p-8 backdrop-blur-xl shadow-[var(--shadow-soft)]">
            <h2 className="text-xl font-black uppercase tracking-[0.15em]">Resumen</h2>
            <ul className="mt-6 divide-y divide-foreground/10">
              {items.map((item) => (
                <li key={item.id} className="py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-bold truncate">{item.name}</p>
                    <p className="text-xs text-foreground/55">{formatPresentation(item.unit)}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="font-bold text-right">
                      {formatCOP(item.price * item.quantity)}
                    </span>
                    <span className="text-xs text-foreground/55">x {item.quantity}</span>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex items-center justify-between text-xl font-black">
              <span>Total</span>
              <span>{formatCOP(subtotal)}</span>
            </div>
            <div className="mt-4 space-y-2 text-xs text-foreground/55">
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-3 w-3 text-gold" /> Pago seguro
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-3 w-3 text-gold" /> Envío calculado al confirmar
              </li>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="liquid-button w-full mt-7 py-4 text-base"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <MessageCircle className="h-5 w-5" />
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
