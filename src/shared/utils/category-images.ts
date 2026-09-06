import especias from "@assets/cat-especias.jpg";
import aceitunas from "@assets/cat-aceitunas.jpg";
import quesos from "@assets/cat-quesos.jpg";
import dulces from "@assets/cat-dulces.jpg";
import teCafe from "@assets/cat-te-cafe.jpg";
import conservas from "@assets/cat-conservas.jpg";

export const CATEGORY_IMAGES: Record<string, string> = {
  especias,
  aceitunas,
  quesos,
  dulces,
  "te-cafe": teCafe,
  conservas,
};

export function categoryImage(slug: string | null | undefined, productImageUrl?: string | null) {
  if (productImageUrl) return productImageSrc(productImageUrl);
  return (slug && CATEGORY_IMAGES[slug]) || especias;
}

/** Normaliza la ruta de imagen de un producto.
 *  - URL completa (http/https) → se usa tal cual.
 *  - Nombre simple (ej. "aceite-oliva.jpg") → se sirve desde /product-images/ (fallback local). */
export function productImageSrc(imageUrl?: string | null, fallbackUrl = "/product-images/baklawa-pistacho.jpg") {
  if (!imageUrl) return fallbackUrl;
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `/product-images/${encodeURIComponent(imageUrl)}`;
}
