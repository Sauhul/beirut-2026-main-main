import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, CreditCard } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useCart } from "@domain/cart/use-cart";
import { categoryImage } from "@shared/utils/category-images";
import { formatCOP, titleCase } from "@shared/utils/format";
import { formatPresentation } from "@shared/utils/product-format";
import { usePageTitle } from "@hooks/usePageTitle";
import { getMotionQuality } from "@hooks/useAnimationQuality";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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
    },
    { scope: containerRef, dependencies: [items.length], revertOnUpdate: true },
  );

  if (items.length === 0) {
    return (
      <div ref={containerRef} className="route-page mx-auto max-w-4xl px-5 py-24">
        <div className="cart-empty cart-motion card-onyx p-12 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-gold/40">
            <ShoppingBag className="h-10 w-10 text-gold" />
          </div>
          <h1 className="mt-8 font-display text-4xl text-sand">Tu carrito está vacío</h1>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">
            Descubre nuestra despensa libanesa: especias, café, dulces de pistacho y más.
          </p>
          <Link to="/tienda" className="btn-gold mx-auto mt-10 max-w-max">
            <ShoppingBag className="h-4 w-4" /> Explorar la tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="route-page mx-auto max-w-7xl px-5 pb-24 pt-10">
      <div className="cart-header flex flex-wrap items-end justify-between gap-4 border-b border-border pb-8 mb-10">
        <div>
          <p className="eyebrow">Revisa tu orden</p>
          <h1 className="mt-3 font-display text-5xl text-sand">Tu carrito</h1>
        </div>
        <Link
          to="/tienda"
          className="inline-flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.22em] uppercase text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" /> Seguir comprando
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1.8fr_1.2fr]">
        <div className="cart-content card-onyx p-8">
          <ul className="divide-y divide-border border-t border-border">
            {items.map((item) => (
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
                  className="h-24 w-24 bg-background object-contain p-2"
                />

                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        to={`/producto/${item.slug}`}
                        className="font-display text-2xl text-sand hover:text-gold"
                      >
                        {titleCase(item.name)}
                      </Link>
                      <p className="mt-1 text-[0.6rem] font-bold tracking-[0.18em] uppercase text-muted-foreground">
                        {formatPresentation(item.unit)}
                      </p>
                    </div>

                    <button
                      onClick={() => remove(item.id)}
                      className="flex h-10 w-10 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Quitar ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 border border-input bg-background/60 p-1">
                      <button
                        onClick={() => setQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="quantity-btn flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-gold"
                        aria-label="Reducir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[3rem] text-center text-base font-bold text-sand">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        className="quantity-btn flex h-10 w-10 items-center justify-center text-muted-foreground hover:text-gold"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[0.6rem] tracking-[0.18em] uppercase text-muted-foreground">
                        Subtotal
                      </p>
                      <p className="font-display text-2xl text-gold">
                        {formatCOP(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {items.length > 0 && (
            <div className="mt-8 border-t border-dashed border-border pt-8">
              <button
                onClick={() => setShowConfirmDialog(true)}
                className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-destructive hover:opacity-80"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </div>

        <div className="cart-summary cart-motion sticky top-28 self-start border border-border bg-card p-10 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-3xl text-sand">Resumen</h2>

          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 border-b border-border pb-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate text-sand">{titleCase(item.name)}</p>
                  <p className="text-xs text-muted-foreground">Cantidad x{item.quantity}</p>
                </div>
                <p className="font-display text-lg text-sand">
                  {formatCOP(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4 border-t border-border pt-8">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-sand">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Envío (estimado)</span>
              <span className="font-bold text-gold">Gratis</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-border pt-8">
            <span className="text-xl text-sand">Total</span>
            <span className="font-display text-4xl text-gold">{formatCOP(subtotal)}</span>
          </div>

          <div className="mt-8 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gold" /> Pago seguro con Wompi
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-gold" /> Envíos a toda Colombia
            </div>
          </div>

          <Link to="/checkout" className="btn-gold w-full mt-10 py-5 text-sm">
            <CreditCard className="h-4 w-4" /> Ir a checkout
          </Link>
        </div>
      </div>

      {showConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-lg bg-card p-8 shadow-[var(--shadow-lift)]">
            <h2 className="font-display text-3xl text-sand">¿Vaciar carrito?</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Esta acción no se puede deshacer. Perderás {items.length} artículo(s) de tu carrito.
            </p>
            <div className="mt-8 flex gap-4">
              <button onClick={() => setShowConfirmDialog(false)} className="btn-outline-gold flex-1">
                Cancelar
              </button>
              <button
                onClick={() => {
                  clear();
                  setShowConfirmDialog(false);
                }}
                className="btn-gold flex-1 !bg-destructive !text-destructive-foreground"
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