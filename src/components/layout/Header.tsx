import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Instagram, Package, ShoppingBag } from "lucide-react";
import { SITE } from "@config/site";
import { useCart } from "@domain/cart/use-cart";
import { catalogSectionUrl, groupCatalog } from "@domain/catalog/groups";
import { catalogQuery } from "@domain/catalog/queries";
import logo from "@assets/beirut-logo.png";
import { CatalogSearch } from "./CatalogSearch";

const NAV = [
  { to: "/", label: "Inicio" },
  { to: "/tienda", label: "Tienda" },
  { to: "/tienda?destacados=1", label: "Destacados" },
  { to: "/al-por-mayor", label: "Al por mayor" },
];

export function Header() {
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const query = pathname === "/tienda" ? (params.get("q") ?? "") : "";
  const featured = pathname === "/tienda" && params.get("destacados") === "1" && !query.trim();
  const { count } = useCart();
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const { data, isPending } = useQuery({ ...catalogQuery, enabled: categoriesOpen });
  const groups = useMemo(() => (data ? groupCatalog(data) : []), [data]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-2 sm:px-6 md:grid-cols-[1fr_minmax(0,2.5fr)_1fr] md:gap-6 md:py-3">
        <Link to="/" aria-label={SITE.brandFull} className="flex w-fit items-center gap-2">
          <img src={logo} alt="" className="h-10 w-auto md:h-12" />
          <span className="leading-none">
            <span className="block font-display text-xl tracking-[0.22em] text-foreground">
              BEIRUT
            </span>
            <span className="block text-[0.55rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Delikatessen
            </span>
          </span>
        </Link>

        <div className="flex items-center justify-end gap-1 md:col-start-3 md:row-start-1 md:gap-3">
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram de Beirut"
            className="grid size-11 place-items-center hover:text-accent"
          >
            <Instagram aria-hidden="true" className="size-5" />
          </a>
          <Link
            to="/carrito"
            aria-label={count > 0 ? `Ver carrito, ${count} productos` : "Ver carrito"}
            className="relative grid size-11 place-items-center hover:text-accent"
          >
            <ShoppingBag aria-hidden="true" className="size-5" />
            {count > 0 && (
              <span
                aria-hidden="true"
                className="absolute right-0 top-0 grid h-[1.15rem] min-w-[1.15rem] place-items-center rounded-full bg-gold px-1 text-[0.65rem] font-bold text-primary-foreground"
              >
                {count}
              </span>
            )}
          </Link>
        </div>

        <CatalogSearch key={`${pathname}:${query}`} initialQuery={query} />
      </div>

      <nav aria-label="Navegación principal" className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-2 px-3 text-xs font-semibold max-[359px]:gap-x-1 max-[359px]:px-2 max-[359px]:text-[0.6875rem] sm:justify-start sm:gap-x-6 sm:px-6 sm:text-sm">
          <div
            className="relative mr-0.5"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setCategoriesOpen(false);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Escape" || !categoriesOpen) return;
              event.currentTarget.querySelector("button")?.focus();
              setCategoriesOpen(false);
            }}
          >
            <button
              type="button"
              aria-controls="catalog-navigation"
              aria-expanded={categoriesOpen}
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className="flex min-h-11 items-center gap-1 text-foreground hover:text-accent sm:gap-2"
            >
              <Package aria-hidden="true" className="hidden size-4 sm:block" />
              <span className="hidden sm:inline">Comprar por categorías</span>
              <span className="sm:hidden">Categorías</span>
              <ChevronDown aria-hidden="true" className="size-3.5" />
            </button>
            <ul
              id="catalog-navigation"
              hidden={!categoriesOpen}
              className="absolute left-0 top-full z-10 max-h-[55dvh] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-b-lg border border-border bg-card p-2 shadow-lg"
            >
              {isPending && (
                <li role="status" className="px-3 py-2">
                  Cargando categorías…
                </li>
              )}
              {!isPending && !groups.length && (
                <li className="px-3 py-2">No hay categorías disponibles.</li>
              )}
              <li className="border-b border-border">
                <Link
                  to="/tienda"
                  onClick={() => setCategoriesOpen(false)}
                  className="flex min-h-11 items-center rounded-md px-3 font-semibold text-accent hover:bg-background"
                >
                  Ver todos los productos
                </Link>
              </li>
              {groups.map((group) => (
                <li key={group.slug} className="border-b border-border py-1 last:border-0">
                  <Link
                    to={catalogSectionUrl(group.slug)}
                    onClick={() => setCategoriesOpen(false)}
                    className="flex min-h-11 items-center rounded-md px-3 font-semibold hover:bg-background"
                  >
                    {group.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {NAV.map(({ to, label }) => {
            const selected = to.includes("?") ? featured : pathname === to && !featured;
            return (
              <Link
                key={to}
                to={to}
                aria-current={selected ? "page" : undefined}
                className={`flex min-h-11 items-center whitespace-nowrap border-b-2 hover:text-accent ${selected ? "border-gold text-foreground" : "border-transparent text-muted-foreground"}`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
