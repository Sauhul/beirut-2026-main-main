import { useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { catalogQuery } from "@domain/catalog/queries";
import { usePageTitle } from "@hooks/usePageTitle";
import { productImageSrc } from "@shared/utils/category-images";
import { getMotionQuality } from "@hooks/useAnimationQuality";
import { formatCOP } from "@shared/utils/format";
import { useCart } from "@domain/cart/use-cart";

gsap.registerPlugin(ScrollTrigger);

export function StorePage() {
  usePageTitle("Tienda · Productos árabes y libaneses | BEIRUT");
  const [searchParams] = useSearchParams();
  const categoria = searchParams.get("categoria") ?? "frutos-secos";
  const { data } = useQuery(catalogQuery);
  const { add } = useCart();
  const containerRef = useRef<HTMLDivElement>(null);

  const products = (data?.products ?? []).filter(
    (p) => !categoria || p.category_slug === categoria,
  );
  const currentCategory = data?.categories.find((c) => c.slug === categoria);

  useGSAP(
    () => {
      const motion = getMotionQuality();
      gsap.set(".store-motion", { autoAlpha: 1 });
      if (motion === "minimal") return;

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".store-title", { y: 40, autoAlpha: 0, duration: 0.8 })
        .from(".store-copy", { y: 18, autoAlpha: 0, duration: 0.5 }, "-=0.38")
        .from(".filter-pill", { y: 14, autoAlpha: 0, stagger: 0.04, duration: 0.4 }, "-=0.28");

      gsap.fromTo(
        ".store-product",
        { autoAlpha: 0, y: 32, scale: 0.96 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          stagger: 0.04,
          duration: 0.5,
          ease: "power2.out",
          delay: 0.12,
        },
      );

      requestAnimationFrame(() => ScrollTrigger.refresh());
    },
    {
      scope: containerRef,
      dependencies: [categoria, data?.products.length, data?.categories.length],
      revertOnUpdate: true,
    },
  );

  return (
    <div
      ref={containerRef}
      className="route-page relative min-h-screen overflow-hidden"
      style={{ background: "var(--dk-cream)" }}
    >
      {/* Page header */}
      <div
        className="px-5 py-12"
        style={{
          background: "var(--dk-brown)",
          borderBottom: "3px solid var(--dk-gold)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <h1
            className="store-title store-motion font-display font-black uppercase"
            style={{
              fontSize: "clamp(2.4rem, 7vw, 5rem)",
              letterSpacing: "0.04em",
              lineHeight: "0.9",
              color: "var(--dk-cream)",
            }}
          >
            {currentCategory ? currentCategory.name : "Shop All"}
          </h1>
          <p
            className="store-copy store-motion mt-4 max-w-lg leading-7"
            style={{ fontSize: "0.9rem", color: "rgba(245,237,214,0.65)" }}
          >
            {currentCategory?.description ??
              "Descubre una despensa árabe hecha para explorar: productos cotidianos, sabores de celebración y favoritos de familia."}
          </p>

          {/* Filter pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {(data?.categories ?? []).map((c) => (
              <FilterLink key={c.id} label={c.name} slug={c.slug} active={categoria === c.slug} />
            ))}
          </div>
        </div>
      </div>

      {/* Product grid */}
      <div className="px-5 py-12">
        <div className="mx-auto max-w-7xl">
          <p
            className="store-motion mb-6 text-sm font-bold"
            style={{ color: "var(--dk-text-muted)" }}
          >
            {products.length} product{products.length !== 1 ? "s" : ""}
            {currentCategory ? ` in ${currentCategory.name}` : ""}
          </p>

          {products.length > 0 ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((p) => {
                const imgSrc = productImageSrc(p.image_url);

                return (
                  <article key={p.id} className="store-product dk-product-card group">
                    <Link
                      to={`/producto/${p.slug}`}
                      className="block overflow-hidden"
                      style={{ aspectRatio: "1 / 1" }}
                    >
                      <img
                        src={imgSrc}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/fallback/baklawa-pistacho.jpg";
                        }}
                      />
                    </Link>

                    {/* Category chip */}
                    <div className="px-3 pt-3">
                      <span
                        className="inline-block rounded px-1.5 py-0.5 font-sans font-black uppercase"
                        style={{
                          fontSize: "0.55rem",
                          letterSpacing: "0.16em",
                          background: "rgba(201,150,42,0.12)",
                          color: "var(--dk-gold)",
                          border: "1px solid rgba(201,150,42,0.3)",
                        }}
                      >
                        {p.category_name}
                      </span>
                    </div>

                    <div className="p-3 pt-1.5">
                      <Link to={`/producto/${p.slug}`}>
                        <h3
                          className="font-display font-bold leading-tight line-clamp-2"
                          style={{
                            fontSize: "0.88rem",
                            color: "var(--dk-brown)",
                          }}
                        >
                          {p.name}
                        </h3>
                      </Link>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span
                          className="font-sans font-black"
                          style={{ fontSize: "0.9rem", color: "var(--dk-brown)" }}
                        >
                          {formatCOP(p.price)}
                        </span>
                        <button
                          onClick={() => {
                            add({
                              id: p.id,
                              slug: p.slug,
                              name: p.name,
                              price: p.price,
                              unit: p.unit,
                              categorySlug: p.category_slug,
                              imageUrl: p.image_url,
                            });
                            toast.success(`${p.name} agregado al carrito`);
                          }}
                          aria-label={`Agregar ${p.name}`}
                          className="dk-btn-icon"
                        >
                          <ShoppingCart className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div
              className="mt-8 rounded p-12 text-center"
              style={{
                border: "1px solid rgba(61,26,10,0.1)",
                background: "#fff",
              }}
            >
              <p className="font-bold" style={{ color: "var(--dk-brown)" }}>
                Esta categoría está vacía por ahora.
              </p>
              <p className="mt-2 text-sm" style={{ color: "var(--dk-text-muted)" }}>
                Vuelve al catálogo completo para seguir explorando.
              </p>
              <Link to="/tienda" className="dk-btn-gold mt-6 inline-flex">
                Ver todo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterLink({ label, slug, active }: { label: string; slug?: string; active: boolean }) {
  return (
    <Link
      to={slug ? `/tienda?categoria=${slug}` : "/tienda"}
      className="filter-pill store-motion dk-store-filter-pill"
      style={
        active
          ? {
              background: "var(--dk-gold)",
              border: "1px solid var(--dk-gold)",
              color: "var(--dk-brown)",
            }
          : {
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(245,237,214,0.2)",
              color: "rgba(245,237,214,0.65)",
            }
      }
    >
      {label}
    </Link>
  );
}
