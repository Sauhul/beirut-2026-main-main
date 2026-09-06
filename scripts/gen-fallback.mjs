#!/usr/bin/env node
/**
 * Genera catalog-fallback.ts desde el SQL seed.
 * Ejecutar: node scripts/gen-fallback.mjs
 */
import fs from "node:fs";
import path from "node:path";

const SQL_PATH = path.resolve("supabase/seed-album-productos.sql");
const OUT_PATH = path.resolve("src/data/catalog-fallback.ts");

const sql = fs.readFileSync(SQL_PATH, "utf-8");

// Extraer categorías
const catRegex = /VALUES \('(cat-\d+)', '([^']+)', '([^']+)', '([^']+)', (\d+)\)/g;
const categories = [];
let m;
while ((m = catRegex.exec(sql)) !== null) {
  categories.push({ id: m[1], slug: m[2], name: m[3], description: m[4], sort_order: Number(m[5]) });
}

// Extraer productos
const prodRegex = /VALUES \('(cat-\d+)', '([^']+)', '([^']+)', '([^']+)', (\d+), '([^']+)', '([^']+)', (true|false), (true|false)\)/g;
const products = [];
while ((m = prodRegex.exec(sql)) !== null) {
  products.push({
    category_id: m[1],
    slug: m[2],
    name: m[3],
    description: m[4],
    price: Number(m[5]),
    unit: m[6],
    image_url: m[7],
    featured: m[8] === "true",
    in_stock: m[9] === "true",
  });
}

// Map category_id → slug/name
const catMap = Object.fromEntries(categories.map((c) => [c.id, { slug: c.slug, name: c.name }]));

let ts = `/**
 * Datos de respaldo del catálogo.
 * Se usan cuando Supabase no está configurado o falla.
 * Generado automáticamente desde seed-album-productos.sql
 */
import type { Category, Product } from "@domain/catalog/types";

export const CATEGORIES: Category[] = ${JSON.stringify(categories, null, 2)};

export const PRODUCTS: Product[] = [
`;

for (const p of products) {
  const cat = catMap[p.category_id] || { slug: "", name: "" };
  ts += `  {
    id: "${crypto.randomUUID()}",
    slug: "${p.slug}",
    name: ${JSON.stringify(p.name)},
    description: ${JSON.stringify(p.description)},
    price: ${p.price},
    unit: ${JSON.stringify(p.unit)},
    featured: ${p.featured},
    in_stock: ${p.in_stock},
    image_url: ${p.image_url ? JSON.stringify(p.image_url) : "null"},
    category_slug: "${cat.slug}",
    category_name: ${JSON.stringify(cat.name)},
  },
`;
}

ts += `];
`;

fs.writeFileSync(OUT_PATH, ts, "utf-8");
console.log(`✅ ${OUT_PATH} — ${categories.length} categorías, ${products.length} productos`);
