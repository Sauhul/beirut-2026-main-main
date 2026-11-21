/**
 * Normalización y formato consistente de productos.
 * Garantiza que todo producto nuevo se guarde con el mismo estilo:
 * nombre en MAYÚSCULAS y presentación canónica
 * ("unidad", "250 g", "1 kg", "500 ml", "1 L", …).
 */

/** Presentaciones estándar que ofrece la tienda. */
export const UNIT_OPTIONS = [
  "unidad",
  "100 g",
  "200 g",
  "250 g",
  "500 g",
  "1 kg",
  "250 ml",
  "500 ml",
  "1 L",
] as const;

/** Convierte texto libre en MAYÚSCULAS: "queso feta" → "QUESO FETA". */
export function normalizeProductName(name: string) {
  const clean = name.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return clean.toUpperCase();
}

function formatGrams(grams: number) {
  if (grams >= 1000) {
    const kg = grams / 1000;
    return `${Number.isInteger(kg) ? kg : Number(kg.toFixed(2))} kg`;
  }
  return `${Math.round(grams)} g`;
}

function formatMilliliters(ml: number) {
  if (ml >= 1000) {
    const l = ml / 1000;
    return `${Number.isInteger(l) ? l : Number(l.toFixed(2))} L`;
  }
  return `${Math.round(ml)} ml`;
}

/**
 * Detecta y normaliza cualquier texto de presentación a un formato único.
 * Ejemplos: "500g" → "500 g" · "0.5 KG" → "500 g" · "750 gramos" → "750 g"
 *           "unid" → "unidad" · "libra" → "500 g" · "litro" → "1 L"
 */
export function normalizeUnit(raw: string | null | undefined) {
  const value = (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/(\d),(\d)/g, "$1.$2")
    .replace(/\.(?!\d)/g, "");
  if (!value) return "unidad";
  const compact = value.replace(/\s+/g, "");

  // Por unidad
  if (/^(u|ud|uds|und|unid|unidades?|piezas?|pza|pzs)$/.test(compact)) {
    return "unidad";
  }

  // Medidas comerciales sueltas ("kilo", "litro", "libra"…)
  if (/^(kilos?|kg)$/.test(compact)) return "1 kg";
  if (/^(litros?|lt|l)$/.test(compact)) return "1 L";
  if (/^libras?$/.test(compact)) return "500 g";

  // Peso
  const weight = compact.match(/^(\d+(?:[.,]\d+)?)(kg|kilos?|k|g|gr|gramos?)$/);
  if (weight) {
    let grams = parseFloat(weight[1]);
    if (/^k/.test(weight[2])) grams *= 1000;
    return formatGrams(grams);
  }

  // Volumen
  const volume = compact.match(/^(\d+(?:[.,]\d+)?)(ml|mililitros?|l|lt|litros?)$/);
  if (volume) {
    let ml = parseFloat(volume[1]);
    if (!/^ml|^mili/.test(volume[2])) ml *= 1000;
    return formatMilliliters(ml);
  }

  // Medidas comerciales comunes en Colombia
  if (/^libras?$/.test(compact)) return "500 g";
  if (/^onza[s]?$/.test(compact)) return formatGrams(28.35);

  return cleanUnitText(value);
}

function cleanUnitText(value: string) {
  return value
    .replace(/\b(g|gr)\b/gi, "g")
    .replace(/\s+/g, " ")
    .trim();
}

/** Etiqueta lista para mostrar: si es "unidad", "unid" o vacío, retorna "" para no forzar peso. */
export function formatPresentation(unit: string | null | undefined) {
  if (!unit) return "";
  const clean = unit.trim().toLowerCase();
  if (clean === "unidad" || clean === "unid" || clean === "und" || clean === "piezas") return "";
  const normalized = normalizeUnit(unit);
  return normalized === "unidad" ? "" : normalized;
}

const namedMeasure =
  /\(?\s*\d+(?:[.,]\d+)?\s*(?:kilogramos?|mililitros?|gramos?|litros?|libras?|kilos?|kgs?|grs?|mls?|lts?|lb|g|l)\b\.?\s*\)?/gi;
const commercialMeasure = /\s+\(?\s*(kilos?|libras?|litros?|lb)\.?\s*\)?$/i;
const bareWeight = /\s+\(?\s*(\d+(?:[.,]\d+)?)\s*\)?$/;

export function productPresentation({
  name,
  unit,
  slug,
}: {
  name: string;
  unit: string;
  slug: string;
}) {
  const saved = formatPresentation(unit);
  const named = [...name.matchAll(namedMeasure)][0]?.[0]?.replace(/[()]/g, "").trim();
  const commercial = name.match(commercialMeasure)?.[1];
  const presentation = saved || (named ? normalizeUnit(named) : "");
  const weight = presentation.match(/^(\d+(?:\.\d+)?) (g|kg|ml|L)$/);
  const bare = name.match(bareWeight);
  const matchesKnownSize =
    bare && weight && normalizeUnit(`${bare[1]} ${weight[2]}`) === presentation;
  const isWalnutSize = slug === "nuez-250" && bare?.[1] === "250";

  const cleanName = (matchesKnownSize || isWalnutSize ? name.slice(0, bare?.index) : name)
    .replace(namedMeasure, " ")
    .replace(commercialMeasure, "")
    .replace(/\(\s*\)/g, "")
    .replace(/[\s,;(/-]+$/, "")
    .replace(/\s+/g, " ")
    .trim();

  return {
    name: cleanName || name,
    unit:
      presentation ||
      (isWalnutSize
        ? "250 g"
        : commercial
          ? normalizeUnit(commercial.toLowerCase() === "lb" ? "libra" : commercial)
          : unit),
  };
}
