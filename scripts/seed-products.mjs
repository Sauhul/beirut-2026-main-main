#!/usr/bin/env node
/**
 * Script para parsear fotos de productos y generar SQL INSERT + script de subida de imágenes.
 *
 * Ejecutar:  node scripts/seed-products.mjs
 */

import fs from "node:fs";
import path from "node:path";

// ── Configuración ──────────────────────────────────────────────
const PHOTOS_DIR = "/media/Guest/FOTOS DELIK/FOTOS ALMACEN PRODUCTOS PRECIO/FOTOS ALMACEN";
const OUTPUT_SQL = path.resolve("supabase/seed-album-productos.sql");
const OUTPUT_UPLOAD = path.resolve("scripts/upload-images.mjs");

// ── Categorías ─────────────────────────────────────────────────
const CATEGORIES = [
  { id: "cat-1", slug: "frutos-secos",     name: "Frutos Secos y Frutas Secas", description: "Almendras, nueces, dátiles, higos y más",             sort_order: 1 },
  { id: "cat-2", slug: "panaderia",        name: "Panadería",                   description: "Pan árabe, pita, tostado, empanadas",                 sort_order: 2 },
  { id: "cat-3", slug: "lacteos",          name: "Lácteos y Derivados",         description: "Labneh, queso y productos lácteos",                   sort_order: 3 },
  { id: "cat-4", slug: "cafe-te",          name: "Café y Té",                   description: "Café molido, granos y té",                            sort_order: 4 },
  { id: "cat-5", slug: "especias-hierbas", name: "Especias y Hierbas",          description: "Especias, hierbas aromáticas y sazonadores",         sort_order: 5 },
  { id: "cat-6", slug: "legumbres-granos", name: "Legumbres y Granos",          description: "Lentejas, garbanzos, bulgur, semola",                sort_order: 6 },
  { id: "cat-7", slug: "snacks",           name: "Snacks",                      description: "Crunchy, chips y snacks",                            sort_order: 7 },
  { id: "cat-8", slug: "preparados",       name: "Productos Preparados",        description: "Empanadas, falafel, baklawa",                       sort_order: 8 },
  { id: "cat-9", slug: "salsas-condimentos", name: "Salsas y Condimentos",     description: "Tahine, zaatar, sal de limón",                      sort_order: 9 },
];

// ── Palabras clave para categorizar ────────────────────────────
const CATEGORY_KEYWORDS = {
  "cat-2": ["pan ", "empanada"],
  "cat-3": ["labne"],
  "cat-4": ["cafe", "té ", "te "],
  "cat-5": ["especias", "hierba", "zaatar 500", "pimienta"],
  "cat-6": ["lenteja", "garbanzo", "bulgur", "semola", "trigo", "habas"],
  "cat-7": ["crunchy", "bite"],
  "cat-8": ["baklawa", "bordon", "falafel"],
  "cat-9": ["tahine", "sal de limon", "berenjena con tahine"],
};

// ── Mapeo de unidades ──────────────────────────────────────────
const UNIT_MAP = {
  libra: "libra", lb: "libra", libras: "libra",
  kilo: "kilo", kilos: "kilo",
  unidad: "unidad",
};

// ── Parsear nombre de archivo ──────────────────────────────────
function parseFilename(filename) {
  if (filename.startsWith(".trashed-")) return null;
  if (/^(IMG_|MVIMG_)\d{8}_\d{6}/.test(filename)) return null;

  const base = filename.replace(/\.(jpg|jpeg|png|webp)$/i, "");

  // Buscar precio: último paréntesis con número que NO sea solo "(2)" o "(3)"
  const priceMatches = [...base.matchAll(/\(([0-9.,]+)\)/g)];
  let price = null;
  let nameRaw = base;

  if (priceMatches.length > 0) {
    // Usar el ÚLTIMO paréntesis que contenga un precio válido (>100)
    for (let i = priceMatches.length - 1; i >= 0; i--) {
      const val = parseInt(priceMatches[i][1].replace(/\./g, ""), 10);
      if (val >= 100) {
        price = val;
        nameRaw = base.slice(0, base.lastIndexOf(priceMatches[i][0])).trim();
        break;
      }
    }
    // Si no se encontró precio válido, limpiar "(2)", "(3)" etc.
    if (price === null) {
      nameRaw = base.replace(/\s*\(\d+\)\s*$/, "").trim();
    }
  }

  // Detectar unidad/peso
  let unit = "unidad";
  let nameClean = nameRaw;

  // Pesos: 450GR, 170GR, 80GR, 340GR, 125GR, 200GR, 400GR, 500GR, 907GR, 850GR
  const weightMatch = nameClean.match(/\b(\d+)\s*(GR|gr|G|g|ML|ml)\b/i);
  if (weightMatch) {
    unit = `${weightMatch[1]}${weightMatch[2].toUpperCase().replace("G", "GR").replace("GRR", "GR")}`;
    if (unit === "1GR") unit = "1GR"; // Keep as-is
    nameClean = nameClean.replace(weightMatch[0], "").trim();
  }

  // Unidades: KILO, LIBRA, LB
  const unitMatch = nameClean.match(/\b(KILO|LIBRA|LB)\b/i);
  if (unitMatch) {
    unit = UNIT_MAP[unitMatch[1].toLowerCase()] || unitMatch[1].toLowerCase();
    nameClean = nameClean.replace(unitMatch[0], "").trim();
  }

  // "MEDIA L" → puede ser una talla, mantenerlo en el nombre
  nameClean = nameClean.replace(/\s+/g, " ").trim();

  // Nombre con primera letra mayúscula
  const name = nameClean
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  // Slug
  const slug = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return { name, slug, price, unit, filename };
}

// ── Asignar categoría ──────────────────────────────────────────
function assignCategory(name) {
  const lower = name.toLowerCase();
  for (const [catId, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) return catId;
    }
  }
  return "cat-1";
}

// ── Generar slug único con sufijo de unidad ─────────────────────
function uniqueSlug(baseSlug, unit, seen) {
  let candidate = baseSlug;
  if (unit !== "unidad") {
    candidate = `${baseSlug}-${unit.toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  }
  if (!seen.has(candidate)) {
    seen.add(candidate);
    return candidate;
  }
  // Agregar número si ya existe
  let n = 2;
  while (seen.has(`${candidate}-${n}`)) n++;
  seen.add(`${candidate}-${n}`);
  return `${candidate}-${n}`;
}

// ── main ───────────────────────────────────────────────────────
function main() {
  const files = fs.readdirSync(PHOTOS_DIR).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
  const products = [];
  const skipped = [];

  for (const file of files) {
    const parsed = parseFilename(file);
    if (!parsed) {
      skipped.push(file);
      continue;
    }
    const category_id = assignCategory(parsed.name);
    products.push({ ...parsed, category_id });
  }

  // Ordenar
  products.sort((a, b) => a.category_id.localeCompare(b.category_id) || a.name.localeCompare(b.name));

  // Generar slugs únicos
  const seenSlugs = new Set();
  for (const p of products) {
    p.slug = uniqueSlug(p.slug, p.unit, seenSlugs);
  }

  // ── Generar SQL ──────────────────────────────────────────────
  let sql = `-- ============================================================\n`;
  sql += `-- SEED: Productos del almacén (generado automáticamente)\n`;
  sql += `-- Fecha: ${new Date().toISOString().slice(0, 10)}\n`;
  sql += `-- Total: ${products.length} productos\n`;
  sql += `-- ============================================================\n\n`;

  sql += `-- Categorías\n`;
  for (const cat of CATEGORIES) {
    sql += `INSERT INTO public.categories (id, slug, name, description, sort_order)\n`;
    sql += `VALUES ('${cat.id}', '${cat.slug}', '${cat.name}', '${cat.description}', ${cat.sort_order})\n`;
    sql += `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;\n\n`;
  }

  sql += `-- Productos\n`;
  for (const p of products) {
    const desc = `${p.name} - Producto del almacén Beirut`;
    const imgPath = `products/${p.slug}.jpg`;
    sql += `INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)\n`;
    sql += `VALUES ('${p.category_id}', '${p.slug}', '${p.name}', '${desc.replace(/'/g, "''")}', ${p.price ?? 0}, '${p.unit}', '${imgPath}', false, true)\n`;
    sql += `ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;\n\n`;
  }

  fs.mkdirSync(path.dirname(OUTPUT_SQL), { recursive: true });
  fs.writeFileSync(OUTPUT_SQL, sql, "utf-8");
  console.log(`✅ SQL generado: ${OUTPUT_SQL}`);
  console.log(`   ${products.length} productos, ${skipped.length} ignorados`);

  // ── Generar script de subida ─────────────────────────────────
  let upload = `#!/usr/bin/env node\n`;
  upload += `/**\n * Sube las imágenes de productos a Supabase Storage.\n`;
  upload += ` * Ejecutar: node scripts/upload-images.mjs\n`;
  upload += ` * Requiere: SUPABASE_URL y SUPABASE_SERVICE_KEY en .env.local\n */\n\n`;
  upload += `import fs from "node:fs";\nimport path from "node:path";\n`;
  upload += `import { createClient } from "@supabase/supabase-js";\n`;
  upload += `import "dotenv/config";\n\n`;
  upload += `const url = process.env.SUPABASE_URL;\nconst key = process.env.SUPABASE_SERVICE_KEY;\n`;
  upload += `if (!url || !key) { console.error("Faltan SUPABASE_URL y SUPABASE_SERVICE_KEY"); process.exit(1); }\n`;
  upload += `const supabase = createClient(url, key);\n\n`;
  upload += `const PHOTOS = ${JSON.stringify(PHOTOS_DIR)};\n`;
  upload += `const BUCKET = "product-images";\n\n`;
  upload += `const products = [\n`;
  for (const p of products) {
    upload += `  { slug: ${JSON.stringify(p.slug)}, file: ${JSON.stringify(p.filename)} },\n`;
  }
  upload += `];\n\n`;
  upload += `async function uploadAll() {\n`;
  upload += `  let ok = 0, fail = 0;\n`;
  upload += `  for (const p of products) {\n`;
  upload += `    const filePath = path.join(PHOTOS, p.file);\n`;
  upload += `    if (!fs.existsSync(filePath)) { console.log("⚠️  No existe:", p.file); fail++; continue; }\n`;
  upload += `    const data = fs.readFileSync(filePath);\n`;
  upload += `    const { error } = await supabase.storage\n`;
  upload += `      .from(BUCKET)\n`;
  upload += `      .upload(\`\${p.slug}.jpg\`, data, { contentType: "image/jpeg", upsert: true });\n`;
  upload += `    if (error) { console.error("❌", p.slug, error.message); fail++; }\n`;
  upload += `    else { ok++; process.stdout.write("."); }\n`;
  upload += `  }\n`;
  upload += `  console.log(\`\\n✅ Subidas: \${ok}, Errores: \${fail}\`);\n`;
  upload += `}\n\n`;
  upload += `uploadAll();\n`;

  fs.mkdirSync(path.dirname(OUTPUT_UPLOAD), { recursive: true });
  fs.writeFileSync(OUTPUT_UPLOAD, upload, "utf-8");
  console.log(`✅ Script de subida: ${OUTPUT_UPLOAD}`);

  // ── Resumen ──────────────────────────────────────────────────
  console.log(`\n📦 Resumen por categoría:`);
  const byCat = {};
  for (const p of products) {
    const cat = CATEGORIES.find((c) => c.id === p.category_id);
    byCat[cat?.name || p.category_id] = (byCat[cat?.name || p.category_id] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(byCat)) {
    console.log(`   ${cat}: ${count} productos`);
  }
}

main();
