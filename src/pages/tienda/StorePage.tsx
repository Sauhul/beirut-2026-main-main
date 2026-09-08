import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { ProductCard } from "@components/product/ProductCard";
import { catalogQuery } from "@domain/catalog/queries";
import { usePageTitle } from "@hooks/usePageTitle";

export function StorePage() {
  usePageTitle("Nuestra Tienda | Delikatessen Beyrouth");
  const [searchParams, setSearchParams] = useSearchParams();
  const cat = searchParams.get("categoria") ?? "todos";
  const q = searchParams.get("q") ?? "";

  const { data } = useQuery(catalogQuery);
  const categories = useMemo(
    () =>
      (data?.categories ?? []).filter((c) =>
        (data?.products ?? []).some((p) => p.category_slug === c.slug),
      ),
    [data],
  );

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("es-CO");
    return (data?.products ?? []).filter(
      (p) =>
        (cat === "todos" || p.category_slug === cat) &&
        (term === "" || p.name.toLocaleLowerCase("es-CO").includes(term)),
    );
  }, [data, cat, q]);

  function setCat(next: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (next === "todos") nextParams.delete("categoria");
    else nextParams.set("categoria", next);
    setSearchParams(nextParams, { replace: true });
  }

  function setQ(next: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (next === "") nextParams.delete("q");
    else nextParams.set("q", next);
    setSearchParams(nextParams, { replace: true });
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
          {[{ slug: "todos", name: "Todos" }, ...categories].map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
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

        <p className="mt-8 text-[0.65rem] tracking-[0.2em] uppercase text-muted-foreground">
          {list.length} productos
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {list.length === 0 && (
          <p className="py-20 text-center text-sm text-muted-foreground">
            No encontramos productos con esa búsqueda.
          </p>
        )}
      </section>
    </div>
  );
}