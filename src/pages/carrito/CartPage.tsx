import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, CreditCard } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useCart } from "@domain/cart/use-cart";
import { categoryImage } from "@shared/utils/category-images";
import { formatCOP } from "@shared/utils/format";
import { formatPresentation } from "@shared/utils/product-format";
import { usePageTitle } from "@hooks/usePageTitle";
import { getMotionQuality } from "@hooks/useAnimationQuality";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function EmptyCartIllustration() {
  return (
    <div className="relative mx-auto h-48 w-48">
      <div className="absolute inset-0 rounded-full bg-primary/10" />
      <div className="absolute -top-4 -left-4 h-20 w-20 rounded-full bg-coral/15" />
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-gold/15" />
      <div className="relative flex h-full w-full items-center justify-center">
        <ShoppingBag className="h-16 w-16 text-primary/30" />
      </div>
    </div>
  );
}

export function CartPage() {
  usePageTitle("Tu carrito · Beirut");
  const { items, subtotal, setQuantity, remove, clear } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useGSAP(
    () => {
      const motion = getMotionQuality();
      gsap.set(".cart-motion", { autoAlpha: 1 });
      if (motion === "minimal") return;

      const timeline = gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".cart-header", { y: 26, autoAlpha: 0, duration: 0.7 })
        .from(".cart-empty", { scale: 0.9, autoAlpha: 0, duration: 0.62 }, "-=0.6")
        .from(".cart-item", { y: 18, autoAlpha: 0, stagger: 0.07, duration: 0.55 }, "-=0.45");

      if (items.length > 0) {
        timeline.from(
          ".cart-summary",
          { x: 48, autoAlpha: 0, scale: 0.96, duration: 0.8 },
          "-=0.3",
        );
      }

      if (motion === "full") {
        ScrollTrigger.create({
          trigger: ".cart-content",
          start: "top 80%",
          onEnter: () => {
            gsap.to(".cart-floating", {
              y: -15,
              duration: 1.5,
              ease: "sine.inOut",
              repeat: -1,
              yoyo: true,
            });
          },
        });
      }
    },
    { scope: containerRef, dependencies: [items.length], revertOnUpdate: true },
  );

  if (items.length === 0) {
    return (
      <div ref={containerRef} className="route-page cart-lab mx-auto max-w-4xl px-5 py-20">
        <div className="relative mx-auto max-w-2xl">
          <div className="absolute -top-12 -left-12 h-32 w-32 animate-bounce-slow rounded-full bg-gold/20" />
          <div className="absolute -bottom-12 -right-12 h-40 w-40 animate-float rounded-full bg-coral/20" />

          <div className="cart-empty cart-motion rounded-[3rem] border border-foreground/10 bg-background/70 p-12 text-center backdrop-blur-2xl shadow-[var(--shadow-lift)]">
            <div className="mb-8 flex justify-center">
              <EmptyCartIllustration />
            </div>
            <h1 className="font-script text-5xl text-primary">Tu carrito está vacío</h1>
            <p className="mt-5 text-lg text-foreground/65">
              Descubre nuestra despensa artesanal libanesa: especias, aceitunas, quesos, dulces y
              mucho más.
            </p>
            <div className="mt-10 grid gap-3">
              <span className="text-sm text-foreground/45">
                Explora ahora nuestras categorías seleccionadas:
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {["especias", "aceitunas", "quesos"].map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
            <Link to="/tienda" className="liquid-button mx-auto mt-10 max-w-max">
              <ShoppingBag className="h-5 w-5" /> Explorar la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="route-page cart-lab mx-auto max-w-7xl px-5 pb-24 pt-10">
      <div className="cart-header flex flex-wrap items-end justify-between gap-4 border-b border-foreground/10 pb-8 mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-[-0.06em] md:text-5xl">Tu carrito</h1>
          <p className="mt-2 text-base text-foreground/60">
            Revisa, edita y recibe envío a toda Colombia
          </p>
        </div>
        <Link to="/tienda" className="ghost-button flex items-center gap-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Seguir comprando
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.8fr_1.2fr]">
        <div className="cart-content relative rounded-[2.5rem] border border-foreground/10 bg-background/80 p-8 backdrop-blur-xl shadow-[var(--shadow-soft)]">
          <span className="hidden">
            <ShoppingBag className="h-8 w-8" />
          </span>

          <ul className="divide-y divide-foreground/10 border-t border-foreground/10">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="cart-item cart-motion flex flex-wrap gap-4 p-6 transition-all duration-300 hover:bg-foreground/5"
              >
                <img
                  src={categoryImage(item.categorySlug, item.imageUrl)}
                  alt={item.name}
                  loading="lazy"
                  width={900}
                  height={900}
                  className="h-24 w-24 rounded-2xl bg-cream object-contain p-2 transition-transform duration-500 hover:scale-110"
                />

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/producto/${item.slug}`}
                        className="text-xl font-bold transition-colors hover:text-primary"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-foreground/55">
                        {formatPresentation(item.unit)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-primary">
                          {item.categorySlug}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => remove(item.id)}
                        className="remove-btn flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-background/90 transition-colors hover:bg-destructive hover:border-destructive hover:text-destructive-foreground"
                        aria-label={`Quitar ${item.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 rounded-[1.5rem] border border-foreground/10 bg-background/90 p-1 backdrop-blur-xl">
                      <button
                        onClick={() => setQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="quantity-btn flex h-10 w-10 items-center justify-center rounded-full hover:bg-foreground/5"
                        aria-label="Reducir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[3rem] text-center text-base font-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn flex h-10 w-10 items-center justify-center rounded-full hover:bg-foreground/5"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-foreground/45">Subtotal</p>
                      <p className="text-2xl font-black tracking-[-0.04em]">
                        {formatCOP(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {items.length > 0 && (
            <div className="mt-8 border-t border-dashed border-foreground/10 pt-8">
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="rounded-full border border-destructive/50 bg-destructive/5 px-8 py-4 text-sm font-black text-destructive transition-all hover:bg-destructive hover:text-destructive-foreground"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </div>

        <div className="cart-summary cart-motion sticky top-28 self-start rounded-[2.5rem] border border-foreground/10 bg-background/80 p-10 backdrop-blur-2xl shadow-[var(--shadow-soft)]">
          <h2 className="text-2xl font-black uppercase tracking-[0.12em]">Resumen</h2>

          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 border-b border-foreground/10 pb-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{item.name}</p>
                  <p className="text-xs text-foreground/55">Cantidad x{item.quantity}</p>
                </div>
                <p className="text-lg font-black">{formatCOP(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4 border-t border-foreground/10 pt-8">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60">Subtotal</span>
              <span>{formatCOP(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground/60">Envío (estimado)</span>
              <span className="font-bold text-primary">Gratis</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-foreground/10 pt-8">
            <span className="text-xl">Total</span>
            <span className="text-3xl font-black text-primary">{formatCOP(subtotal)}</span>
          </div>

          <div className="mt-8 space-y-2 text-xs text-foreground/50">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gold" /> Pago seguro con Wompi
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-gold" /> Envíos a toda Colombia
            </div>
          </div>

          <Link to="/checkout" className="liquid-button w-full mt-10 py-5 text-base">
            <CreditCard className="h-5 w-5" /> Ir a checkout
          </Link>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-lg rounded-[2rem] border border-foreground/10 bg-background p-8 shadow-[var(--shadow-lift)]">
            <h2 className="text-2xl font-black">¿Vaciar carrito?</h2>
            <p className="mt-3 text-foreground/65">
              Esta acción no se puede deshacer. Perderás {items.length} artículo(s) de tu carrito.
            </p>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowConfirmDialog(false)} className="ghost-button flex-1">
                Cancelar
              </button>
              <button
                onClick={() => {
                  clear();
                  setShowConfirmDialog(false);
                }}
                className="liquid-button flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
