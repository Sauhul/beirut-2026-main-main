import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowDown, ArrowUpRight, Clock, MapPin, Phone, Ship, Store, Truck } from "lucide-react";
import { FeaturedProducts } from "./FeaturedProducts";
import { catalogSectionUrl, groupCatalog } from "@domain/catalog/groups";
import { catalogQuery } from "@domain/catalog/queries";
import { usePageTitle } from "@hooks/usePageTitle";
import { useEntrance } from "@hooks/useEntrance";
import { categoryImage } from "@shared/utils/category-images";
import { ProductPhoto } from "@components/product/ProductPhoto";
import { SITE } from "@config/site";
import coverPhoto from "@assets/hero-despensa-beirut-v2.webp";
import { HeroVideo } from "./HeroVideo";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HomePage() {
  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEntrance(heroRef);
  usePageTitle("Delikatessen Beyrouth | Tienda libanesa en Barranquilla");

  const { data, isPending } = useQuery(catalogQuery);
  useGSAP(
    () => {
      const motion = gsap.matchMedia();

      motion.add("(prefers-reduced-motion: no-preference)", () => {
        const sections = pageRef.current?.querySelectorAll<HTMLElement>("[data-reveal-section]");
        sections?.forEach((section) => {
          const heading = section.querySelector("[data-reveal-heading]");
          if (!heading) return;

          const items = section.querySelectorAll("[data-reveal-item]");
          const reveal = gsap.timeline({
            defaults: { ease: "power2.out", clearProps: "transform,opacity" },
            scrollTrigger: { trigger: section, start: "clamp(top 90%)", once: true },
          });
          reveal.from(heading, { y: 30, opacity: 0.55, duration: 0.94 });

          if (items.length) {
            reveal.from(
              items,
              { y: 38, opacity: 0.65, duration: 0.9, stagger: { amount: 0.43 } },
              0.24,
            );
          }
        });
      });

      return () => motion.revert();
    },
    { scope: pageRef, dependencies: [data, isPending], revertOnUpdate: true },
  );

  const products = data?.products ?? [];

  const available = products.filter((product) => product.in_stock);
  const featured = [
    ...available.filter((product) => product.featured),
    ...available.filter((product) => !product.featured),
  ].slice(0, 10);

  const tiles = (data ? groupCatalog(data) : []).map((group) => {
    const sample = group.products.find(({ image_url }) => image_url);
    return {
      slug: group.slug,
      name: group.name,
      image: categoryImage(sample?.category_slug, sample?.image_url),
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
    <div ref={pageRef} className="route-page home-page">
      <section ref={heroRef} className="beirut-cover" aria-labelledby="home-title">
        <div className="beirut-cover-content">
          <div className="beirut-cover-copy">
            <p data-enter="detail" className="eyebrow mb-4 leading-relaxed">
              BEIRUT DELIKATESSEN · DESDE HACE MÁS DE 20 AÑOS
            </p>
            <h1 id="home-title" className="beirut-cover-title">
              <span className="beirut-hero-line">
                <span data-enter="line">El Líbano,</span>
              </span>
              <span className="beirut-hero-line">
                <span data-enter="line">auténtico,</span>
              </span>
              <span className="beirut-hero-line">
                <em data-enter="line">en tu mesa.</em>
              </span>
            </h1>
            <p data-enter="detail" className="beirut-cover-description">
              Por más de 20 años hemos traído a Barranquilla lo mejor de la despensa libanesa:
              especias, tahinis, aceites de oliva, aceitunas, dulces y productos de cuidado
              personal, importados 100% del Líbano.
            </p>
          </div>
          <p className="beirut-cover-scroll">
            <ArrowDown size={18} aria-hidden="true" />
            Desliza para explorar
          </p>
        </div>
        <div data-enter="photo" className="beirut-cover-photo">
          <img
            src={coverPhoto}
            alt="Aceite de oliva, café con cardamomo, pan con zaatar, tahini, melaza de granada, agua de rosas y halva de pistacho"
            fetchPriority="high"
          />
        </div>
      </section>

      <section data-reveal-section className="beirut-home-intro" aria-labelledby="home-intro-title">
        <div className="beirut-hero-inner">
          <div data-reveal-heading>
            <h2 id="home-intro-title" className="beirut-home-intro-title">
              De nuestra tienda a tu mesa
            </h2>
            <p className="beirut-hero-description">
              Somos parte del grupo de Beirut 84 y Parrilla Libanesa, con años compartiendo estos
              sabores en Barranquilla y Cali. También abastecemos a restaurantes de Barranquilla y
              otras ciudades del país, con calidad y puntualidad en cada entrega.
            </p>
            <Link to="/tienda" className="beirut-hero-cta">
              Explorar la tienda <ArrowUpRight size={19} aria-hidden="true" />
            </Link>
          </div>
          <div data-reveal-item className="beirut-hero-video">
            <HeroVideo />
          </div>
        </div>
      </section>

      {/* CATEGORÍAS */}
      <section data-reveal-section className="border-y border-border bg-muted py-10 sm:py-12">
        <div className="@container/catalog mx-auto max-w-7xl px-4 sm:px-5">
          <div className="text-center">
            <p className="eyebrow">Qué encuentras</p>
            <h2 className="beirut-hero-line mt-3 font-display text-3xl text-sand md:text-4xl">
              <span data-reveal-heading>Nuestras categorías</span>
            </h2>
            <div className="rule-gold mt-5" />
          </div>

          <div className="category-garden mt-8">
            {tiles.map((tile) => (
              <Link
                data-reveal-item
                key={tile.slug}
                to={catalogSectionUrl(tile.slug)}
                className="category-garden-link"
              >
                <span className="category-garden-frame">
                  <ProductPhoto imageUrl={tile.image} alt="" className="category-thumbnail" />
                  <span className="category-garden-arrow">
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </span>
                <span className="category-garden-name font-display">{tile.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <FeaturedProducts products={featured} loading={isPending} />

      {/* PILARES */}
      <section
        data-reveal-section
        className="arabesque border-y border-border bg-muted py-12 sm:py-20"
      >
        <div className="mx-auto max-w-7xl px-5">
          <div data-reveal-heading className="text-center">
            <p className="eyebrow">Por qué comprarnos</p>
            <h2 className="mt-3 font-display text-4xl text-sand md:text-5xl">
              La tienda, en corto
            </h2>
            <div className="rule-gold mt-5" />
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((p) => (
              <div data-reveal-item key={p.title} className="border-t border-gold/40 pt-6">
                <p.icon className="h-7 w-7 text-gold" />
                <h3 className="mt-4 font-display text-2xl text-sand">{p.title}</h3>
                <p className="mt-3 text-xs leading-7 text-muted-foreground">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO COMPRAR */}
      <section data-reveal-section className="mx-auto max-w-7xl px-5 py-14 sm:py-24">
        <div data-reveal-heading className="text-center">
          <p className="eyebrow">Cómo comprar</p>
          <h2 className="mt-3 font-display text-4xl text-sand md:text-5xl">Tres pasos</h2>
          <div className="rule-gold mt-5" />
        </div>
        <div className="mt-14 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div data-reveal-item key={s.n} className="card-onyx p-8">
              <p className="font-display text-5xl text-gold/60">{s.n}</p>
              <h3 className="mt-4 font-display text-2xl text-sand">{s.title}</h3>
              <p className="mt-3 text-xs leading-7 text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* VISÍTANOS */}
      <section data-reveal-section className="arabesque border-t border-border bg-muted py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 lg:grid-cols-2">
          <div data-reveal-heading>
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

          <div data-reveal-item className="min-h-[380px] border border-border">
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
