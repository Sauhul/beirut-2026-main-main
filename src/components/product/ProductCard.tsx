import { useRef } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Product } from "@domain/catalog/types";
import { categoryImage } from "@shared/utils/category-images";
import { formatCOP } from "@shared/utils/format";
import { formatPresentation } from "@shared/utils/product-format";
import { useCart } from "@domain/cart/use-cart";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const cardRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Animación de entrada (fade + slide up)
  useGSAP(() => {
    if (!cardRef.current) return;
    gsap.from(cardRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: "power2.out",
    });
  }, { scope: cardRef });

  // Animación de hover
  useGSAP(() => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const onMouseEnter = () => {
      gsap.to(card, {
        y: -8,
        duration: 0.4,
        ease: "power2.out",
      });
    };
    const onMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        duration: 0.3,
        ease: "power1.out",
      });
    };
    card.addEventListener("mouseenter", onMouseEnter);
    card.addEventListener("mouseleave", onMouseLeave);
    return () => {
      card.removeEventListener("mouseenter", onMouseEnter);
      card.removeEventListener("mouseleave", onMouseLeave);
    };
  }, { scope: cardRef });

  return (
    <article
      className="product-shell group flex h-full flex-col overflow-hidden transition duration-400"
      style={{
        background: "linear-gradient(160deg, #2a1f0e 0%, #1e1508 55%, #140f05 100%)",
        border: "1px solid rgba(201,162,39,0.25)",
        borderRadius: "0.35rem",
        boxShadow: "0 2px 16px -6px rgba(0,0,0,0.6), inset 0 1px 0 rgba(201,162,39,0.08)",
      }}
    >
      {/* Imagen */}
      <Link
        to={`/producto/${product.slug}`}
        className="relative block overflow-hidden"
        style={{ aspectRatio: "1 / 1" }}
      >
        {/* Fondo blur */}
        <img
          src={categoryImage(product.category_slug, product.image_url)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-125 object-cover opacity-20 blur-2xl transition duration-700 group-hover:scale-150 group-hover:opacity-30"
        />
        {/* Imagen principal */}
        <img
          src={categoryImage(product.category_slug, product.image_url)}
          alt={product.name}
          loading="lazy"
          width={900}
          height={900}
          className="relative h-full w-full object-contain p-5 transition duration-600 group-hover:scale-108"
        />
        {/* Chip categoría */}
        <span
          className="absolute left-3 top-3 text-[9px] font-black uppercase tracking-[0.18em] px-2.5 py-1"
          style={{
            background: "rgba(13,10,4,0.82)",
            border: "1px solid rgba(201,162,39,0.35)",
            borderRadius: "0.2rem",
            color: "var(--lightgold)",
            backdropFilter: "blur(6px)",
          }}
        >
          {product.category_name}
        </span>

        {/* Overlay hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-400 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(13,10,4,0.4), transparent 60%)",
          }}
        />
      </Link>

      {/* Línea divisora dorada */}
      <div
        className="h-px mx-3"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(201,162,39,0.35), transparent)",
        }}
      />

      {/* Info */}
      <div className="flex flex-1 flex-col p-4 pt-3.5">
        <Link to={`/producto/${product.slug}`} className="block">
          <h3
            className="font-display font-black leading-tight transition-colors duration-200 group-hover:text-primary"
            style={{ fontSize: "1.05rem", letterSpacing: "-0.02em", color: "var(--foreground)" }}
          >
            {product.name}
          </h3>
        </Link>
        <p
          className="mt-1 font-sans font-black uppercase"
          style={{ fontSize: "0.65rem", letterSpacing: "0.2em", color: "rgba(240,230,200,0.4)" }}
        >
          {formatPresentation(product.unit)}
        </p>

        {/* Precio + botón */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span
            className="font-display font-black"
            style={{
              fontSize: "1.2rem",
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #e8c97a, #c9a227)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            {formatCOP(product.price)}
          </span>

          <button
            ref={buttonRef}
            onClick={() => {
              add({
                id: product.id,
                slug: product.slug,
                name: product.name,
                price: product.price,
                unit: product.unit,
                categorySlug: product.category_slug,
                imageUrl: product.image_url,
              });
              // Animación click del botón
              if (buttonRef.current) {
                gsap.to(buttonRef.current, {
                  scale: 0.85,
                  duration: 0.15,
                  yoyo: true,
                  repeat: 1,
                  ease: "power1.inOut",
                });
              }
              toast.success(`${product.name} agregado al carrito`);
            }}
            aria-label={`Agregar ${product.name} al carrito`}
            className="inline-flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-1 hover:scale-110 active:scale-95 group"
            style={{
              background: "linear-gradient(135deg, #8b6914, #c9a227 50%, #a07820)",
              border: "1px solid rgba(212,168,67,0.5)",
              borderRadius: "0.2rem",
              padding: "0.45rem 0.85rem",
              fontSize: "0.65rem",
              fontWeight: 900,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#1a1208",
              boxShadow: "0 2px 12px -4px rgba(201,162,39,0.4)",
            }}
          >
            <ShoppingCart className="h-3 w-3 group-hover:rotate-12 transition-transform" />
            Agregar
          </button>
        </div>
      </div>

      {/* Esquinas ornamentales */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-400"
        aria-hidden
        style={{ borderRadius: "0.35rem", border: "1px solid rgba(201,162,39,0.5)" }}
      />
    </article>
  );
}
