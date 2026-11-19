import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard } from "@components/product/ProductCard";
import type { Product } from "@domain/catalog/types";

export function FeaturedProductsCarousel({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  const trackRef = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  function updateEdges() {
    const track = trackRef.current;
    if (!track) return;
    const start = track.scrollLeft <= 2;
    const end = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
    setEdges((current) => current.start === start && current.end === end ? current : { start, end });
  }

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(track);
    return () => observer.disconnect();
  }, [products.length]);

  function move(direction: -1 | 1) {
    const track = trackRef.current;
    const [first, second] = track?.children ?? [];
    if (!track || !first || !second) return;
    const step = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
    const next = Math.round(track.scrollLeft / step) + direction;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: next * step, behavior: reduceMotion ? "instant" : "smooth" });
  }

  if (!products.length && !loading) return null;

  return (
    <section className="featured-products" aria-labelledby="featured-products-title">
      <div className="mx-auto max-w-7xl px-5">
        <div className="featured-products-header">
          <h2 id="featured-products-title" className="font-display text-4xl text-sand md:text-5xl">
            Productos destacados
          </h2>
          <div className="featured-products-controls">
            <button
              type="button"
              aria-label="Producto anterior"
              aria-controls="featured-products-track"
              disabled={edges.start}
              onClick={() => move(-1)}
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Producto siguiente"
              aria-controls="featured-products-track"
              disabled={edges.end}
              onClick={() => move(1)}
            >
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        {loading && <p role="status" className="mt-6 text-muted-foreground">Cargando productos…</p>}

        <ul id="featured-products-track" ref={trackRef} className="featured-products-track" onScroll={updateEdges}>
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>

        <Link to="/tienda" className="btn-outline-gold mt-5">
          Ver todo el catálogo
        </Link>
      </div>
    </section>
  );
}
