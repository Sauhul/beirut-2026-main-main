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

        function render() {
          const wrapPosition = wrap;
          if (!wrapPosition) return;
          setX.forEach((set, index) => {
            const home = index * step;
            set(wrapPosition(home + offset) - home);
          });
        }

        function tick(_time: number, delta: number) {
          if (!wrap) return;
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
          const card = (event.target as HTMLElement).closest("li");
          const index = cards.indexOf(card as HTMLLIElement);
          if (!wrap || index < 0) return;
          const position = wrap(index * step + offset);
          if (position < 0 || position + cardWidth > viewportWidth) {
            offset = (viewportWidth - cardWidth) / 2 - index * step;
            render();
          }
        }

        const resize = new ResizeObserver(measure);

        measure();
        resize.observe(viewport);
        viewport.addEventListener("focusin", focusCard);
        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
          resize.disconnect();
          viewport.removeEventListener("focusin", focusCard);
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
          className="text-center font-display text-4xl text-sand md:text-5xl"
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
                  <ProductCard product={product} compact />
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
