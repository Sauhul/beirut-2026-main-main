/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ProductCard } from "@components/product/ProductCard";
import { Product } from "@domain/catalog/types";
import { catalogQuery } from "@domain/catalog/queries";
import { usePageTitle } from "@hooks/usePageTitle";

// Utilizar un objeto simple fuera del componente para persistir el estado de la categoría
const storeState = {
  activeCat: "todos",
};

export function StorePage() {
  usePageTitle("Nuestra Tienda | Delikatessen Beyrouth");
  const [, setSearchParams] = useSearchParams();

  // Inicializar estado usando el valor persistido si existe
  const [cat, setCat] = useState(storeState.activeCat);
  const [q, setQ] = useState("");

  // Actualizar el estado global al cambiar
  useEffect(() => {
    storeState.activeCat = cat;
  }, [cat]);

  const { data } = useQuery(catalogQuery);
  const categories = useMemo(
    () =>
      (data?.categories ?? []).filter((c) =>
        (data?.products ?? []).some((p) => p.category_slug === c.slug),
      ),
    [data],
  );

  const navCategories = useMemo(() => [
    { slug: "todos", name: "Todos" },
    ...(data?.categories ?? []),
  ], [data?.categories]);

  const groupedList = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("es-CO");
    const filteredProducts = (data?.products ?? []).filter((p) => {
      const matchesSearch = term === "" || p.name.toLocaleLowerCase("es-CO").includes(term);
      if (cat === "todos") return matchesSearch;
      return p.category_slug === cat && matchesSearch;
    });

    if (cat !== "todos") {
      return [
        {
          slug: cat,
          name: navCategories.find((c) => c.slug === cat)?.name || cat,
          products: filteredProducts,
        },
      ];
    }

    // Group by category if "todos"
    const groups: { slug: string; name: string; products: Product[] }[] = [];
    navCategories.forEach((c) => {
      if (c.slug === "todos") return;
      const productsInCategory = filteredProducts.filter((p) => p.category_slug === c.slug);
      if (productsInCategory.length > 0) {
        groups.push({ slug: c.slug, name: c.name, products: productsInCategory });
      }
    });

    return groups;
  }, [data, cat, q, navCategories]);

  function setCategoria(next: string) {
    setCat(next);
  }

  return (
    <div className="route-page">
      <section className="arabesque border-b border-border py-16 text-center">
        <p className="eyebrow">Catálogo</p>
        <h1 className="mt-3 font-display text-5xl text-sand md:text-6xl">Nuestra Tienda</h1>
        <div className="rule-gold mt-5" />
        <p className="mx-auto mt-5 max-w-xl px-5 text-sm leading-7 text-muted-foreground">
          Todo lo que necesitas para cocinar y compartir la mesa del Medio Oriente. Puedes pagar en
          línea con Wompi o coordinarlo por WhatsApp.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar zaatar, dátiles, café..."
            className="w-full border border-input bg-onyx px-4 py-3 pl-11 text-sm text-sand outline-none placeholder:text-muted-foreground focus:border-gold"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {navCategories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategoria(c.slug)}
              className={`border px-4 py-2 text-[0.62rem] font-bold tracking-[0.18em] uppercase transition-colors ${
                cat === c.slug
                  ? "border-gold bg-gold text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-gold hover:text-gold"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="mt-12 space-y-16">
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

        {groupedList.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No encontramos productos con esa búsqueda.
          </p>
        )}
      </section>
    </div>
  );
}
