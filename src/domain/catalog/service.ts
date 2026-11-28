/**
 * Servicio de catálogo.
 * Lee de Supabase cuando está configurado; si no (o si falla), sirve los
 * datos de respaldo con la misma estructura. La tienda nunca se rompe.
 */
import { supabase } from "@data/supabase/client";
import { CATEGORIES, PRODUCTS } from "@data/catalog-fallback";
import { productDescriptions } from "@data/product-descriptions";
import { formatPresentation, normalizeProductName, productPresentation } from "@shared/utils/product-format";
import backgroundPhotoSlugs from "./background-photos.json";
import brochureProducts from "./brochure-products.json";
import type { Catalog, Category, Product } from "./types";

const defaultDescription = "Producto auténtico árabe importado de alta calidad";

const backgroundPhotos = new Set(backgroundPhotoSlugs);
const duplicateTahinaSlugs = new Set(["tahine-libra", "tahine-kilo"]);
const brochureBySlug = new Map<string, { name: string; price: number; description?: string }>(
  Object.entries(brochureProducts),
);

export function isVisibleInCatalog(product: { slug: string }) {
  return !duplicateTahinaSlugs.has(product.slug);
}

function catalogDescription(slug: string, description: string | null): string {
  const saved = description?.trim();
  if (saved && saved !== defaultDescription) return saved;
  return productDescriptions.get(slug) ?? saved ?? "";
}

export function catalogImageUrl(
  slug: string | undefined,
  imageUrl: string | null = null,
): string | null {
  return slug && backgroundPhotos.has(slug)
    ? `/products-backgrounds/${encodeURIComponent(slug)}.webp`
    : imageUrl;
}

function withDisplayProduct(product: Product, useBrochure = import.meta.env.DEV): Product {
  const brochure = useBrochure ? brochureBySlug.get(product.slug) : undefined;
  const name = normalizeProductName(brochure?.name ?? product.name);
  const brochureUnit = brochure
    ? productPresentation({ ...product, name, unit: "unidad" }).unit
    : "unidad";
  const { unit } = productPresentation({
    ...product,
    name,
    unit: brochureUnit === "unidad" ? product.unit : brochureUnit,
  });
  const description = catalogDescription(product.slug, product.description);
  const presentation = formatPresentation(unit);
  const measure = presentation.match(/^(\d+)(?:\.(\d+))? (g|kg|ml|L)$/);
  const needsPresentation =
    measure &&
    !new RegExp(
      `(?<![\\d.,])${measure[1]}${measure[2] ? `[.,]${measure[2]}` : ""}\\s*${measure[3]}\\b`,
      "i",
    ).test(description);

  return {
    ...product,
    name,
    category_name: normalizeProductName(product.category_name),
    price: brochure?.price ?? product.price,
    image_url: catalogImageUrl(product.slug, product.image_url),
    unit,
    description:
      brochure?.description ??
      (needsPresentation ? `Presentación de ${presentation}. ${description}`.trim() : description),
  };
}

const fallbackOtherCategory = CATEGORIES.find((category) => category.slug === "otros")!;

export function toCatalogProduct(
  product: Omit<Product, "category_slug" | "category_name">,
  category: Pick<Category, "slug" | "name"> = fallbackOtherCategory,
): Product {
  return withDisplayProduct({
    ...product,
    category_slug: category.slug,
    category_name: category.name,
  });
}

const fallbackCatalog: Catalog = {
  categories: CATEGORIES,
  products: PRODUCTS.filter(isVisibleInCatalog).map((product) => withDisplayProduct(product, true)),
};

/** Catálogo completo: categorías + productos. */
export async function getCatalog(): Promise<Catalog> {
  if (!supabase) return fallbackCatalog;

  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*").order("name"),
  ]);

  if (categoriesRes.error || productsRes.error) {
    console.error("[Catálogo] Error leyendo de Supabase:", {
      categories: categoriesRes.error?.message,
      products: productsRes.error?.message,
    });
    return fallbackCatalog;
  }

  const savedCategories = categoriesRes.data ?? [];
  const categoriesById = new Map(savedCategories.map((category) => [category.id, category]));
  const otherCategory =
    savedCategories.find((category) => category.slug === "otros") ??
    fallbackOtherCategory;

  const dbProducts = (productsRes.data ?? []).filter(isVisibleInCatalog).map((product) =>
    toCatalogProduct(product, categoriesById.get(product.category_id) ?? otherCategory),
  );

  const categories = categoriesById.has(otherCategory.id)
    ? savedCategories
    : [...savedCategories, otherCategory].sort((a, b) => a.sort_order - b.sort_order);
  return { categories, products: dbProducts };
}

/** Producto por slug con relacionados de su misma categoría (null si no existe). */
export async function getProductBySlug(
  slug: string,
): Promise<{ product: Product; related: Product[] } | null> {
  const { products } = await getCatalog();
  const product = products.find((p) => p.slug === slug);
  if (!product) return null;

  const related = products
    .filter((p) => p.slug !== product.slug && p.category_slug === product.category_slug)
    .slice(0, 3);

  return { product, related };
}
