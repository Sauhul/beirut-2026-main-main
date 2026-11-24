import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUpRight, Clock, MapPin, Phone, Ship, Store, Truck } from "lucide-react";
import { FeaturedProducts } from "./FeaturedProducts";
import { groupCatalog } from "@domain/catalog/groups";
import { catalogQuery } from "@domain/catalog/queries";
import { usePageTitle } from "@hooks/usePageTitle";
import { categoryImage } from "@shared/utils/category-images";
import { ProductPhoto } from "@components/product/ProductPhoto";
import { SITE } from "@config/site";
import coverPhoto from "@assets/hero-productos-beirut.webp";
import logo from "@assets/beirut-logo.png";
import { HeroVideo } from "./HeroVideo";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const motion = gsap.matchMedia();

    motion.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.timeline({ defaults: { ease: "expo.out" } })
        .from("[data-enter='line']", { yPercent: 105, stagger: 0.09, duration: 0.85 })
        .from("[data-enter='detail']", { y: 10, duration: 0.42 }, 0.18);
    });

    return () => motion.revert();
  }, { scope: heroRef });
  usePageTitle("Delikatessen Beyrouth | Tienda libanesa en Barranquilla");

  const { data, isPending } = useQuery(catalogQuery);
  useGSAP(() => {
    if (isPending) return;
    const motion = gsap.matchMedia();

    motion.add("(prefers-reduced-motion: no-preference)", () => {
      const sections = pageRef.current?.querySelectorAll<HTMLElement>("[data-reveal-section]");
      sections?.forEach((section) => {
        const heading = section.querySelector("[data-reveal-heading]");
        const items = section.querySelectorAll("[data-reveal-item]");
        if (!heading || !items.length) return;

        gsap.timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: { trigger: section, start: "clamp(top 88%)", once: true },
        })
          .from(heading, { yPercent: 105, duration: 0.85 })
          .from(items, { y: 20, opacity: 0.7, duration: 0.65, stagger: 0.07 }, 0.15);
      });
    });

    return () => motion.revert();
  }, { scope: pageRef, dependencies: [isPending], revertOnUpdate: true });

  const products = data?.products ?? [];

  const available = products.filter((product) => product.in_stock);
  const featured = [
    ...available.filter((product) => product.featured),
    ...available.filter((product) => !product.featured),
  ].slice(0, 10);

  const tiles = (data ? groupCatalog(data) : []).map((group) => {
    const sample = group.categories
      .map(({ slug }) => group.products.find((product) => product.category_slug === slug && product.image_url))
      .find(Boolean);
    return {
      slug: group.slug,
      name: group.name,
      image: categoryImage(sample?.category_slug, sample?.image_url),
      categories: group.categories.map(({ name }) => name).join(" · "),
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
      text: "Agrégalo al carrito y paga en línea con Wompi. Para consultas, escríbenos por correo.",
    },
    {
      n: "03",
      title: "Recibe o recoge",
      text: "Domicilio en Barranquilla o recogida en la tienda el mismo día.",
    },
  ];

  return (
    <div ref={pageRef} className="route-page">
      <section ref={heroRef} className="beirut-cover" aria-labelledby="home-title">
        <div className="beirut-cover-content">
          <div className="beirut-cover-brand">
            <img src={logo} width={48} height={48} alt="" />
            <span>Delikatessen Beyrouth</span>
          </div>
          <div className="beirut-cover-copy">
            <h1 id="home-title" className="beirut-cover-title">
              <span className="beirut-hero-line">
                <span data-enter="line">Sabores</span>
              </span>
              <span className="beirut-hero-line">
                <em data-enter="line">del Líbano.</em>
              </span>
            </h1>
            <p data-enter="detail" className="beirut-cover-description">
              Café con cardamomo, dulces de pistacho y especias del Mediterráneo, en Barranquilla.
            </p>
          </div>
          <p className="beirut-cover-scroll">
            <ArrowDown size={18} aria-hidden="true" />
            Desliza para explorar
          </p>
        </div>
        <div className="beirut-cover-photo">
          <img
            src={coverPhoto}
            alt="Aceite de oliva Koura, café Najjar con cardamomo, aceitunas verdes y pan con zaatar de Delikatessen Beyrouth"
            fetchPriority="high"
          />
        </div>
      </section>

      <section className="beirut-home-intro" aria-labelledby="home-intro-title">
        <div className="beirut-hero-inner">
          <div>
            <h2 id="home-intro-title" className="beirut-home-intro-title">
              De nuestra tienda a tu mesa
            </h2>
            <p className="beirut-hero-description">
              Encuentra aceitunas, panes y dulces para compartir, y los ingredientes para preparar
              tus platos favoritos.
            </p>
            <Link to="/tienda" className="beirut-hero-cta">
              Explorar la tienda <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <div className="beirut-hero-video">
            <HeroVideo />
          </div>
        </div>
      </section>

      <FeaturedProducts products={featured} loading={isPending} />

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
      <section data-reveal-section className="border-y border-border bg-muted py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="text-center">
            <p className="eyebrow">Qué encuentras</p>
            <h2 className="beirut-hero-line mt-3 font-display text-4xl text-sand md:text-5xl">
              <span data-reveal-heading>Nuestras categorías</span>
            </h2>
            <div className="rule-gold mt-5" />
          </div>

          <div className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {tiles.map((tile) => (
              <Link
                data-reveal-item
                key={tile.slug}
                to={`/tienda?categoria=${tile.slug}`}
                className="card-onyx mx-auto flex w-full max-w-sm flex-col overflow-hidden rounded-2xl"
              >
                <ProductPhoto imageUrl={tile.image} alt="" />
                <div className="flex flex-1 flex-col p-3 sm:p-5">
                  <p className="font-display text-xl text-sand">{tile.name}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {tile.categories}
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
                    Teléfono
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
