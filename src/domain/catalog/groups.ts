import type { Catalog, Category, Product } from "./types";

const GROUPS = [
  { slug: "cafe-bebidas", name: "Café y bebidas", categories: ["cafe-te", "bebidas"] },
  { slug: "pan-lacteos", name: "Panadería y lácteos", categories: ["panaderia", "lacteos"] },
  {
    slug: "dulces-snacks",
    name: "Dulces y snacks",
    categories: ["dulces", "frutos-secos", "snacks"],
  },
  {
    slug: "despensa",
    name: "Despensa",
    categories: ["salsas", "legumbres-granos", "conservas", "carnes"],
  },
  {
    slug: "utensilios",
    name: "Utensilios y vajilla",
    categories: ["cafeteras-teteras", "accesorios"],
  },
  {
    slug: "cuidado-tabaco",
    name: "Cuidado personal y tabaco",
    categories: ["cuidado-personal", "tabaco"],
  },
];

export type CatalogGroup = {
  slug: string;
  name: string;
  categories: Pick<Category, "slug" | "name">[];
  products: Product[];
};

export function groupCatalog({ categories, products }: Catalog): CatalogGroup[] {
  const categoryBySlug = new Map(categories.map((category) => [category.slug, category]));
  const groupByCategory = new Map(
    GROUPS.flatMap((group) => group.categories.map((slug) => [slug, group.slug] as const)),
  );
  const groups = GROUPS.map(({ slug, name }): CatalogGroup => ({
    slug,
    name,
    categories: [],
    products: [],
  }));
  const other: CatalogGroup = {
    slug: "otros-productos",
    name: "Otros productos",
    categories: [],
    products: [],
  };
  const groupBySlug = new Map(groups.map((group) => [group.slug, group]));

  const populated = new Map<string, string>();
  for (const product of products) {
    const categorySlug = product.category_slug;
    const group = groupBySlug.get(groupByCategory.get(categorySlug) ?? "") ?? other;
    group.products.push(product);
    populated.set(categorySlug, product.category_name);
  }

  for (const [index, definition] of GROUPS.entries()) {
    groups[index].categories = definition.categories
      .filter((slug) => populated.has(slug))
      .map((slug) => ({ slug, name: categoryBySlug.get(slug)?.name ?? populated.get(slug)! }));
  }
  other.categories = [...populated]
    .filter(([slug]) => !groupByCategory.has(slug))
    .map(([slug, name]) => ({ slug, name: categoryBySlug.get(slug)?.name ?? name }));

  return [...groups, other].filter((group) => group.products.length > 0);
}
