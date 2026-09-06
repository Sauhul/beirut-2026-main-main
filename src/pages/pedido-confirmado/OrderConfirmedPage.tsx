import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Package, MapPin, MessageCircle } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { SITE, whatsappLink } from "@config/site";
import { usePageTitle } from "@hooks/usePageTitle";
import { getMotionQuality } from "@hooks/useAnimationQuality";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function OrderConfirmedPage() {
  const [searchParams] = useSearchParams();
  const numero = Number(searchParams.get("numero")) || 0;
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
      <div className="confirm-check motion-ready inline-grid h-20 w-20 place-items-center rounded-full bg-linear-to-br from-primary via-leaf to-leaf-deep text-primary-foreground shadow-[var(--shadow-glow)]">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h1 className="confirm-heading motion-ready mt-8 font-script text-5xl text-primary">
        ¡Gracias por tu pedido!
      </h1>
      {numero > 0 && (
        <p className="confirm-numero motion-ready mt-4 text-sm uppercase tracking-[0.2em] text-foreground/60">
          Pedido #{numero}
        </p>
      )}
      <p className="confirm-text motion-ready mt-6 text-lg leading-8 text-foreground/68">
        Registramos tu pedido y lo enviamos a nuestro WhatsApp ({SITE.phoneDisplay}). Si la ventana
        no se abrió, puedes escribirnos directamente y lo confirmamos enseguida.
      </p>
      <div className="confirm-actions motion-ready mt-10 flex flex-wrap justify-center gap-3">
        <div className="rounded-[1.5rem] border border-foreground/10 bg-background/70 p-5 backdrop-blur-xl">
          <div className="flex items-center justify-center gap-2 text-sm font-black text-primary">
            <Package className="h-4 w-4" /> Tu pedido está en camino
          </div>
          <p className="mt-2 text-xs text-foreground/55">
            Revisa WhatsApp para confirmar los detalles de entrega.
          </p>
        </div>
        <a
          href={whatsappLink(`Hola Beirut, quiero confirmar mi pedido #${numero}.`)}
          target="_blank"
          rel="noreferrer"
          className="liquid-button"
        >
          <MessageCircle className="h-4 w-4" /> Abrir WhatsApp
        </a>
        <Link
          to="/tienda"
          className="liquid-button ghost-button border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  );
}
