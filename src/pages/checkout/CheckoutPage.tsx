import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Truck, ShieldCheck } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { supabase } from "@data/supabase/client";
import { useCart } from "@domain/cart/use-cart";
import { formatCOP, titleCase } from "@shared/utils/format";
import { formatPresentation } from "@shared/utils/product-format";
import {
  getWompiConfig,
  openWompiCheckout,
  prepareWompiOrder,
  type WompiCheckout,
} from "@domain/payments/wompi";
import { inputClass } from "@shared/utils/input-class";
import { checkoutSchema, type CheckoutForm } from "./checkout.schema";
import { usePageTitle } from "@hooks/usePageTitle";
import { getMotionQuality } from "@hooks/useAnimationQuality";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function CheckoutPage() {
  usePageTitle("Finalizar compra · Beirut");
  const { items, subtotal } = useCart();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const savedOrder = useRef<{ input: string; order: WompiCheckout } | null>(null);
  const { data: wompi, isPending: checkingWompi } = useQuery({
    queryKey: ["wompi-config"],
    queryFn: getWompiConfig,
    enabled: Boolean(supabase && items.length),
    retry: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      delivery_method: "domicilio",
      address: "",
      city: "",
      customer_name: "",
      customer_phone: "",
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
    if (submitting || items.length === 0) return;
    setSubmitting(true);

    try {
      if (!wompi?.ready) {
        toast.error("El pago con Wompi no está disponible en este momento.");
        return;
      }
      const input = {
        ...data,
        address: data.delivery_method === "domicilio" ? data.address : undefined,
        city: data.delivery_method === "domicilio" ? data.city : undefined,
        items: items.map(({ id, quantity }) => ({ product_id: id, quantity })),
      };
      const serialized = JSON.stringify(input);
      const cached = savedOrder.current;
      const order =
        cached?.input === serialized && Date.parse(cached.order.expirationTime) > Date.now()
          ? cached.order
          : await prepareWompiOrder(input);
      savedOrder.current = { input: serialized, order };
      if (order.amountInCents !== subtotal * 100) {
        toast.error("El total del catálogo cambió. Revisa el carrito actualizado antes de pagar.");
        return;
      }
      sessionStorage.setItem("beirut-pending-wompi", order.orderId);
      const result = await openWompiCheckout({
        ...order,
        customerEmail: data.customer_email,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
      });
      if (result.transactionId) {
        navigate(
          `/pedido-confirmado?${new URLSearchParams({ pedido: order.orderId, id: result.transactionId })}`,
        );
        return;
      }
      if (result.status !== "CLOSED") {
        toast.error("El pago no se completó. Puedes volver a abrir Wompi.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No pudimos procesar el pedido.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="route-page mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 md:px-10"
    >
      <div className="checkout-title checkout-motion border-b border-border pb-6 mb-6">
        <h1 className="font-display text-4xl text-sand sm:text-5xl">Finalizar compra</h1>
        <div className="mt-4 flex items-start gap-3">
          <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
          <div>
            <h2 className="font-semibold text-sand">Pago con Wompi</h2>
            <p role="status" className="mt-1 text-sm text-muted-foreground">
              {!supabase
                ? "El registro de pedidos no está disponible en este momento."
                : checkingWompi
                  ? "Comprobando disponibilidad…"
                  : wompi?.ready
                    ? wompi.sandbox
                      ? "Completa tus datos para abrir Wompi. Estás en modo de prueba y no habrá cobro real."
                      : "Completa tus datos para abrir la ventana segura de Wompi."
                    : "El pago con Wompi no está disponible en este momento."}
            </p>
          </div>
        </div>
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
        className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]"
      >
        <div className="space-y-6">
          <fieldset className="checkout-fieldset checkout-motion card-onyx p-4 sm:p-6">
            <legend className="px-2 eyebrow">Tus datos</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground w-full">
                Nombre completo *
                <input
                  {...register("customer_name")}
                  autoComplete="name"
                  maxLength={80}
                  className={`${inputClass} mt-1`}
                />
                {errors.customer_name && (
                  <span className="mt-1 block text-xs text-destructive">
                    {errors.customer_name.message}
                  </span>
                )}
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground w-full">
                Teléfono / WhatsApp *
                <input
                  {...register("customer_phone")}
                  type="tel"
                  autoComplete="tel"
                  maxLength={15}
                  className={`${inputClass} mt-1`}
                />
                {errors.customer_phone && (
                  <span className="mt-1 block text-xs text-destructive">
                    {errors.customer_phone.message}
                  </span>
                )}
              </label>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground sm:col-span-2 w-full">
                Correo electrónico *
                <input
                  {...register("customer_email")}
                  type="email"
                  autoComplete="email"
                  maxLength={150}
                  className={`${inputClass} mt-1`}
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
                      value="recogida"
                      className="sr-only"
                    />
                    <Truck className="h-4 w-4 text-gold" /> Recoger en tienda
                  </label>
                </div>
              </div>
              {delivery === "domicilio" && (
                <>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground sm:col-span-2">
                    Dirección *
                    <input
                      {...register("address")}
                      autoComplete="street-address"
                      maxLength={200}
                      className={inputClass}
                    />
                    {errors.address && (
                      <span className="mt-1 block text-xs text-destructive">
                        {errors.address.message}
                      </span>
                    )}
                  </label>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Ciudad *
                    <input
                      {...register("city")}
                      autoComplete="address-level2"
                      maxLength={100}
                      className={inputClass}
                    />
                    {errors.city && (
                      <span className="mt-1 block text-xs text-destructive">
                        {errors.city.message}
                      </span>
                    )}
                  </label>
                </>
              )}
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
                <Truck className="h-3.5 w-3.5 text-gold" /> Coordina el envío con la tienda
              </li>
            </div>
            <button
              type="submit"
              disabled={submitting || !wompi?.ready || items.length === 0}
              className="btn-gold w-full mt-7 py-4 text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Continuar a Wompi"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
