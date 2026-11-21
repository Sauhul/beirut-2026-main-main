import { useSearchParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ProductCard } from "@components/product/ProductCard";
import { groupCatalog } from "@domain/catalog/groups";
import { catalogQuery } from "@domain/catalog/queries";
import { usePageTitle } from "@hooks/usePageTitle";

export function StorePage() {
  usePageTitle("Nuestra Tienda | Delikatessen Beyrouth");

  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const { data, isPending } = useQuery(catalogQuery);
  const groups = useMemo(() => (data ? groupCatalog(data) : []), [data]);
  const requestedCategory = params.get("categoria");
  const activeGroup = groups.find(
    (group) =>
      group.slug === requestedCategory ||
      group.categories.some((category) => category.slug === requestedCategory),
  );
  const activeCategory = activeGroup?.categories.find(
    (category) => category.slug === requestedCategory,
  );
  const normalize = (value: string) =>
    value.toLocaleLowerCase("es-CO").normalize("NFD").replace(/\p{M}/gu, "");
  const term = normalize(q.trim());
  const groupedList = (activeGroup ? [activeGroup] : groups)
    .map((group) => ({
      ...group,
      name: activeCategory?.name ?? group.name,
      products: group.products.filter(
        (product) =>
          (!activeCategory || product.category_slug === activeCategory.slug) &&
          [product.name, product.category_name, group.name].some((value) =>
            normalize(value).includes(term),
          ),
      ),
    }))
    .filter((group) => group.products.length > 0);

  const primaryFilters = [{ slug: "todos", name: "Todos" }, ...groups];
  const secondaryFilters = activeGroup
    ? [{ slug: activeGroup.slug, name: "Ver todo el grupo" }, ...activeGroup.categories]
    : [];

  function setCategoria(next: string) {
    setParams((previous) => {
      const updated = new URLSearchParams(previous);
      if (next === "todos") updated.delete("categoria");
      else updated.set("categoria", next);
      return updated;
    });
  }

  return (
    <div className="route-page">
      <section className="arabesque border-b border-border py-9 text-center sm:py-16">
        <h1 className="font-display text-5xl text-sand md:text-6xl">Nuestra Tienda</h1>
        <div className="rule-gold mt-5" />
        <p className="mx-auto mt-5 max-w-xl px-5 text-sm leading-7 text-muted-foreground">
          Todo lo que necesitas para cocinar y compartir la mesa del Medio Oriente. Puedes pagar en
          línea con Wompi o coordinarlo por WhatsApp.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-7 sm:py-12">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            aria-label="Buscar productos"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar zaatar, dátiles, café..."
            className="w-full border border-input bg-onyx px-4 py-3 pl-11 text-sm text-sand outline-none placeholder:text-muted-foreground focus:border-gold"
          />
        </div>

        <div
          role="group"
          aria-label="Grupos de productos"
          className="mt-4 flex flex-wrap gap-2 sm:mt-6"
        >
          {primaryFilters.map((filter) => {
            const selected = (activeGroup?.slug ?? "todos") === filter.slug;
            return (
              <button
                key={filter.slug}
                type="button"
                onClick={() => setCategoria(filter.slug)}
                aria-pressed={selected}
                className={`min-h-11 border px-3 py-2 text-sm sm:px-4 font-semibold transition-colors ${
                  selected
                    ? "border-gold bg-gold text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-gold hover:text-gold"
                }`}
              >
                {filter.name}
              </button>
            );
          })}
        </div>

        {secondaryFilters.length > 2 && (
          <div role="group" aria-label="Subcategorías" className="mt-3 flex flex-wrap gap-x-4">
            {secondaryFilters.map((filter) => {
              const selected = (activeCategory?.slug ?? activeGroup?.slug) === filter.slug;
              return (
                <button
                  key={filter.slug}
                  type="button"
                  onClick={() => setCategoria(filter.slug)}
                  aria-pressed={selected}
                  className={`min-h-11 text-left text-sm underline-offset-4 hover:text-gold ${
                    selected
                      ? "font-semibold text-sand underline decoration-gold"
                      : "text-muted-foreground"
                  }`}
                >
                  {filter.name}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-7 space-y-12 sm:mt-12 sm:space-y-16">
          {groupedList.map((group) => (
            <div key={group.slug}>
              <h2 className="mb-6 font-display text-2xl text-sand">{group.name}</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {isPending && (
          <p role="status" className="py-12 text-muted-foreground">
            Cargando productos…
          </p>
        )}

        {!isPending && groupedList.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No encontramos productos con esa búsqueda.
          </p>
        )}
      </section>
    </div>
  );
}
