import assert from "node:assert/strict";
import { test } from "node:test";
import { crossSellProducts } from "./cross-sell.ts";
import type { Product } from "./types";

function product(index: number, overrides: Partial<Product> = {}): Product {
  return {
    id: `id-${index}`,
    slug: `product-${index}`,
    name: `Producto ${index}`,
    description: "",
    price: 10000 + index,
    unit: "unidad",
    featured: true,
    in_stock: true,
    image_url: null,
    category_slug: "panaderia",
    category_name: "Panadería",
    ...overrides,
  };
}

test("excludes existing cart products and unavailable products", () => {
  const products = [product(1), product(2), product(3, { in_stock: false })];
  assert.deepEqual(
    crossSellProducts(products, ["id-1"]).map(({ id }) => id),
    ["id-2"],
  );
});

test("does not show an offer when all Top 10 products are already in the cart", () => {
  const products = Array.from({ length: 10 }, (_, index) => product(index));
  assert.deepEqual(
    crossSellProducts(
      products,
      products.map(({ id }) => id),
    ),
    [],
  );
});

test("limits the original selection to ten before excluding cart items", () => {
  const products = Array.from({ length: 12 }, (_, index) => product(index));
  const result = crossSellProducts(products, ["id-0", "id-1"]);
  assert.equal(result.length, 8);
  assert.ok(result.every(({ id }) => id !== "id-10" && id !== "id-11"));
});

test("respects the configured ranking instead of catalog order", () => {
  const products = [product(1, { featured: false }), product(2), product(3)];
  const result = crossSellProducts(
    products,
    [],
    ["product-3", "product-1", "missing", "product-2"],
  );
  assert.deepEqual(
    result.map(({ id }) => id),
    ["id-3", "id-1", "id-2"],
  );
});

test("deduplicates suggestions and never mutates the catalog", () => {
  const products = [product(1), product(2)];
  const before = structuredClone(products);
  assert.equal(crossSellProducts(products, [], ["product-1", "product-1"]).length, 1);
  assert.deepEqual(products, before);
});

test("empty catalogs and catalogs without a featured selection do not block payment", () => {
  assert.deepEqual(crossSellProducts([], []), []);
  assert.deepEqual(crossSellProducts([product(1, { featured: false })], []), []);
});
