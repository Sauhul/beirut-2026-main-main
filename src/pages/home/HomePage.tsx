import { useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ShoppingCart } from "lucide-react";
import hero from "@assets/hero-mesa.jpg";
import { catalogQuery } from "@domain/catalog/queries";
import { usePageTitle } from "@hooks/usePageTitle";
import { getMotionQuality } from "@hooks/useAnimationQuality";
import { productImageSrc } from "@shared/utils/category-images";
import { formatCOP } from "@shared/utils/format";
import { useCart } from "@domain/cart/use-cart";
import { toast } from "sonner";

gsap.registerPlugin(ScrollTrigger);

const IMG_BASE = "https://unjojlgwgbcxyxqqkjbe.supabase.co/storage/v1/object/public/product-images/products/";

// Category tiles config — imágenes reales de productos del catálogo
const CATEGORY_TILES = [
  { slug: "cafeteras-teteras", label: "Cafeteras y Teteras", image: `${IMG_BASE}brioni-cezve-cafetera-turca-de-granito-azul.jpg` },
  { slug: "cafe-te", label: "Café y Té", image: `${IMG_BASE}cafe-maatouk-450gr.jpg` },
  { slug: "frutos-secos", label: "Frutos Secos", image: `${IMG_BASE}datiles-kilo.jpg` },
  { slug: "panaderia", label: "Panadería", image: `${IMG_BASE}pan-arabe.jpg` },
  { slug: "especias-hierbas", label: "Especias y Hierbas", image: `${IMG_BASE}zaatar-500gr.jpg` },
  { slug: "salsas-condimentos", label: "Salsas y Condimentos", image: `${IMG_BASE}tahine-454gr.jpg` },
];

export function HomePage() {
  usePageTitle("BEIRUT · Sabores del Líbano en tu mesa");
  const { data } = useQuery(catalogQuery);
  const { add } = useCart();
  const featured = data?.products.filter((p) => p.featured).slice(0, 3) ?? [];
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const motion = getMotionQuality();
      gsap.set(".motion-ready", { autoAlpha: 1 });
      if (motion === "minimal") return;

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".hero-title", { y: 48, autoAlpha: 0, duration: 0.9 })
        .from(".hero-sub", { y: 24, autoAlpha: 0, duration: 0.6 }, "-=0.5")
        .from(".hero-cta", { y: 20, autoAlpha: 0, duration: 0.5 }, "-=0.35");

      gsap.utils.toArray<HTMLElement>(".reveal-section").forEach((section) => {
        gsap.from(section.querySelectorAll(".reveal-item"), {
          y: 40,
          autoAlpha: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        });
      });

      ScrollTrigger.refresh();
    },
    {
      scope: containerRef,
      dependencies: [featured.length],
      revertOnUpdate: true,
    },
  );

  return (
    <div ref={containerRef} className="route-page overflow-hidden">

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="relative flex items-center justify-center overflow-hidden"
        style={{ minHeight: "calc(100vh - 6rem)" }}
      >
        {/* Background image */}
        <img
          src={hero}
          alt="Mesa libanesa"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(20,8,2,0.72) 0%, rgba(30,12,4,0.68) 50%, rgba(10,5,0,0.75) 100%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
          <h1
            className="hero-title motion-ready font-display font-black uppercase leading-[0.9] tracking-[0.02em]"
            style={{
              fontSize: "clamp(3rem, 9vw, 6.5rem)",
              color: "#ffffff",
              textShadow: "0 4px 32px rgba(0,0,0,0.5)",
            }}
          >
            VIVE EL SABOR
            <br />
            <span style={{ color: "var(--dk-gold)" }}>DE BEIRUT</span>
          </h1>

          <p
            className="hero-sub motion-ready mx-auto mt-6 max-w-lg leading-7"
            style={{
              fontSize: "1rem",
              color: "rgba(255,255,255,0.8)",
              letterSpacing: "0.02em",
            }}
          >
            Delicias artesanales premium, elaboradas con tradición libanesa
          </p>

          <div className="hero-cta motion-ready mt-10 flex justify-center">
            <Link
              to="/tienda"
              className="dk-btn-primary"
            >
              VER LA COLECCIÓN
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED SPECIALTIES ─────────────────────────── */}
      <section
        className="reveal-section px-5 py-16"
        style={{ background: "var(--dk-cream)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="reveal-item mb-10 text-center">
            <h2 className="dk-section-title">ESPECIALIDADES DESTACADAS</h2>
            <div className="dk-divider mx-auto mt-3" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => {
              const imgSrc = productImageSrc(p.image_url);

              return (
                <article
                  key={p.id}
                  className="reveal-item dk-product-card group"
                >
                  {/* Image */}
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

                  {/* Info */}
                  <div className="p-4">
                    <Link to={`/producto/${p.slug}`}>
                      <h3
                        className="font-display font-bold leading-tight"
                        style={{ fontSize: "1rem", color: "var(--dk-brown)" }}
                      >
                        {p.name}
                      </h3>
                    </Link>
                    <p
                      className="mt-1 line-clamp-2 leading-5"
                      style={{ fontSize: "0.8rem", color: "rgba(61,26,10,0.6)" }}
                    >
                      {p.description}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className="font-display font-black"
                        style={{ fontSize: "1.15rem", color: "var(--dk-brown)" }}
                      >
                        {formatCOP(p.price)}
                      </span>
                    </div>

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
                      className="dk-btn-cart mt-3 w-full"
                      aria-label={`Agregar ${p.name} al carrito`}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      AGREGAR AL CARRITO
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── DISCOVER CATEGORIES ──────────────────────────── */}
      <section
        className="reveal-section px-5 py-16"
        style={{ background: "var(--dk-marble)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="reveal-item mb-10 text-center">
            <h2 className="dk-section-title">DESCUBRE NUESTRAS CATEGORÍAS</h2>
            <div className="dk-divider mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {CATEGORY_TILES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/tienda?categoria=${cat.slug}`}
                className="reveal-item dk-category-tile group"
              >
                <div className="overflow-hidden rounded" style={{ aspectRatio: "1 / 1" }}>
                  <img
                    src={cat.image}
                    alt={cat.label}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-107"
                  />
                </div>
                <p
                  className="mt-2 text-center font-sans font-black uppercase"
                  style={{
                    fontSize: "0.62rem",
                    letterSpacing: "0.16em",
                    color: "var(--dk-brown)",
                  }}
                >
                  {cat.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOP BANNER ──────────────────────────────────── */}
      <section
        className="relative overflow-hidden px-5 py-20"
        style={{ background: "var(--dk-brown)" }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4a843' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p
            className="font-sans font-black uppercase tracking-[0.3em]"
            style={{ fontSize: "0.68rem", color: "rgba(229,196,120,0.7)" }}
          >
            ✦ BEIRUT DELIKATESSEN ✦
          </p>
          <h2
            className="mt-4 font-display font-black uppercase leading-tight"
            style={{
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              color: "var(--dk-cream)",
            }}
          >
            Sabores Libaneses Auténticos
            <br />
            <span style={{ color: "var(--dk-gold)" }}>En Cada Bocado</span>
          </h2>
          <p
            className="mx-auto mt-5 max-w-lg leading-7"
            style={{ fontSize: "0.9rem", color: "rgba(229,196,120,0.7)" }}
          >
            Desde especias hasta dulces, aceites de oliva hasta panes artesanales — 
            todo obtenido de los mejores productores libaneses, entregado a tu mesa en Colombia.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/tienda" className="dk-btn-gold">
              VER TODOS LOS PRODUCTOS
            </Link>
            <Link to="/contacto" className="dk-btn-outline-light">
              SABER MÁS
            </Link>
          </div>
        </div>
      </section>

      {/* ── ALL PRODUCTS GRID (compact teaser) ───────────── */}
      <section
        className="reveal-section px-5 py-16"
        style={{ background: "var(--dk-cream)" }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="reveal-item mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="dk-section-title">NUESTRA COLECCIÓN</h2>
              <div className="dk-divider mt-3" />
            </div>
            <Link to="/tienda" className="dk-btn-outline-brown text-xs">
              VER TODO →
            </Link>
          </div>

          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {(data?.products ?? []).slice(0, 8).map((p) => {
              const imgSrc = productImageSrc(p.image_url);

              return (
                <article key={p.id} className="reveal-item dk-product-card group">
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
                  <div className="p-3">
                    <Link to={`/producto/${p.slug}`}>
                      <h3
                        className="font-display font-bold line-clamp-1"
                        style={{ fontSize: "0.88rem", color: "var(--dk-brown)" }}
                      >
                        {p.name}
                      </h3>
                    </Link>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span
                        className="font-sans font-black"
                        style={{ fontSize: "0.88rem", color: "var(--dk-brown)" }}
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
                          toast.success(`${p.name} agregado`);
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
        </div>
      </section>
    </div>
  );
}
