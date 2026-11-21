/**
 * Servicio de catálogo.
 * Lee de Supabase cuando está configurado; si no (o si falla), sirve los
 * datos de respaldo con la misma estructura. La tienda nunca se rompe.
 */
import { supabase } from "@data/supabase/client";
import { CATEGORIES, PRODUCTS } from "@data/catalog-fallback";
import { productDescriptions } from "@data/product-descriptions";
import { formatPresentation, productPresentation } from "@shared/utils/product-format";
import { getCorrectCategory } from "@shared/utils/category-mapper";
import type { Catalog, Product } from "./types";

const categoryByProductId = new Map(PRODUCTS.map((product) => [product.id, product.category_slug]));
const categoryByProductSlug = new Map(
  PRODUCTS.map((product) => [product.slug, product.category_slug]),
);

const defaultDescription = "Producto auténtico árabe importado de alta calidad";

function catalogDescription(slug: string, description: string | null): string {
  const saved = description?.trim();
  if (saved && saved !== defaultDescription) return saved;
  return productDescriptions.get(slug) ?? saved ?? "";
}

function withDisplayProduct(product: Product): Product {
  const { name, unit } = productPresentation(product);
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
    unit,
    description: needsPresentation
      ? `Presentación de ${presentation}. ${description}`.trim()
      : description,
  };
}

const fallbackCatalog: Catalog = {
  categories: CATEGORIES,
  products: PRODUCTS.map(withDisplayProduct),
};

/** Catálogo completo: categorías + productos. */
export async function getCatalog(): Promise<Catalog> {
  if (!supabase) return fallbackCatalog;

  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*, categories(slug, name)").order("name"),
  ]);

  /* 
  console.log("[Catálogo] Resultados Supabase:", {
      categories: categoriesRes.data?.length,
      products: productsRes.data?.length,
      errCat: categoriesRes.error,
      errProd: productsRes.error
    });
    */

  /* 
  console.log("[Catálogo] Resultados Supabase:", {
      categories: categoriesRes.data?.length,
      products: productsRes.data?.length,
      errCat: categoriesRes.error,
      errProd: productsRes.error
    });
    */
  if (categoriesRes.error || productsRes.error) {
    console.error("[Catálogo] Error leyendo de Supabase:", {
      categories: categoriesRes.error?.message,
      products: productsRes.error?.message,
    });
    // LOG DETAILED ERROR
    console.log("[Catálogo] Detailed:", { categoriesRes, productsRes });
    return fallbackCatalog;
  }

  const categoriesBySlug = new Map(CATEGORIES.map((category) => [category.slug, category]));
  for (const category of categoriesRes.data ?? []) {
    const curated = categoriesBySlug.get(category.slug);
    categoriesBySlug.set(category.slug, curated ? { ...curated, id: category.id } : category);
  }

  const dbProducts = (productsRes.data ?? []).map((p): Product => {
    const categorySlug =
      categoryByProductId.get(p.id) ??
      categoryByProductSlug.get(p.slug) ??
      p.categories?.slug ??
      getCorrectCategory(p.name);
    const category = categoriesBySlug.get(categorySlug) ?? categoriesBySlug.get("otros")!;

    return withDisplayProduct({
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      unit: p.unit,
      featured: p.featured,
      in_stock: p.in_stock,
      image_url: p.image_url,
      category_slug: category.slug,
      category_name: category.name,
    });
  });

  const categories = [...categoriesBySlug.values()].sort((a, b) => a.sort_order - b.sort_order);
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
