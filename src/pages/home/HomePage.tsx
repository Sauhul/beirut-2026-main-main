import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, MessageCircle, Phone, Ship, Sparkles, Store, Truck } from "lucide-react";
import { ProductCard } from "@components/product/ProductCard";
import { catalogQuery } from "@domain/catalog/queries";
import { usePageTitle } from "@hooks/usePageTitle";
import { productImageSrc } from "@shared/utils/category-images";
import { SITE, whatsappLink } from "@config/site";
import hero from "@assets/hero-levantine-light.jpg";
import souk from "@assets/story-souk.jpg";

export function HomePage() {
  usePageTitle("Delikatessen Beyrouth | Tienda libanesa en Barranquilla");

  const { data } = useQuery(catalogQuery);
  const products = data?.products ?? [];
  const categories = data?.categories ?? [];

  const featured = products.filter((p) => p.featured && p.in_stock).slice(0, 8);

  const tiles = categories
    .filter((c) => products.some((p) => p.category_slug === c.slug))
    .slice(0, 6)
    .map((c) => {
      const sample = products.find((p) => p.category_slug === c.slug && p.image_url);
      const count = products.filter((p) => p.category_slug === c.slug).length;
      
      console.log("DEBUG: Category Tile:", c.slug, "Sample product:", sample?.name, "Count:", count);
      
      return { 
        slug: c.slug, 
        name: c.name, 
        image: productImageSrc(sample?.image_url), 
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
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <div className="arabesque pointer-events-none absolute inset-0 opacity-50" />
        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-[96rem] lg:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-16 lg:py-20 xl:px-24">
            <div className="mb-6 flex items-center gap-3">
              <span className="h-px w-10 bg-gold" />
              <p className="eyebrow">Auténticos sabores del Líbano</p>
            </div>
            <h1 className="font-display text-6xl leading-[0.92] text-foreground sm:text-7xl lg:text-8xl">
              Delikatessen
              <br />
              <span className="italic text-gold">Beyrouth</span>
            </h1>
            <p className="mt-8 max-w-xl text-base font-light leading-8 text-muted-foreground md:text-lg">
              Una tienda libanesa en Barranquilla con más de {SITE.stats.products} productos del
              Medio Oriente: especias, café con cardamomo, dulces de pistacho, conservas y piezas
              para servir la mesa como en casa.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/tienda" className="btn-gold">
                <Store className="h-4 w-4" /> Comprar ahora
              </Link>
            </div>
            <div className="mt-14 grid grid-cols-2 gap-6 border-t border-border pt-7 sm:grid-cols-3">
              <div>
                <p className="eyebrow">Productos</p>
                <p className="mt-1 text-sm text-foreground">Selección importada</p>
              </div>
              <div>
                <p className="eyebrow">Tradición</p>
                <p className="mt-1 text-sm text-foreground">Sabores familiares</p>
              </div>
              <div className="hidden sm:block">
                <p className="eyebrow">Ubicación</p>
                <p className="mt-1 text-sm text-foreground">Barranquilla</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center py-6 lg:py-8 lg:min-h-full">
            <div className="relative w-[90%] lg:w-[85%] h-[42vh] lg:h-[80%] overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={hero}
                alt="Mesa luminosa con hummus, baklava, dátiles, especias y café libanés"
                width={1024}
                height={1408}
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-secondary/35 via-transparent to-transparent lg:bg-linear-to-r lg:from-card/40 lg:to-transparent" />
            </div>
          </div>
        </div>
      </section>

      

      {/* HISTORIA */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-2">
        <div className="relative">
          <img
            src={souk}
            alt="Sacos de especias del Medio Oriente: sumac, zaatar y capullos de rosa"
            width={1200}
            height={1408}
            loading="lazy"
            className="w-full object-cover"
          />
          <div className="absolute -bottom-6 -right-4 hidden bg-gold px-7 py-5 text-center md:block">
            <p className="font-display text-4xl text-primary-foreground">{SITE.stats.years}</p>
            <p className="text-[0.55rem] font-bold tracking-[0.2em] uppercase text-primary-foreground">
              años de tienda
            </p>
          </div>
        </div>

        <div>
          <p className="eyebrow">Nuestra historia</p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-sand md:text-5xl">
            De una cocina familiar de Beirut a la Cra. 43
          </h2>
          <div className="mt-6 h-px w-24 bg-gold" />
          <div className="mt-6 space-y-5 text-sm leading-8 text-muted-foreground">
            <p>
              Delikatessen Beyrouth nació del deseo de encontrar en Barranquilla los sabores que la
              familia traía del Líbano: el zaatar de la abuela, el café con cardamomo de las tardes,
              la baklava del día de fiesta.
            </p>
            <p>
              Hoy somos una tienda de barrio donde se entra a preguntar. Molemos especias, pesamos
              dátiles y explicamos cómo se prepara un hummus como en Beirut. Cada producto se elige
              probándolo primero: si no lo servimos en nuestra mesa, no entra a los estantes.
            </p>
            <p>
              Atendemos a familias libanesas, sirias y palestinas de la ciudad, a restaurantes de
              comida árabe y a cualquiera con curiosidad por el Medio Oriente.
            </p>
          </div>
          <Link to="/contacto" className="btn-outline-gold mt-8">
            <MapPin className="h-4 w-4" /> Cómo llegar
          </Link>
        </div>
      </section>

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
              <div className="relative block aspect-[5/6] overflow-hidden rounded-t-2xl" style={{ backgroundColor: "#f5f0dc" }}>
                <img
                  src={t.image}
                  alt={t.name}
                  loading="lazy"
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-secondary/80 to-transparent transition-opacity duration-300 group-hover:from-secondary/90" />
              </div>
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

      {/* DESTACADOS */}
      <section className="border-y border-border bg-muted py-24">
        <div className="mx-auto max-w-7xl px-5">1
          <div className="text-center">
            <p className="eyebrow">Selección de la casa</p>
            <h2 className="mt-3 font-display text-4xl text-sand md:text-5xl">Los más pedidos</h2>
            <div className="rule-gold mt-5" />
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {featured.length === 0 && (
            <p className="mt-14 text-center text-sm text-muted-foreground">
              Pronto tendremos más productos destacados.
            </p>
          )}
          <div className="mt-12 text-center">
            <Link to="/tienda" className="btn-gold">
              Ver más de 100 productos
            </Link>
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
