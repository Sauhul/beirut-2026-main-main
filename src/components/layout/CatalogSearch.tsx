import { useEffect, useId, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { catalogQuery } from "@domain/catalog/queries";
import { catalogSearchTerms, suggestProducts } from "@domain/catalog/search";
import { formatCOP } from "@shared/utils/format";
import { productImageSrc } from "@shared/utils/category-images";

export function CatalogSearch({ initialQuery }: { initialQuery: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const listId = useId();
  const navigate = useNavigate();
  const canSuggest = query.trim().length >= 2;
  const open = showSuggestions && canSuggest;
  const { data, isPending } = useQuery({ ...catalogQuery, enabled: open });
  const suggestions = useMemo(
    () => (canSuggest && data ? suggestProducts(data.products, catalogSearchTerms(query)) : []),
    [canSuggest, data, query],
  );
  const activeProduct = suggestions[activeIndex];
  const activeId = activeProduct ? `${listId}-${activeIndex}` : undefined;
  const status = isPending ? "Buscando productos…" : "No hay sugerencias para esta búsqueda.";

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  function close() {
    setShowSuggestions(false);
    setActiveIndex(-1);
  }

  function openProduct(slug: string) {
    close();
    navigate(`/producto/${slug}`);
  }

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    setQuery(term);
    close();
    navigate(term ? `/tienda?${new URLSearchParams({ q: term })}` : "/tienda");
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;

    if (event.key === "Escape" && open) {
      event.preventDefault();
      close();
    } else if (event.key === "Enter" && activeProduct) {
      event.preventDefault();
      openProduct(activeProduct.slug);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (!canSuggest) return;
      event.preventDefault();
      setShowSuggestions(true);
      if (!suggestions.length) return;
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => {
        if (index < 0) return direction === 1 ? 0 : suggestions.length - 1;
        return (index + direction + suggestions.length) % suggestions.length;
      });
    }
  }

  return (
    <form
      role="search"
      onSubmit={search}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) close();
      }}
      className="relative z-20 col-span-2 flex min-w-0 items-stretch rounded-lg border border-input bg-background focus-within:border-gold focus-within:ring-1 focus-within:ring-gold md:col-span-1 md:col-start-2 md:row-start-1"
    >
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        type="search"
        role="combobox"
        name="q"
        aria-label="Buscar en toda la tienda"
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={activeId}
        autoComplete="off"
        placeholder="Buscar café, dulces, especias…"
        value={query}
        onFocus={() => setShowSuggestions(true)}
        onClick={() => setShowSuggestions(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(-1);
          setShowSuggestions(true);
        }}
        onKeyDown={handleKeyDown}
        className="min-h-11 min-w-0 flex-1 rounded-l-lg bg-transparent pl-9 pr-2 text-base outline-none focus-visible:outline-none"
      />
      <button
        type="submit"
        onFocus={close}
        className="rounded-r-lg bg-secondary px-4 text-sm font-semibold text-secondary-foreground hover:bg-secondary/90 sm:px-6"
      >
        Buscar
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full mt-1.5 overflow-hidden rounded-lg border border-border bg-card shadow-lg">
          <ul
            id={listId}
            role="listbox"
            aria-label="Sugerencias de productos"
            aria-busy={isPending}
            className="max-h-[min(24rem,55dvh)] divide-y divide-border/65 overflow-y-auto overscroll-contain"
          >
            {suggestions.map((product, index) => (
              <li key={product.id} role="presentation">
                <button
                  id={`${listId}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  tabIndex={-1}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => openProduct(product.slug)}
                  className="flex min-h-14 w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-muted aria-selected:bg-muted"
                >
                  {product.image_url && (
                    <img
                      src={productImageSrc(product.image_url)}
                      alt=""
                      width={36}
                      height={42}
                      className="h-[42px] w-9 shrink-0 rounded object-cover"
                    />
                  )}
                  <span className="min-w-0 flex-1 break-words font-semibold text-foreground">
                    {product.name}
                  </span>
                  <span className="shrink-0 text-xs whitespace-nowrap text-gold">
                    {formatCOP(product.price)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {!suggestions.length && (
            <p role="status" className="px-3 py-3 text-sm text-muted-foreground">
              {status}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
