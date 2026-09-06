import { useEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate, Link } from "react-router-dom";
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
import { AdminPage } from "@pages/admin/AdminPage";

gsap.registerPlugin(ScrollTrigger);

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    requestAnimationFrame(() => ScrollTrigger.refresh());
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

  useEffect(() => {
    const motion = getMotionQuality();
    if (motion === "minimal") return;

    const ctx = gsap.context(() => {
      if (motion === "full") {
        gsap.fromTo(
          ".route-page",
          { autoAlpha: 0, y: 22 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            clearProps: "transform,visibility,opacity",
          },
        );
      }

      gsap.fromTo(
        ".route-wipe",
        { scaleX: 1, autoAlpha: 1, transformOrigin: "left center" },
        {
          scaleX: 0,
          autoAlpha: 0,
          duration: motion === "full" ? 0.75 : 0.5,
          ease: "expo.inOut",
        },
      );
    }, pageRef);

    return () => ctx.revert();
  }, [location.pathname, location.search]);

  return (
    <div ref={pageRef} className="relative">
      <div className="route-wipe pointer-events-none fixed inset-0 z-40 bg-primary" />
      <Routes location={location} key={`${location.pathname}${location.search}`}>
        <Route path="/" element={<HomePage />} />
        <Route path="/tienda" element={<StorePage />} />
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
