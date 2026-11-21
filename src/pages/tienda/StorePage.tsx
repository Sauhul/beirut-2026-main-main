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
  const activeGroup =
    groups.find(
      (group) =>
        group.slug === requestedCategory ||
        group.categories.some((category) => category.slug === requestedCategory),
    ) ?? groups[0];

  const normalize = (value: string) =>
    value.toLocaleLowerCase("es-CO").normalize("NFD").replace(/\p{M}/gu, "");
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
      ? [activeGroup]
      : [];

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
      <section className="arabesque border-b border-border py-9 text-center sm:py-16">
        <h1 className="font-display text-5xl text-sand md:text-6xl">Nuestra Tienda</h1>
        <div className="rule-gold mt-5" />
        <p className="mx-auto mt-5 max-w-xl px-5 text-sm leading-7 text-muted-foreground">
          Todo lo que necesitas para cocinar y compartir la mesa del Medio Oriente. Puedes pagar en
          línea con Wompi.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-7 sm:py-12">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            aria-label="Buscar en toda la tienda"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar en toda la tienda…"
            className="w-full border border-input bg-onyx px-4 py-3 pl-11 text-sm text-sand outline-none placeholder:text-muted-foreground focus:border-gold"
          />
        </div>

        <div
          role="group"
          aria-label="Grupos de productos"
          className="mt-4 flex flex-wrap gap-2 sm:mt-6"
        >
          {groups.map((group) => {
            const selected = !term && activeGroup?.slug === group.slug;
            return (
              <button
                key={group.slug}
                type="button"
                onClick={() => setCategoria(group.slug)}
                aria-pressed={selected}
                className={`min-h-11 border px-3 py-2 text-sm sm:px-4 font-semibold transition-colors ${
                  selected
                    ? "border-gold bg-gold text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-gold hover:text-gold"
                }`}
              >
                {group.name}
              </button>
            );
          })}
        </div>

        {term && !isPending && (
          <p role="status" className="mt-6 text-sm text-muted-foreground">
            {visibleGroups.length > 0
              ? "Resultados en toda la tienda"
              : "No encontramos productos con esa búsqueda."}
          </p>
        )}

        <div className="mt-7 space-y-12 sm:mt-12 sm:space-y-16">
          {visibleGroups.map((group) => (
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

        {!isPending && !term && !activeGroup && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No hay productos disponibles.
          </p>
        )}
      </section>
    </div>
  );
}
