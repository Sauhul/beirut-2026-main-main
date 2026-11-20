import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { ProductPhoto } from "@components/product/ProductPhoto";
import type { Product } from "@domain/catalog/types";
import { titleCase } from "@shared/utils/format";

type CategoryCarouselProps = {
  name: string;
  products: Product[];
};

function moveCarousel(track: HTMLUListElement, direction: -1 | 1, animate: boolean) {
  const end = track.scrollWidth - track.clientWidth;
  if (end < 2) return;

  const offsets = Array.from(track.children, (item) => (item as HTMLElement).offsetLeft);
  const position = track.scrollLeft;
  const target =
    direction === 1
      ? offsets.find((offset) => offset > position + 2)
      : offsets.reverse().find((offset) => offset < position - 2);
  const wrap = direction === 1 ? position >= end - 2 : position <= 2;
  track.scrollTo({
    left: wrap ? (direction === 1 ? 0 : end) : Math.min(target ?? end, end),
    behavior: animate && !wrap ? "smooth" : "instant",
  });
}

export function CategoryCarousel({ name, products }: CategoryCarouselProps) {
  const trackId = useId();
  const trackRef = useRef<HTMLUListElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState<boolean | null>(null);
  const [reduceMotion, setReduceMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const slides = products.filter((product) => product.image_url);
  const shouldPlay = playing ?? !reduceMotion;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function syncPreference(event: MediaQueryListEvent) {
      setReduceMotion(event.matches);
      setPlaying(null);
    }
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    const carousel = carouselRef.current;
    if (!track || !carousel || !shouldPlay || slides.length < 2) return;
    const hover = window.matchMedia("(hover: hover) and (pointer: fine)");

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        window.clearInterval(timer);
        if (!entry.isIntersecting || entry.intersectionRatio < 0.6) return;

        timer = window.setInterval(() => {
          if (
            document.hidden ||
            (hover.matches && carousel.matches(":hover")) ||
            track.matches(":focus-within")
          ) {
            return;
          }
          moveCarousel(track, 1, !reduceMotion);
        }, 3200);
      },
      { threshold: 0.6 },
    );
    observer.observe(track);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [reduceMotion, shouldPlay, slides.length]);

  if (!slides.length) return <h2 className="mb-6 font-display text-2xl text-sand">{name}</h2>;

  function move(direction: -1 | 1) {
    if (trackRef.current) moveCarousel(trackRef.current, direction, !reduceMotion);
  }

  return (
    <div
      ref={carouselRef}
      className="category-carousel"
      role="group"
      aria-label={`Fotos de ${name}`}
    >
      <div className="category-carousel-header">
        <h2 className="font-display text-2xl text-sand">{name}</h2>
        {slides.length > 1 && (
          <div className="category-carousel-controls">
            <button
              type="button"
              aria-label="Imagen anterior"
              aria-controls={trackId}
              onClick={() => move(-1)}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={shouldPlay ? "Pausar carrusel" : "Reproducir carrusel"}
              aria-controls={trackId}
              onClick={() => setPlaying(!shouldPlay)}
            >
              {shouldPlay ? (
                <Pause size={17} aria-hidden="true" />
              ) : (
                <Play size={17} aria-hidden="true" />
              )}
            </button>
            <button
              type="button"
              aria-label="Imagen siguiente"
              aria-controls={trackId}
              onClick={() => move(1)}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <ul
        id={trackId}
        ref={trackRef}
        className="category-carousel-track"
        data-count={slides.length}
      >
        {slides.map((product) => (
          <li key={product.id}>
            <Link to={`/producto/${product.slug}`}>
              <ProductPhoto imageUrl={product.image_url} alt={titleCase(product.name)} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
