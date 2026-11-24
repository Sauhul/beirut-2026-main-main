import type { Catalog, Product } from "./types";

const GROUPS = [
  {
    slug: "cafe-bebidas",
    name: "Café, té y bebidas",
    sources: ["cafe-te", "bebidas"],
    aliases: ["cafe", "te-infusiones", "siropes", "otras-bebidas"],
  },
  {
    slug: "pan-lacteos",
    name: "Panadería y lácteos",
    sources: ["panaderia", "lacteos"],
    aliases: ["empanadas", "panes", "quesos-labneh"],
  },
  {
    slug: "dulces",
    name: "Dulces libaneses",
    sources: ["dulces"],
    aliases: ["dulces-snacks", "baklawa-galletas", "halva-dulces"],
  },
  {
    slug: "frutos-secos-snacks",
    name: "Dátiles, frutos secos y snacks",
    sources: ["frutos-secos", "snacks"],
    aliases: ["dulces-snacks", "datiles-fruta-seca", "nueces-semillas", "aperitivos"],
  },
  {
    slug: "salsas-condimentos",
    name: "Aceites, especias y salsas",
    sources: ["salsas"],
    aliases: [
      "despensa",
      "aceites-vinagres",
      "especias-condimentos",
      "aguas-esencias",
      "tahine-salsas",
    ],
  },
  {
    slug: "conservas-granos",
    name: "Conservas, granos y legumbres",
    sources: ["conservas", "legumbres-granos", "carnes"],
    aliases: ["despensa", "aceitunas-conservas", "carnes-enlatadas"],
  },
  {
    slug: "utensilios",
    name: "Utensilios y vajilla",
    sources: ["cafeteras-teteras", "accesorios"],
    aliases: ["tazas-juegos-cafe", "preparacion-cafe-te", "moldes-cocina", "utensilios-cocina"],
  },
  {
    slug: "cuidado-personal",
    name: "Cuidado personal",
    sources: ["cuidado-personal"],
    aliases: ["cuidado-tabaco"],
  },
  { slug: "tabaco", name: "Tabaco y accesorios", sources: ["tabaco"], aliases: ["cuidado-tabaco"] },
];

// Estas referencias conservan categorías heredadas que no describen el producto.
const LEGACY_SOURCES: Record<string, [RegExp, string][]> = {
  "cafe-te": [
    [/^(agua-|azahar-agua|escencia-)/, "salsas"],
    [/^(lentejas-|bulgur-|garbanzo-|habas-|semola-|trigo-)/, "legumbres-granos"],
    [/^crunchy-/, "snacks"],
    [/^arak-/, "bebidas"],
    [/^(jabon-|tinte-)/, "cuidado-personal"],
    [/^(juego-de-caf-|set-de-cafe-|set-de-tazas-)/, "cafeteras-teteras"],
  ],
  "frutos-secos": [[/^altramuces-/, "legumbres-granos"]],
  snacks: [
    [/^bordon$/, "carnes"],
    [/^falafel$/, "conservas"],
  ],
  salsas: [
    [/^pan-con-zaatar$/, "panaderia"],
    [/^hummus-en-lata$/, "conservas"],
    [/^sirope-/, "bebidas"],
  ],
  "cafeteras-teteras": [
    [/^(manguera$|tabaco-)/, "tabaco"],
    [/^(bandeja-|molde-|organizador-|procesador-|set-brochetas-)/, "accesorios"],
  ],
};

export type CatalogGroup = {
  slug: string;
  name: string;
  products: Product[];
};

const knownSources = new Set(GROUPS.flatMap(({ sources }) => sources));
const otherSlug = "otros-productos";

export function groupCatalog({ products }: Catalog): CatalogGroup[] {
  const bySource = new Map<string, Product[]>();
  for (const product of products) {
    const originalSource = product.category_slug;
    const source =
      LEGACY_SOURCES[originalSource]?.find(([pattern]) => pattern.test(product.slug))?.[1] ??
      originalSource;
    const bucket = knownSources.has(source) ? source : otherSlug;
    const entries = bySource.get(bucket) ?? [];
    entries.push(product);
    bySource.set(bucket, entries);
  }

  const groups: CatalogGroup[] = [
    ...GROUPS.map(({ slug, name, sources }) => ({
      slug,
      name,
      products: sources.flatMap((source) => bySource.get(source) ?? []),
    })),
    { slug: otherSlug, name: "Otros productos", products: bySource.get(otherSlug) ?? [] },
  ];
  return groups.filter(({ products }) => products.length > 0);
}

export function resolveCatalogGroups(groups: CatalogGroup[], category: string | null) {
  if (!category) return [];
  const exact = groups.find(({ slug }) => slug === category);
  if (exact) return [exact];

  const matchingSlugs = new Set(
    GROUPS.filter(
      ({ sources, aliases }) => sources.includes(category) || aliases.includes(category),
    ).map(({ slug }) => slug),
  );
  return groups.filter(({ slug }) => matchingSlugs.has(slug));
}

export function catalogSectionUrl(slug: string) {
  return `/tienda?${new URLSearchParams({ categoria: slug })}`;
}
