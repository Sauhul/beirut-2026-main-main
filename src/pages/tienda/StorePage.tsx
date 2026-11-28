import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUpRight,
  ArrowDownWideNarrow,
  ChevronDown,
  Package,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { ProductCard } from "@components/product/ProductCard";
import { catalogSectionUrl, groupCatalog, resolveCatalogGroups } from "@domain/catalog/groups";
import { catalogQuery } from "@domain/catalog/queries";
import { catalogSearchMatches, catalogSearchTerms } from "@domain/catalog/search";
import { useEntrance } from "@hooks/useEntrance";
import { usePageTitle } from "@hooks/usePageTitle";
const sectionNotes: Record<string, string> = {
  "cafe-bebidas": "Para empezar el día o alargar la sobremesa.",
  "pan-lacteos": "Los infaltables de una mesa para compartir.",
  dulces: "Tradición libanesa, bocado a bocado.",
  "frutos-secos-snacks": "Un antojo, una visita, una buena conversación.",
  "salsas-condimentos": "El sabor de tus recetas empieza aquí.",
  "conservas-granos": "Ingredientes que siempre viene bien tener a mano.",
  utensilios: "Piezas para preparar, servir y disfrutar.",
};

gsap.registerPlugin(useGSAP);

export function StorePage() {
  usePageTitle("Nuestra Tienda | Delikatessen Beyrouth");

  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const introRef = useRef<HTMLElement>(null);
  const catalogRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const previousSection = useRef("");
  const { data, isPending } = useQuery(catalogQuery);
  const groups = useMemo(() => (data ? groupCatalog(data) : []), [data]);
  const category = params.get("categoria");
  const query = (params.get("q") ?? "").trim();
  const terms = catalogSearchTerms(query);
  const featured = terms.length === 0 && params.get("destacados") === "1";
  const requestedOrder = params.get("orden") ?? "seleccion";
  const order = ["precio-asc", "precio-desc", "nombre"].includes(requestedOrder)
    ? requestedOrder
    : "seleccion";
  const selectedGroups = resolveCatalogGroups(groups, category);
  const filtering = Boolean(query) || featured;
  const activeGroup = !filtering && selectedGroups.length === 1 ? selectedGroups[0] : undefined;
  const title = query
    ? `Resultados para «${query}»`
    : featured
      ? "Productos destacados"
      : (activeGroup?.name ?? "Todos los productos");

  const sections = filtering
    ? groups
        .map((group) => ({
          ...group,
          products: group.products.filter((product) => {
            if (featured) return product.featured;
            return catalogSearchMatches(terms, [
              product.name,
              product.category_name,
              group.name,
              product.description,
            ]);
          }),
        }))
        .filter(({ products }) => products.length > 0)
    : selectedGroups.length
      ? selectedGroups
      : groups;
  const orderedSections = sections.map((section) => ({
    ...section,
    products:
      order === "seleccion"
        ? section.products
        : [...section.products].sort((a, b) =>
            order === "precio-asc"
              ? a.price - b.price
              : order === "precio-desc"
                ? b.price - a.price
                : a.name.localeCompare(b.name, "es"),
          ),
  }));
  const count = sections.reduce((total, section) => total + section.products.length, 0);
  const showSectionHeadings = !activeGroup;
  const sectionKey = query
    ? `q:${query}`
    : featured
      ? "featured"
      : category
        ? `category:${category}`
        : "";

  useEntrance(introRef);
  useEntrance(resultsRef, JSON.stringify([sectionKey, title]));

  useEffect(() => {
    if (previousSection.current === sectionKey) return;
    const frame = requestAnimationFrame(() => {
      catalogRef.current?.scrollIntoView({ block: "start", behavior: "instant" });
      previousSection.current = sectionKey;
    });
    return () => cancelAnimationFrame(frame);
  }, [sectionKey]);

  useGSAP(
    () => {
      const motion = gsap.matchMedia();
      motion.add("(prefers-reduced-motion: no-preference)", () => {
        const items = Array.from(
          resultsRef.current?.querySelectorAll("[data-catalog-item]") ?? [],
        ).slice(0, 8);
        if (items.length) {
          gsap.from(items, {
            opacity: 0.65,
            y: 14,
            duration: 0.5,
            stagger: { amount: 0.17 },
            ease: "power2.out",
            clearProps: "opacity,transform",
          });
        }
      });
      return () => motion.revert();
    },
    {
      scope: resultsRef,
      dependencies: [sectionKey, data],
      revertOnUpdate: true,
    },
  );

  return (
    <div className="route-page store-page">
      <header ref={introRef} className="store-intro arabesque border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-9 text-center sm:px-6 sm:py-12">
          <p data-enter="detail" className="eyebrow">
            Beirut · Delikatessen
          </p>
          <h1 className="beirut-hero-line mt-4 font-display text-5xl leading-none text-sand sm:text-6xl">
            <span data-enter="line">Nuestra tienda</span>
          </h1>
          <p data-enter="detail" className="mx-auto mt-4 max-w-md text-base text-muted-foreground">
            Ingredientes y utensilios para la mesa libanesa.
          </p>
          <a href="#store-catalog" className="store-catalog-link">
            Encuentra tu próximo favorito <ArrowDown aria-hidden="true" size={14} />
          </a>
        </div>
      </header>

      <div className="store-reassurance mx-auto max-w-7xl px-4 sm:px-6">
        <span>
          <Truck aria-hidden="true" size={18} /> Envíos a toda Colombia
        </span>
        <span>
          <Store aria-hidden="true" size={18} /> Recoge en Barranquilla
        </span>
        <span>
          <ShieldCheck aria-hidden="true" size={18} /> Pago seguro con Wompi
        </span>
      </div>

      <div
        ref={catalogRef}
        id="store-catalog"
        className={`mx-auto grid max-w-7xl scroll-mt-44 gap-6 lg:scroll-mt-36 px-4 pb-10 pt-7 sm:px-6 lg:gap-8 lg:pb-14 ${groups.length ? "lg:grid-cols-[13rem_minmax(0,1fr)]" : ""}`}
      >
        {groups.length > 0 && (
          <>
            <nav
              aria-label="Categorías de la tienda"
              className="store-sidebar hidden max-h-[calc(100dvh-9rem)] overflow-y-auto lg:sticky lg:top-32 lg:block lg:self-start"
            >
              <p className="store-sidebar-label">Explora la tienda</p>
              <Link
                to="/tienda"
                aria-current={!filtering && !selectedGroups.length ? "page" : undefined}
                className="store-category-link mb-2 flex min-h-11 items-center border-b border-border px-3 font-semibold text-sand hover:text-accent aria-[current=page]:text-accent"
              >
                Todos los productos
              </Link>
              {groups.map((group) => (
                <Link
                  key={group.slug}
                  to={catalogSectionUrl(group.slug)}
                  aria-current={activeGroup === group ? "page" : undefined}
                  className="store-category-link flex min-h-11 items-center justify-between gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted aria-[current=page]:bg-muted aria-[current=page]:font-semibold aria-[current=page]:text-sand"
                >
                  <span>{group.name}</span>
                  <span className="store-category-count" aria-hidden="true">
                    {group.products.length}
                  </span>
                </Link>
              ))}
              <Link to="/al-por-mayor" className="store-sidebar-wholesale">
                <Package aria-hidden="true" size={22} />
                <strong>¿Compras para tu negocio?</strong>
                <span>
                  Conoce nuestra venta al por mayor <ArrowUpRight aria-hidden="true" size={14} />
                </span>
              </Link>
            </nav>

            <div className="store-mobile-controls relative lg:hidden">
              <label htmlFor="store-category" className="mb-1.5 block text-sm font-semibold">
                Ir a una sección
              </label>
              <div className="relative">
                <select
                  id="store-category"
                  value={activeGroup?.slug ?? ""}
                  onChange={(event) => {
                    const target = event.currentTarget.value;
                    navigate(target ? catalogSectionUrl(target) : "/tienda");
                  }}
                  className="min-h-12 w-full appearance-none rounded-md border border-input bg-card py-2 pl-3 pr-9 text-base text-sand focus-visible:outline-2 focus-visible:outline-gold"
                >
                  <option value="">Todos los productos</option>
                  {groups.map((group) => (
                    <option key={group.slug} value={group.slug}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gold"
                />
              </div>
            </div>
          </>
        )}

        <section
          ref={resultsRef}
          aria-labelledby="store-results-heading"
          className="@container/catalog min-w-0"
        >
          <div className="store-results-bar">
            <div>
              <h2
                id="store-results-heading"
                className="beirut-hero-line min-w-0 font-display text-3xl leading-tight break-words text-sand sm:text-4xl"
              >
                <span data-enter="line">{title}</span>
              </h2>
              {!isPending && (
                <span
                  role="status"
                  className="mt-1 block text-sm tabular-nums text-muted-foreground"
                >
                  {count} {count === 1 ? "producto" : "productos"}
                </span>
              )}
            </div>
            <div className="store-sort">
              <label htmlFor="store-sort">
                <ArrowDownWideNarrow aria-hidden="true" size={15} />
                Ordenar por <span className="sr-only">dentro de cada categoría</span>
              </label>
              <div className="store-sort-control">
                <select
                  id="store-sort"
                  value={order}
                  onChange={(event) => {
                    const next = new URLSearchParams(params);
                    if (event.target.value === "seleccion") next.delete("orden");
                    else next.set("orden", event.target.value);
                    setParams(next, { preventScrollReset: true });
                  }}
                >
                  <option value="seleccion">Nuestra selección</option>
                  <option value="precio-asc">Precio: menor a mayor</option>
                  <option value="precio-desc">Precio: mayor a menor</option>
                  <option value="nombre">Nombre: A a Z</option>
                </select>
                <span className="store-sort-chevron" aria-hidden="true">
                  <ChevronDown size={16} />
                </span>
              </div>
            </div>
          </div>

          {(filtering || activeGroup) && (
            <Link
              to="/tienda"
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-gold underline underline-offset-4"
            >
              Ver toda la tienda <ArrowUpRight aria-hidden="true" size={15} />
            </Link>
          )}

          <div className="mt-5 space-y-9 sm:mt-6">
            {orderedSections.map((section, sectionIndex) => (
              <section
                key={section.slug}
                aria-label={section.name}
                className="border-b border-border pb-8 last:border-0 last:pb-0"
              >
                {showSectionHeadings && (
                  <div className="store-section-heading">
                    <div>
                      <h3 className="font-display text-2xl text-sand">
                        <Link
                          to={catalogSectionUrl(section.slug)}
                          className="inline-flex items-center gap-2 hover:text-accent"
                        >
                          {section.name}{" "}
                          <ArrowUpRight aria-hidden="true" className="size-4 text-gold" />
                        </Link>
                      </h3>
                      {sectionNotes[section.slug] && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {sectionNotes[section.slug]}
                        </p>
                      )}
                    </div>
                    <span className="store-section-count">
                      {section.products.length}{" "}
                      {section.products.length === 1 ? "producto" : "productos"}
                    </span>
                  </div>
                )}
                <div className="catalog-card-grid">
                  {section.products.map((product, productIndex) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      editorial
                      loading={sectionIndex === 0 && productIndex < 2 ? "eager" : "lazy"}
                      compact
                      headingLevel={showSectionHeadings ? 4 : 3}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {isPending && (
            <p role="status" className="py-5 text-muted-foreground">
              Cargando productos…
            </p>
          )}
          {!isPending && count === 0 && (
            <div className="py-6 text-sm text-muted-foreground">
              <p>
                {query
                  ? "No encontramos productos con esa búsqueda."
                  : "No hay productos disponibles."}
              </p>
              {query && (
                <Link
                  to="/tienda"
                  className="mt-2 inline-flex min-h-11 items-center text-gold underline underline-offset-4"
                >
                  Ver todos los productos
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
      <section
        className="store-wholesale-banner mx-auto max-w-7xl"
        aria-labelledby="store-wholesale-title"
      >
        <div>
          <p className="eyebrow">También somos parte de tu cocina</p>
          <h2 id="store-wholesale-title">Los sabores de Beirut, en tu negocio.</h2>
          <p>Insumos para restaurantes y tiendas, con calidad y puntualidad en cada entrega.</p>
        </div>
        <Link to="/al-por-mayor">
          Hablemos de tu pedido <ArrowUpRight aria-hidden="true" size={18} />
        </Link>
      </section>
    </div>
  );
}
