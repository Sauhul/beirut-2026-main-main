import type { Product } from "./types";

function normalize(value: string) {
  return value.toLocaleLowerCase("es-CO").normalize("NFD").replace(/\p{M}/gu, "");
}

export function catalogSearchTerms(query: string) {
  return normalize(query.trim()).split(/\s+/).filter(Boolean);
}

export function catalogSearchMatches(terms: string[], fields: string[]) {
  const text = normalize(fields.join(" "));
  return terms.every((term) => text.includes(term));
}

export function suggestProducts(products: Product[], terms: string[], limit = 6) {
  if (!terms.length) return [];
  const phrase = terms.join(" ");

  return products
    .flatMap((product) => {
      const name = normalize(product.name);
      if (name.startsWith(phrase)) return [{ product, rank: 0 }];
      if (terms.every((term) => name.includes(term))) return [{ product, rank: 1 }];
      if (catalogSearchMatches(terms, [product.name, product.category_name, product.slug])) {
        return [{ product, rank: 2 }];
      }
      return [];
    })
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map(({ product }) => product);
}
