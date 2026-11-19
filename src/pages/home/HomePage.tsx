import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Clock, MapPin, Phone, Ship, Store, Truck } from "lucide-react";
import { FeaturedProductsCarousel } from "./FeaturedProductsCarousel";
import { catalogQuery } from "@domain/catalog/queries";
import { usePageTitle } from "@hooks/usePageTitle";
import { categoryImage } from "@shared/utils/category-images";
import { ProductPhoto } from "@components/product/ProductPhoto";
import { SITE } from "@config/site";
import { HeroVideo } from "./HeroVideo";

gsap.registerPlugin(useGSAP);

export function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const motion = gsap.matchMedia();

    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "expo.out" } })
        .from("[data-enter='line']", { yPercent: 105, stagger: 0.09, duration: 0.85 })
        .from(mediaRef.current, { y: 24, opacity: 0.65, duration: 0.75 }, 0.12)
        .from("[data-enter='detail']", { y: 10, duration: 0.42, stagger: 0.07 }, 0.18);
    });

    return () => motion.revert();
  }, { scope: heroRef });
  usePageTitle("Delikatessen Beyrouth | Tienda libanesa en Barranquilla");

  const { data, isPending } = useQuery(catalogQuery);
  const products = data?.products ?? [];
  const categories = data?.categories ?? [];

  const available = products.filter((product) => product.in_stock);
  const featured = [
    ...available.filter((product) => product.featured),
    ...available.filter((product) => !product.featured),
  ].slice(0, 10);

  const tiles = categories
    .filter((c) => products.some((p) => p.category_slug === c.slug))
    .slice(0, 6)
    .map((c) => {
      const sample = products.find((p) => p.category_slug === c.slug && p.image_url);
      const count = products.filter((p) => p.category_slug === c.slug).length;

      return { 
        slug: c.slug, 
        name: c.name, 
        image: categoryImage(c.slug, sample?.image_url),
        count 
      };
    });

  const PILLARS = [
    {
      icon: Ship,
      title: "Importación directa",
      text: "Traemos cada lote desde Líbano, Siria y Turquía, sin intermediarios que encarezcan la mesa.",
    },
    {
      icon: Store,
      title: "Tienda física en El Prado",
      text: "Puedes venir, oler las especias, probar el café y pedir consejo sobre cada producto.",
    },
    {
      icon: Truck,
      title: "Domicilios en Barranquilla y toda Colombia",
      text: "Coordinamos entregas y envíos al resto del país.",
    },
  ];

  const STEPS = [
    {
      n: "01",
      title: "Elige tus productos",
      text: "Explora el catálogo por categoría o búscalo por nombre.",
    },
    {
      n: "02",
      title: "Confirma tu pedido",
      text: "Agrégalo al carrito y paga en línea con Wompi, o escríbenos por WhatsApp.",
    },
    {
      n: "03",
      title: "Recibe o recoge",
      text: "Domicilio en Barranquilla o recogida en la tienda el mismo día.",
    },
  ];

  return (
    <div className="route-page">
      <section ref={heroRef} className="beirut-hero">
        <div className="beirut-hero-inner">
          <div className="beirut-hero-copy">
            <h1 className="beirut-hero-title">
              <span className="beirut-hero-line">
                <span data-enter="line">Sabores</span>
              </span>
              <span className="beirut-hero-line">
                <em data-enter="line">del Líbano.</em>
              </span>
            </h1>
            <p data-enter="detail" className="beirut-hero-description">
              Café con cardamomo, dulces de pistacho y especias del Mediterráneo.
              Encuéntralos en Delikatessen Beyrouth, en Barranquilla.
            </p>
            <div data-enter="detail">
              <Link to="/tienda" className="beirut-hero-cta">
                Explorar la tienda <ArrowUpRight size={19} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div ref={mediaRef} className="beirut-hero-video">
            <HeroVideo />
          </div>
        </div>
      </section>

      <FeaturedProductsCarousel products={featured} loading={isPending} />

      {/* PILARES */}
      <section className="arabesque border-y border-border bg-muted py-20">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <p className="eyebrow">Por qué comprarnos</p>
            <h2 className="mt-3 font-display text-4xl text-sand md:text-5xl">
              La tienda, en corto
            </h2>
            <div className="rule-gold mt-5" />
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="border-t border-gold/40 pt-6">
                <p.icon className="h-7 w-7 text-gold" />
                <h3 className="mt-4 font-display text-2xl text-sand">{p.title}</h3>
                <p className="mt-3 text-xs leading-7 text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section className="border-y border-border bg-muted py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <p className="eyebrow">Qué encuentras</p>
            <h2 className="mt-3 font-display text-4xl text-sand md:text-5xl">Nuestras categorías</h2>
            <div className="rule-gold mt-5" />
          </div>

        <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3 justify-center">
          {tiles.slice(0, 6).map((t) => (                
            <Link
              key={t.slug}
              to={`/tienda?categoria=${t.slug}`}
              className="card-onyx group flex flex-col overflow-hidden rounded-2xl max-w-sm w-full mx-auto"
            >
              <ProductPhoto imageUrl={t.image} alt="" />
              <div className="flex flex-1 flex-col p-5">
                <p className="font-display text-xl text-sand">{t.name}</p>
                <p className="mt-1 text-[0.58rem] font-bold tracking-[0.2em] uppercase text-gold">
                  {t.count} productos
                </p>
              </div>
            </Link>
          ))}
        </div>
        </div>
      </section>

      {/* CÓMO COMPRAR */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="text-center">
          <p className="eyebrow">Cómo comprar</p>
          <h2 className="mt-3 font-display text-4xl text-sand md:text-5xl">Tres pasos</h2>
          <div className="rule-gold mt-5" />
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="card-onyx p-8">
              <p className="font-display text-5xl text-gold/60">{s.n}</p>
              <h3 className="mt-4 font-display text-2xl text-sand">{s.title}</h3>
              <p className="mt-3 text-xs leading-7 text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VISÍTANOS */}
      <section className="arabesque border-t border-border bg-muted py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2">
          <div>
            <p className="eyebrow">Visítanos</p>
            <h2 className="mt-3 font-display text-4xl leading-tight text-sand md:text-5xl">
              Te esperamos en la tienda
            </h2>
            <div className="mt-6 h-px w-24 bg-gold" />
            <ul className="mt-8 space-y-6 text-sm text-muted-foreground">
              <li className="flex gap-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <span>
                  <span className="block text-[0.6rem] font-bold tracking-[0.22em] uppercase text-gold">
                    Dirección
                  </span>
                  {SITE.address}
                </span>
              </li>
              <li className="flex gap-4">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <span>
                  <span className="block text-[0.6rem] font-bold tracking-[0.22em] uppercase text-gold">
                    Horarios
                  </span>
                  {SITE.hoursWeek}
                  <br />
                  {SITE.hoursSunday}
                </span>
              </li>
              <li className="flex gap-4">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-gold" />
                <span>
                  <span className="block text-[0.6rem] font-bold tracking-[0.22em] uppercase text-gold">
                    Pedidos
                  </span>
                  {SITE.phoneDisplay}
                </span>
              </li>
            </ul>
            <Link to="/tienda" className="btn-gold mt-10">
              <Store className="h-4 w-4" /> Ir a la tienda
            </Link>
          </div>

          <div className="min-h-[380px] border border-border">
            <iframe
              title="Mapa de Delikatessen Beyrouth"
              src={SITE.mapEmbed}
              className="h-full min-h-[380px] w-full"
              loading="lazy"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
