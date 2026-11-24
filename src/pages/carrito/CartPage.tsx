import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, CreditCard } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useCart } from "@domain/cart/use-cart";
import { ProductPhoto } from "@components/product/ProductPhoto";
import { formatCOP, titleCase } from "@shared/utils/format";
import { formatPresentation } from "@shared/utils/product-format";
import { usePageTitle } from "@hooks/usePageTitle";
import { getMotionQuality } from "@hooks/useAnimationQuality";
import { useCheckoutCrossSell } from "@hooks/useCheckoutCrossSell";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export function CartPage() {
  usePageTitle("Tu carrito · Beirut");
  const { items, subtotal, setQuantity, remove, clear } = useCart();
  const hasItems = items.length > 0;
  const containerRef = useRef<HTMLDivElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const navigate = useNavigate();
  const { requestCrossSell, checking, crossSellDialog } = useCheckoutCrossSell();

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
    { scope: containerRef, dependencies: [hasItems], revertOnUpdate: true },
  );

  if (items.length === 0) {
    return (
      <div ref={containerRef} className="route-page mx-auto max-w-4xl px-5 py-24">
        <div className="cart-empty cart-motion card-onyx p-5 text-center sm:p-12">
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
    <div
      ref={containerRef}
      className="route-page mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-5 sm:pb-24 sm:pt-10"
    >
      <div className="cart-header flex flex-wrap items-end justify-between gap-4 border-b border-border pb-8 mb-10">
        <div>
          <p className="eyebrow">Revisa tu orden</p>
          <h1 className="mt-3 font-display text-5xl text-sand">Tu carrito</h1>
        </div>
        <Link
          to="/tienda"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold tracking-normal text-muted-foreground hover:text-gold"
        >
          <ArrowLeft className="h-4 w-4" /> Seguir comprando
        </Link>
      </div>

      <div className="grid min-w-0 gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)]">
        <div className="cart-content card-onyx min-w-0 p-3 sm:p-8">
          <ul className="divide-y divide-border border-t border-border">
            {items.map((item) => (
              <li
                key={item.id}
                className="cart-item cart-motion flex flex-wrap gap-3 py-4 sm:gap-4 sm:p-6 transition-all duration-300 hover:bg-foreground/5"
              >
                <ProductPhoto
                  imageUrl={item.imageUrl}
                  alt={item.name}
                  className="cart-product-photo w-14 sm:w-20 shrink-0 self-start"
                />

                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <Link
                        to={`/producto/${item.slug}`}
                        className="font-display text-lg wrap-anywhere text-sand hover:text-gold sm:text-2xl"
                      >
                        {titleCase(item.name)}
                      </Link>
                      <p className="mt-1 text-[0.6rem] font-bold tracking-normal text-muted-foreground">
                        {formatPresentation(item.unit)}
                      </p>
                    </div>

                    <button
                      onClick={() => remove(item.id)}
                      className="motion-press flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-destructive"
                      aria-label={`Quitar ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-1 border border-input sm:gap-3 bg-background/60 p-1">
                      <button
                        onClick={() => setQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="motion-press quantity-btn flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground hover:text-gold"
                        aria-label="Reducir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span
                        key={item.quantity}
                        className="motion-value min-w-8 sm:min-w-[3rem] text-center text-base font-bold text-sand"
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(item.id, item.quantity + 1)}
                        className="motion-press quantity-btn flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground hover:text-gold"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[0.6rem] tracking-normal text-muted-foreground">
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
                className="text-[0.62rem] font-bold tracking-normal text-destructive hover:opacity-80"
              >
                Vaciar carrito
              </button>
            </div>
          )}
        </div>

        <div className="cart-summary cart-motion min-w-0 self-start border border-border bg-card p-5 sm:p-8 lg:sticky lg:top-40 lg:p-10 shadow-[var(--shadow-soft)]">
          <h2 className="font-display text-3xl text-sand">Resumen</h2>

          <div className="mt-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 border-b border-border pb-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold wrap-anywhere text-sand">
                    {titleCase(item.name)}
                  </p>
                  <p className="text-xs text-muted-foreground">Cantidad x{item.quantity}</p>
                </div>
                <p className="shrink-0 font-display text-lg text-sand">
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

          <div className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-8">
            <span className="text-xl text-sand">Total</span>
            <span
              key={subtotal}
              className="motion-value font-display text-3xl text-gold sm:text-4xl"
            >
              {formatCOP(subtotal)}
            </span>
          </div>

          <div className="mt-8 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gold" /> Pago seguro con Wompi
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-gold" /> Envíos a toda Colombia
            </div>
          </div>

          <button
            type="button"
            disabled={checking}
            onClick={async () => {
              if (await requestCrossSell()) navigate("/checkout");
            }}
            className="btn-gold w-full mt-10 py-5 text-sm disabled:cursor-wait disabled:opacity-60"
          >
            <CreditCard className="h-4 w-4" />{" "}
            {checking ? "Preparando tu pedido…" : "Ir al pago con Wompi"}
          </button>
        </div>
      </div>

      {crossSellDialog}
      {showConfirmDialog && (
        <div className="motion-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="motion-dialog mx-4 w-full max-w-lg max-h-[90dvh] overflow-y-auto bg-card p-5 shadow-[var(--shadow-lift)] sm:p-8">
            <h2 className="font-display text-3xl text-sand">¿Vaciar carrito?</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              Esta acción no se puede deshacer. Perderás {items.length} artículo(s) de tu carrito.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="btn-outline-gold flex-1"
              >
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
