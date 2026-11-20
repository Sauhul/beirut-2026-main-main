// The focal points are measured on the 1000 × 1200 photos in products-refined.
const coffeeSetFocalPoints = new Map<string, [number, number]>([
  ["juego-de-caf-porcelana-blanco-puro-con-filo-dorado", [40, 50]],
  ["juego-de-caf-porcelana-espiral-ptica-gold", [48, 51]],
  ["juego-de-caf-porcelana-labrada-crema", [47, 50]],
  ["juego-de-caf-porcelana-labrada-gris", [47, 50]],
  ["juego-de-caf-porcelana-mandala-tnico-y-oro", [48, 51]],
  ["juego-de-caf-porcelana-mosaico-geom-trico-gold", [49, 51]],
  ["juego-de-caf-porcelana-multicolor", [48, 51]],
  ["juego-de-caf-porcelana-rbol-de-oro", [41, 50]],
  ["juego-de-caf-porcelana-relieve-p-talo-blanco", [48, 51]],
  ["set-de-cafe-arbol-de-la-vida", [33, 50]],
  ["set-de-cafe-blanco-base-anillos-dorados", [47, 51]],
  ["set-de-cafe-blanco-base-anillos-plateado", [47, 51]],
  ["set-de-cafe-hojas-de-oro", [32, 50]],
  ["set-de-cafe-tazas-blancas-base-de-anillos-dorados", [33, 50]],
]);

const uprightPouches = new Set([
  "altramuces-secos",
  "bulgur-trigo-blanco-1",
  "cafe-maatouk-450gr",
  "cafe-najjar-clasic",
  "cafe-najjar-con-cardamomo",
  "castania-nuts",
  "crunchy-bite-80gr",
  "crunchy-bites-80gr",
  "ctunchy-bites-80gr",
  "lentejas-rojas",
  "nuez-250",
  "sal-de-limon-lb",
  "semola-fina",
  "semola-gruesa",
  "trigo-entero",
  "zaatar-500gr",
]);

export function getProductPhotoFraming(source?: string) {
  const photo = source?.match(/^\/products-refined\/([^/]+)\.webp$/)?.[1] ?? "";
  const focalPoint = coffeeSetFocalPoints.get(photo);

  return { focalPoint, enlarge: !!focalPoint || uprightPouches.has(photo) };
}
