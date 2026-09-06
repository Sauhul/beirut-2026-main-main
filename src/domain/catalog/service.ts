/**
 * Servicio de catálogo.
 * Lee de Supabase cuando está configurado; si no (o si falla), sirve los
 * datos de respaldo con la misma estructura. La tienda nunca se rompe.
 */
import { supabase } from "@data/supabase/client";
import { CATEGORIES, PRODUCTS } from "@data/catalog-fallback";
import type { Catalog, Product } from "./types";

/** Catálogo completo: categorías + productos. */
export async function getCatalog(): Promise<Catalog> {
  if (!supabase) return { categories: CATEGORIES, products: PRODUCTS };

  const [categoriesRes, productsRes] = await Promise.all([
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("*, categories(slug, name)").order("name"),
  ]);

  if (categoriesRes.error || productsRes.error) {
    console.error("[Catálogo] Error leyendo de Supabase:", {
      categories: categoriesRes.error?.message,
      products: productsRes.error?.message,
    });
    return { categories: CATEGORIES, products: PRODUCTS };
  }

  const dbCategories = (categoriesRes.data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    description: c.description,
    sort_order: c.sort_order,
  }));

  const dbProducts = (productsRes.data ?? []).map((p): Product => {
    const category = Array.isArray(p.categories) ? p.categories[0] : p.categories;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      unit: p.unit,
      featured: p.featured,
      in_stock: p.in_stock,
      image_url: p.image_url,
      category_slug: category?.slug ?? "",
      category_name: category?.name ?? "",
    };
  });

  return { categories: dbCategories, products: dbProducts };
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
