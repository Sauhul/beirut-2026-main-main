import { useRef } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, Mail, Check } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { usePageTitle } from "@hooks/usePageTitle";
import { getMotionQuality } from "@hooks/useAnimationQuality";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function OrderConfirmedPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const locationState = location.state as { orderNumber?: number; customerEmail?: string } | null;
  const numero = Number(searchParams.get("numero")) || locationState?.orderNumber || 0;
  const customerEmail = locationState?.customerEmail;

  const containerRef = useRef<HTMLDivElement>(null);

  usePageTitle("Pedido confirmado · Beirut");

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
        <CheckCircle2 className="h-12 w-12" />
      </div>
      <h1 className="confirm-heading motion-ready mt-8 font-display text-5xl text-sand">
        ¡Pedido Confirmado!
      </h1>
      {numero > 0 && (
        <p className="confirm-numero motion-ready mt-4 text-[0.65rem] font-bold tracking-[0.3em] uppercase text-gold">
          Orden #{numero}
        </p>
      )}
      
      <div className="confirm-text motion-ready mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
        <p className="text-sand font-medium">
          Hemos recibido tu orden correctamente.
        </p>
        <div className="card-onyx p-6 text-left max-w-md mx-auto space-y-3">
          <p className="flex items-center gap-3 text-xs text-sand">
            <Mail className="h-4 w-4 text-gold shrink-0" />
            <span>Te enviamos la confirmación {customerEmail ? `a ${customerEmail}` : "a tu correo"} desde <strong className="text-gold">confirmacion@beirutmarket.co</strong></span>
          </p>
          <p className="flex items-center gap-3 text-xs text-sand">
            <Check className="h-4 w-4 text-gold shrink-0" />
            <span>Los detalles completos del pedido se enviaron directamente al dueño de la tienda por WhatsApp.</span>
          </p>
        </div>
      </div>

      <div className="confirm-actions motion-ready mt-10 flex flex-col items-center gap-4">
        <div className="card-onyx p-5 max-w-md w-full">
          <div className="flex items-center justify-center gap-2 text-sm font-bold text-gold">
            <Package className="h-4 w-4" /> Tu pedido está siendo preparado
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            No necesitas realizar ninguna acción adicional. Te contactaremos si coordinamos detalles de despacho.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <Link to="/" className="btn-gold">
            Volver al inicio
          </Link>
          <Link to="/tienda" className="btn-outline-gold">
            Seguir comprando
          </Link>
        </div>
      </div>
    </div>
  );
}
