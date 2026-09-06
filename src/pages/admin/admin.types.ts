import type { Category } from "@domain/catalog/types";

/** Filas tal como vienen de Supabase. */

export type CategoryRow = Pick<Category, "id" | "name" | "slug">;

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image_url: string | null;
  featured: boolean;
  in_stock: boolean;
  category_id: string | null;
};

export type OrderRow = {
  id: string;
  order_number: number;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  delivery_method: string;
  address: string | null;
  city: string | null;
  payment_method: string;
  payment_status: string;
  status: string;
  total: number;
};

export type OrderItemRow = {
  order_id: string;
  product_name: string;
  quantity: number;
  line_total: number;
};
