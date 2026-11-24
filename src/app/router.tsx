import { useEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate, Link } from "react-router-dom";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getMotionQuality } from "@hooks/useAnimationQuality";

import { HomePage } from "@pages/home/HomePage";
import { StorePage } from "@pages/tienda/StorePage";
import { ProductDetailPage } from "@pages/producto/ProductDetailPage";
import { CartPage } from "@pages/carrito/CartPage";
import { CheckoutPage } from "@pages/checkout/CheckoutPage";
import { OrderConfirmedPage } from "@pages/pedido-confirmado/OrderConfirmedPage";
import { ContactPage } from "@pages/contacto/ContactPage";
import { WholesalePage } from "@pages/al-por-mayor/WholesalePage";
import { AdminPage } from "@pages/admin/AdminPage";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Las fichas de producto gestionan su posición de scroll.
    if (!pathname.includes("/producto/")) {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
  }, [pathname]);

  return null;
}

/** Hash secreto para acceder al admin sin enlace visible: URL + "#admin". */
const ADMIN_HASH = "admin";

function AdminHashAccess() {
  const navigate = useNavigate();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash && hash.replace(/^#/, "") === ADMIN_HASH) {
      navigate("/admin", { replace: true });
    }
  }, [hash, navigate]);

  return null;
}

function NotFound() {
  return (
    <div className="route-page mx-auto max-w-xl px-5 py-28 text-center">
      <h1 className="text-7xl font-black tracking-[-0.08em]">404</h1>
      <p className="mt-4 text-xl font-semibold">Página no encontrada</p>
      <p className="mt-2 text-sm text-foreground/60">Esta página no existe o fue movida.</p>
      <Link
        to="/"
        className="mt-8 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground smooth-button"
      >
        Ir al inicio
      </Link>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);
  const featured =
    location.pathname === "/tienda" &&
    new URLSearchParams(location.search).get("destacados") === "1";

  useGSAP(
    () => {
      const quality = getMotionQuality();
      if (quality === "minimal" || location.pathname === "/") return;

      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const full = quality === "full";
        const page = pageRef.current?.querySelector(".route-page");
        const transition = gsap.timeline({ defaults: { ease: "power3.inOut" } });

        transition.fromTo(
          "[data-route-curtain]",
          { yPercent: 0, autoAlpha: 1 },
          {
            yPercent: -102,
            duration: full ? 0.78 : 0.46,
            stagger: full ? { each: 0.12, from: "end" } : 0,
            clearProps: "transform,visibility,opacity",
          },
        );

        if (page) {
          transition.from(
            page,
            {
              y: full ? 30 : 12,
              opacity: 0.78,
              duration: full ? 0.72 : 0.4,
              ease: "power3.out",
              clearProps: "transform,opacity",
            },
            full ? 0.32 : 0.17,
          );
        }
      });

      return () => media.revert();
    },
    { scope: pageRef, dependencies: [location.pathname, featured], revertOnUpdate: true },
  );

  return (
    <div ref={pageRef} className="relative">
      <div aria-hidden="true" className="route-wipe pointer-events-none fixed inset-0 z-40">
        <div data-route-curtain className="invisible absolute inset-0 bg-primary" />
        <div data-route-curtain className="invisible absolute inset-0 bg-secondary" />
      </div>
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tienda" element={<StorePage />} />
        <Route path="/al-por-mayor" element={<WholesalePage />} />
        <Route path="/producto/:slug" element={<ProductDetailPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedido-confirmado" element={<OrderConfirmedPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export function AppRouter() {
  return (
    <>
      <ScrollToTop />
      <AdminHashAccess />
      <AnimatedRoutes />
    </>
  );
}
