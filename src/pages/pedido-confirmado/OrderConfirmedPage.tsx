import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useQuery } from "@tanstack/react-query";
import { verifyWompiPayment } from "@domain/payments/wompi";
import { useCart } from "@domain/cart/use-cart";
import { usePageTitle } from "@hooks/usePageTitle";
import { getMotionQuality } from "@hooks/useAnimationQuality";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function OrderConfirmedPage() {
  const [searchParams] = useSearchParams();
  const { clear } = useCart();
  const orderId = searchParams.get("pedido") ?? "";
  const transactionId = searchParams.get("id") ?? "";
  const hasPayment = Boolean(orderId && transactionId);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["wompi-payment", orderId, transactionId],
    queryFn: () => verifyWompiPayment(orderId, transactionId),
    enabled: hasPayment,
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === "PENDING" ? 8000 : false),
  });
  const numero = data?.orderNumber ?? 0;
  const approved = data?.status === "APPROVED";
  const declined = data && !approved && data.status !== "PENDING";

  useEffect(() => {
    if (approved && sessionStorage.getItem("beirut-pending-wompi") === orderId) {
      clear();
      sessionStorage.removeItem("beirut-pending-wompi");
    }
  }, [approved, orderId, clear]);

  const containerRef = useRef<HTMLDivElement>(null);

  usePageTitle("Estado del pedido · Beirut");

  useGSAP(
    () => {
      const motion = getMotionQuality();
      gsap.set(".motion-ready", { autoAlpha: 1 });
      if (motion === "minimal") return;

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".confirm-check", { scale: 0.85, duration: 0.7 })
        .from(".confirm-heading", { y: 26, autoAlpha: 0, duration: 0.62 }, "-=0.45")
        .from(".confirm-numero", { y: 16, autoAlpha: 0, duration: 0.5 }, "-=0.4")
        .from(".confirm-text", { y: 18, autoAlpha: 0, duration: 0.55 }, "-=0.35")
        .from(".confirm-actions", { y: 20, autoAlpha: 0, stagger: 0.08, duration: 0.55 }, "-=0.28");
    },
    { scope: containerRef, dependencies: [numero], revertOnUpdate: true },
  );

  return (
    <div ref={containerRef} className="route-page mx-auto max-w-2xl px-5 py-24 text-center">
      <div className="confirm-check motion-ready inline-grid h-24 w-24 place-items-center rounded-full bg-gold text-primary-foreground">
        {approved ? <CheckCircle2 className="h-12 w-12" /> : <Clock className="h-12 w-12" />}
      </div>
      <h1 className="confirm-heading motion-ready mt-8 font-display text-5xl text-sand">
        {approved
          ? data.sandbox
            ? "Prueba aprobada"
            : "Pago confirmado"
          : declined
            ? "Pago no aprobado"
            : hasPayment
              ? "Pago por verificar"
              : "Consulta tu pedido"}
      </h1>
      {numero > 0 && (
        <p className="confirm-numero motion-ready mt-4 text-[0.65rem] font-bold tracking-[0.3em] uppercase text-gold">
          Orden #{numero}
        </p>
      )}

      <div className="confirm-text motion-ready mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
        <p className="text-sand font-medium">
          {approved
            ? data.sandbox
              ? "Wompi aprobó la simulación. No hubo cobro real."
              : "Wompi verificó el pago de tu pedido."
            : declined
              ? "Wompi no aprobó este pago. Puedes volver al carrito para intentarlo de nuevo."
              : hasPayment
                ? isPending
                  ? "Estamos comprobando la transacción con Wompi."
                  : isError
                    ? "Por ahora no pudimos comprobar el resultado con Wompi."
                    : "Wompi aún está procesando el pago. Esta página se actualizará automáticamente."
                : "Si ya realizaste un pedido, contacta a la tienda con el número de referencia."}
        </p>
      </div>

      <div className="confirm-actions motion-ready mt-10 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {isError && hasPayment ? (
            <button type="button" className="btn-gold" onClick={() => void refetch()}>
              Verificar de nuevo
            </button>
          ) : declined ? (
            <Link to="/carrito" className="btn-gold">
              Volver al carrito
            </Link>
          ) : (
            <Link to="/contacto" className="btn-gold">
              Contactar a la tienda
            </Link>
          )}
          <Link to="/tienda" className="btn-outline-gold">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
