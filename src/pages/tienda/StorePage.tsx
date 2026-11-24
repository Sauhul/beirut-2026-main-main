import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { ProductCard } from "@components/product/ProductCard";
import { catalogSectionUrl, groupCatalog, resolveCatalogGroups } from "@domain/catalog/groups";
import { catalogQuery } from "@domain/catalog/queries";
import { usePageTitle } from "@hooks/usePageTitle";

gsap.registerPlugin(useGSAP);

const normalize = (value: string) =>
  value.toLocaleLowerCase("es-CO").normalize("NFD").replace(/\p{M}/gu, "");

export function StorePage() {
  usePageTitle("Nuestra Tienda | Delikatessen Beyrouth");

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const resultsRef = useRef<HTMLElement>(null);
  const { data, isPending } = useQuery(catalogQuery);
  const groups = useMemo(() => (data ? groupCatalog(data) : []), [data]);
  const category = params.get("categoria");
  const query = (params.get("q") ?? "").trim();
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const featured = terms.length === 0 && params.get("destacados") === "1";
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
            const text = normalize(
              [product.name, product.category_name, group.name, product.description].join(" "),
            );
            return terms.every((term) => text.includes(term));
          }),
        }))
        .filter(({ products }) => products.length > 0)
    : selectedGroups.length
      ? selectedGroups
      : groups;
  const count = sections.reduce((total, section) => total + section.products.length, 0);
  const showSectionHeadings = !activeGroup;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [category]);

  useGSAP(
    () => {
      if (filtering) return;
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
      dependencies: [category, filtering, data],
      revertOnUpdate: true,
    },
  );

  return (
    <div className="route-page">
      <header className="arabesque border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-10">
          <h1 className="font-display text-4xl leading-none text-sand sm:text-5xl">
            Nuestra tienda
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Ingredientes y utensilios para la mesa libanesa.
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-9 lg:py-9">
        {groups.length > 0 && (
          <>
            <nav
              aria-label="Categorías de la tienda"
              className="hidden max-h-[calc(100dvh-9rem)] overflow-y-auto pr-1 lg:sticky lg:top-32 lg:block lg:self-start"
            >
              <Link
                to="/tienda"
                aria-current={!filtering && !selectedGroups.length ? "page" : undefined}
                className="mb-2 flex min-h-11 items-center border-b border-border px-3 font-semibold text-sand hover:text-accent aria-[current=page]:text-accent"
              >
                Todos los productos
              </Link>
              {groups.map((group) => (
                <Link
                  key={group.slug}
                  to={catalogSectionUrl(group.slug)}
                  aria-current={activeGroup === group ? "page" : undefined}
                  className="flex min-h-11 items-center justify-between gap-2 rounded-md px-3 text-sm text-muted-foreground hover:bg-card aria-[current=page]:bg-muted aria-[current=page]:font-semibold aria-[current=page]:text-sand"
                >
                  <span>{group.name}</span>
                  <span className="text-xs tabular-nums" aria-hidden="true">
                    {group.products.length}
                  </span>
                </Link>
              ))}
            </nav>

            <div className="relative lg:hidden">
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

        <section ref={resultsRef} aria-labelledby="store-results-heading" className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 border-b border-border pb-4">
            <h2
              id="store-results-heading"
              className="min-w-0 font-display text-3xl leading-tight break-words text-sand sm:text-4xl"
            >
              {title}
            </h2>
            {!isPending && (
              <span role="status" className="text-sm tabular-nums text-muted-foreground">
                {count} {count === 1 ? "producto" : "productos"}
              </span>
            )}
          </div>

          <div className="mt-5 space-y-9 sm:mt-6">
            {sections.map((section) => (
              <section
                key={section.slug}
                aria-label={section.name}
                className="border-b border-border pb-8 last:border-0 last:pb-0"
              >
                {showSectionHeadings && (
                  <h3 className="mb-4 font-display text-2xl text-sand">
                    <Link
                      to={catalogSectionUrl(section.slug)}
                      className="inline-flex items-center gap-2 hover:text-accent"
                    >
                      {section.name}{" "}
                      <ArrowUpRight aria-hidden="true" className="size-4 text-gold" />
                    </Link>
                  </h3>
                )}
                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {section.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
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
    </div>
  );
}
