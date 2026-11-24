import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { ProductCard } from "@components/product/ProductCard";
import type { Product } from "@domain/catalog/types";

gsap.registerPlugin(useGSAP);

const pixelsPerSecond = 28;

export function FeaturedProducts({ products, loading }: { products: Product[]; loading: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const productOrder = products.map(({ id }) => id).join(",");

  useGSAP(
    () => {
      const carousel = viewportRef.current;
      const track = trackRef.current;
      if (!carousel || !track || track.children.length < 2) return;

      const viewport = carousel;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = Array.from(track.children) as HTMLLIElement[];
        const setX = cards.map((card) => gsap.quickSetter(card, "x", "px"));
        let step = 0;
        let cardWidth = 0;
        let viewportWidth = 0;
        let offset = 0;
        let wrap: ((value: number) => number) | undefined;
        let visible = false;
        let hovered = false;
        let focused = false;

        function render() {
          const wrapPosition = wrap;
          if (!wrapPosition) return;
          setX.forEach((set, index) => {
            const home = index * step;
            set(wrapPosition(home + offset) - home);
          });
        }

        function tick(_time: number, delta: number) {
          if (!wrap || !visible || hovered || focused || document.hidden) return;
          offset =
            (offset + (pixelsPerSecond * Math.min(delta, 50)) / 1000) % (step * cards.length);
          render();
        }

        function measure() {
          if (viewport.clientWidth === viewportWidth) return;
          viewportWidth = viewport.clientWidth;
          viewport.dataset.carousel = "true";
          cardWidth = cards[0].offsetWidth;
          step = cards[1].offsetLeft - cards[0].offsetLeft;
          const trackWidth = cards.length * step;
          wrap =
            step > 0 && trackWidth - step >= viewportWidth
              ? gsap.utils.wrap(-step, trackWidth - step)
              : undefined;

          if (wrap) {
            render();
          } else {
            delete viewport.dataset.carousel;
            setX.forEach((set) => set(0));
          }
        }

        function focusCard(event: FocusEvent) {
          focused = true;
          const card = (event.target as HTMLElement).closest("li");
          const index = cards.indexOf(card as HTMLLIElement);
          if (!wrap || index < 0) return;
          const position = wrap(index * step + offset);
          if (position < 0 || position + cardWidth > viewportWidth) {
            offset = (viewportWidth - cardWidth) / 2 - index * step;
            render();
          }
        }

        const onFocusOut = (event: FocusEvent) => {
          focused = viewport.contains(event.relatedTarget as Node | null);
        };
        const onPointerEnter = (event: PointerEvent) => {
          hovered = event.pointerType === "mouse";
        };
        const onPointerLeave = () => {
          hovered = false;
        };
        const resize = new ResizeObserver(measure);
        const intersection = new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
        });

        measure();
        resize.observe(viewport);
        intersection.observe(viewport);
        viewport.addEventListener("pointerenter", onPointerEnter);
        viewport.addEventListener("pointerleave", onPointerLeave);
        viewport.addEventListener("focusin", focusCard);
        viewport.addEventListener("focusout", onFocusOut);
        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
          resize.disconnect();
          intersection.disconnect();
          viewport.removeEventListener("pointerenter", onPointerEnter);
          viewport.removeEventListener("pointerleave", onPointerLeave);
          viewport.removeEventListener("focusin", focusCard);
          viewport.removeEventListener("focusout", onFocusOut);
          delete viewport.dataset.carousel;
          gsap.set(cards, { clearProps: "transform" });
        };
      });

      return () => media.revert();
    },
    { dependencies: [productOrder], revertOnUpdate: true },
  );

  if (!products.length && !loading) return null;

  return (
    <section
      data-reveal-section
      className="featured-products"
      aria-labelledby="featured-products-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-5">
        <h2
          data-reveal-heading
          id="featured-products-title"
          className="font-display text-4xl text-sand md:text-5xl"
        >
          Productos destacados
        </h2>
        {loading && (
          <p role="status" className="mt-6 text-muted-foreground">
            Cargando productos…
          </p>
        )}
        {products.length > 0 && (
          <div
            ref={viewportRef}
            data-reveal-item
            className="featured-products-viewport @container/catalog mt-3"
          >
            <ul ref={trackRef} className="featured-products-track catalog-card-grid py-4">
              {products.map((product) => (
                <li key={product.id} className="min-w-0 [&>article]:h-full">
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link to="/tienda" className="btn-outline-gold mt-5">
          Ver todo el catálogo
        </Link>
      </div>
    </section>
  );
}
