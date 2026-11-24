import { useEffect, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, ShoppingBag, X } from "lucide-react";
import { useCart } from "@domain/cart/use-cart";
import type { Product } from "@domain/catalog/types";
import { ProductPhoto } from "@components/product/ProductPhoto";
import { formatCOP } from "@shared/utils/format";

export function CrossSellDialog({
  products,
  onFinish,
}: {
  products: Product[];
  onFinish: (continueToPayment: boolean) => void;
}) {
  const { items, subtotal, add } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [announcement, setAnnouncement] = useState("");
  const addedIds = useRef(new Set<string>());

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const padding = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${padding + scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";
    dialog?.showModal();
    titleRef.current?.focus({ preventScroll: true });
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, []);

  function scroll(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * 0.8,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="cross-sell-dialog"
      aria-labelledby="cross-sell-title"
      aria-describedby="cross-sell-description"
      onCancel={(event) => {
        event.preventDefault();
        onFinish(false);
      }}
    >
      <div className="cross-sell-handle" aria-hidden="true" />
      <header className="cross-sell-header">
        <p className="eyebrow">Un toque más para tu mesa</p>
        <button
          type="button"
          onClick={() => onFinish(false)}
          className="cross-sell-close"
          aria-label="Cerrar sugerencias y volver a tu pedido"
        >
          <X size={20} />
        </button>
        <h2 ref={titleRef} tabIndex={-1} id="cross-sell-title">
          ¿Deseas acompañar tu pedido?
        </h2>
        <p id="cross-sell-description">Agrega algo más antes de continuar. Tú eliges.</p>
      </header>

      <div className="cross-sell-navigation" aria-label="Navegación de sugerencias">
        <span>Para completar tu pedido</span>
        <div>
          <button type="button" onClick={() => scroll(-1)} aria-label="Ver sugerencias anteriores">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Ver más sugerencias">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <ul ref={trackRef} className="cross-sell-track" aria-label="Productos sugeridos">
        {products.map((product) => {
          const added = items.some((item) => item.id === product.id);
          return (
            <li key={product.id} className="cross-sell-product">
              <ProductPhoto imageUrl={product.image_url} alt={product.name} />
              <div className="cross-sell-product-copy">
                <h3>{product.name}</h3>
                <div className="cross-sell-product-action">
                  <span>{formatCOP(product.price)}</span>
                  <button
                    type="button"
                    aria-label={added ? `${product.name} agregado` : `Agregar ${product.name}`}
                    aria-disabled={added}
                    onClick={() => {
                      if (added || addedIds.current.has(product.id)) return;
                      addedIds.current.add(product.id);
                      add({
                        id: product.id,
                        slug: product.slug,
                        name: product.name,
                        price: product.price,
                        unit: product.unit,
                        categorySlug: product.category_slug,
                        imageUrl: product.image_url,
                      });
                      setAnnouncement(`${product.name} agregado a tu pedido.`);
                    }}
                  >
                    {added ? (
                      <Check size={19} aria-hidden="true" />
                    ) : (
                      <Plus size={20} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" role="status">
        {announcement}
      </p>
      <footer className="cross-sell-footer">
        <div className="cross-sell-total">
          <span>
            <ShoppingBag size={18} aria-hidden="true" /> Total de tu pedido
          </span>
          <strong aria-live="polite" aria-atomic="true">
            {formatCOP(subtotal)}
          </strong>
        </div>
        <button type="button" className="btn-gold" onClick={() => onFinish(true)}>
          Continuar al pago
        </button>
        <button type="button" className="cross-sell-decline" onClick={() => onFinish(true)}>
          No, gracias
        </button>
      </footer>
    </dialog>
  );
}
