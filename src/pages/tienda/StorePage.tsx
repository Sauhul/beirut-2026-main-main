import { useSearchParams } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search } from "lucide-react";
import { ProductCard } from "@components/product/ProductCard";
import { groupCatalog } from "@domain/catalog/groups";
import { catalogQuery } from "@domain/catalog/queries";
import { usePageTitle } from "@hooks/usePageTitle";

gsap.registerPlugin(useGSAP);

const normalize = (value: string) =>
  value.toLocaleLowerCase("es-CO").normalize("NFD").replace(/\p{M}/gu, "");

export function StorePage() {
  usePageTitle("Nuestra Tienda | Delikatessen Beyrouth");

  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const resultsRef = useRef<HTMLElement>(null);
  const { data, isPending } = useQuery(catalogQuery);
  const groups = useMemo(() => (data ? groupCatalog(data) : []), [data]);
  const requestedCategory = params.get("categoria");
  const activeGroup =
    groups.find(
      (group) =>
        group.slug === requestedCategory ||
        group.categories.some((category) => category.slug === requestedCategory),
    ) ?? groups[0];
  const activeCategory = activeGroup?.categories.find(
    (category) => category.slug === requestedCategory,
  );

  const term = normalize(q.trim());
  const visibleGroups = term
    ? groups
        .map((group) => ({
          ...group,
          products: group.products.filter((product) =>
            [product.name, product.category_name, group.name, product.description].some((value) =>
              normalize(value).includes(term),
            ),
          ),
        }))
        .filter((group) => group.products.length > 0)
    : activeGroup
      ? [
          {
            ...activeGroup,
            products: activeCategory
              ? activeGroup.products.filter(
                  (product) => product.category_slug === activeCategory.slug,
                )
              : activeGroup.products,
          },
        ]
      : [];
  const count = visibleGroups.reduce((total, group) => total + group.products.length, 0);
  const countLabel = `${count} ${count === 1 ? "producto" : "productos"}`;

  useGSAP(
    () => {
      if (term || !activeGroup || !resultsRef.current) return;
      const media = gsap.matchMedia();
      media.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = Array.from(
          resultsRef.current?.querySelectorAll("[data-catalog-item]") ?? [],
        ).slice(0, 8);
        if (!cards.length) return;
        gsap.from(cards, {
          opacity: 0.45,
          y: 12,
          duration: 0.24,
          stagger: { amount: 0.11 },
          ease: "power2.out",
          clearProps: "opacity,transform",
        });
      });
      return () => media.revert();
    },
    {
      scope: resultsRef,
      dependencies: [activeGroup?.slug, activeCategory?.slug, Boolean(term)],
      revertOnUpdate: true,
    },
  );

  function setCategoria(next: string) {
    setQ("");
    setParams((previous) => {
      const updated = new URLSearchParams(previous);
      updated.set("categoria", next);
      return updated;
    });
  }

  return (
    <div className="route-page">
      <header className="arabesque border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-7 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:py-10">
          <div>
            <h1 className="font-display text-4xl leading-none text-sand sm:text-5xl">
              Nuestra tienda
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Ingredientes y utensilios para la mesa libanesa.
            </p>
          </div>

          <div className="relative w-full lg:max-w-md">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              aria-label="Buscar en toda la tienda"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar en toda la tienda…"
              className="min-h-12 w-full rounded-md border border-input bg-onyx px-4 pl-11 text-base text-sand outline-none placeholder:text-muted-foreground focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
            />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-8 lg:py-9">
        {groups.length > 0 && (
          <>
            <nav
              aria-label="Categorías de la tienda"
              className="hidden lg:sticky lg:top-32 lg:block lg:self-start"
            >
              <h2 className="mb-3 border-b border-border pb-3 font-display text-xl text-sand">
                Categorías
              </h2>
              <div className="space-y-1">
                {groups.map((group) => {
                  const selected = !term && activeGroup?.slug === group.slug;
                  return (
                    <button
                      key={group.slug}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setCategoria(group.slug)}
                      className={`motion-press flex min-h-11 w-full items-center justify-between gap-2 rounded-md px-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-gold ${selected ? "bg-gold text-primary-foreground" : "text-sand hover:bg-card"}`}
                    >
                      <span>{group.name}</span>
                      <span aria-hidden="true" className="text-xs tabular-nums opacity-80">
                        {group.products.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="relative lg:hidden">
              <select
                aria-label="Categoría de productos"
                value={term ? "" : (activeGroup?.slug ?? "")}
                onChange={(e) => setCategoria(e.target.value)}
                className="min-h-12 w-full appearance-none rounded-md border border-input bg-card py-2 pl-3 pr-9 text-base text-sand focus-visible:outline-2 focus-visible:outline-gold"
              >
                <option value="" disabled>
                  Categorías
                </option>
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
          </>
        )}

        <section ref={resultsRef} aria-label="Productos" className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 border-b border-border pb-4">
            <h2 className="font-display text-3xl leading-tight text-sand sm:text-4xl">
              {term ? "Resultados de búsqueda" : (activeGroup?.name ?? "Productos")}
            </h2>
            {!isPending && (
              <span role="status" className="text-sm tabular-nums text-muted-foreground">
                {countLabel}
              </span>
            )}
          </div>

          {!term && activeGroup && (activeGroup.categories.length > 1 || activeCategory) && (
            <div
              role="group"
              aria-label="Filtrar por subcategoría"
              className="mt-4 flex flex-wrap gap-2"
            >
              {[{ slug: activeGroup.slug, name: "Todos" }, ...activeGroup.categories].map(
                (category) => {
                  const selected = category.slug === (activeCategory?.slug ?? activeGroup.slug);
                  return (
                    <button
                      type="button"
                      key={category.slug}
                      aria-pressed={selected}
                      onClick={() => setCategoria(category.slug)}
                      className={`motion-press min-h-11 rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-gold ${selected ? "border-gold text-gold" : "border-border text-sand hover:border-gold"}`}
                    >
                      {category.name}
                    </button>
                  );
                },
              )}
            </div>
          )}

          <div className="mt-5 space-y-10 sm:mt-6">
            {visibleGroups.map((group) => (
              <div key={group.slug}>
                {term && <h3 className="mb-4 font-display text-2xl text-sand">{group.name}</h3>}
                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                  {group.products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      compact
                      headingLevel={term ? 4 : 3}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {isPending && (
            <p role="status" className="py-5 text-muted-foreground">
              Cargando productos…
            </p>
          )}
          {!isPending && count === 0 && (
            <div className="py-8 text-sm text-muted-foreground">
              <p>
                {term
                  ? "No encontramos productos con esa búsqueda."
                  : "No hay productos disponibles."}
              </p>
              {term && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="mt-2 min-h-11 text-gold underline underline-offset-4"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
