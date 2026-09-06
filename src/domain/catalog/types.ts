/** Tipos del catálogo: categorías y productos. */

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  featured: boolean;
  in_stock: boolean;
  image_url: string | null;
  category_slug: string;
  category_name: string;
};

export type Catalog = {
  categories: Category[];
  products: Product[];
};
