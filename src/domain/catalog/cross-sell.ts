import type { Product } from "./types";

/** Ordered merchandising list; populate when the client confirms the Top 10. */
export const BEST_SELLER_SLUGS: readonly string[] = [];

export function crossSellProducts(
  products: Product[],
  cartIds: readonly string[],
  rankedSlugs: readonly string[] = BEST_SELLER_SLUGS,
) {
  const bySlug = new Map(products.map((product) => [product.slug, product]));
  // Featured products are the provisional selection, never an inferred sales ranking.
  const topTen = rankedSlugs.length
    ? rankedSlugs.slice(0, 10).flatMap((slug) => bySlug.get(slug) ?? [])
    : products.filter((product) => product.featured).slice(0, 10);
  const excluded = new Set(cartIds);
  const seen = new Set<string>();
  return topTen.filter((product) => {
    if (!product.in_stock || excluded.has(product.id) || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}
