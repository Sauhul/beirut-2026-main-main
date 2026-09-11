#!/usr/bin/env node
/**
 * Script completo para poblar Supabase con:
 *   1. 9 categorías
 *   2. 77 productos
 *   3. 77 imágenes subidas a Supabase Storage
 *   4. image_url actualizado con la URL pública de Storage
 *
 * Ejecutar: node scripts/seed-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// ── Configuración ──
const SUPABASE_URL = "https://unjojlgwgbcxyxqqkjbe.supabase.co";
const SERVICE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam9qbGd3Z2JjeHl4cXFramJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2MTA1MiwiZXhwIjoyMTAzMTM3MDUyfQ.bItD8RtFhEYDyVPmritnlV5SU42ahq7q0iLt-NQ9Irg";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
const BUCKET = "product-images";
const IMAGES_DIR = path.join(PROJECT_ROOT, "public", "products");

// ── Categorías ──
const CATEGORIES = [
  { id: "cat-1", slug: "frutos-secos", name: "Frutos Secos y Frutas Secas", description: "Almendras, nueces, dátiles, higos y más", sort_order: 1 },
  { id: "cat-2", slug: "panaderia", name: "Panadería", description: "Pan árabe, pita, tostado, empanadas", sort_order: 2 },
  { id: "cat-3", slug: "lacteos", name: "Lácteos y Derivados", description: "Labneh, queso y productos lácteos", sort_order: 3 },
  { id: "cat-4", slug: "cafe-te", name: "Café y Té", description: "Café molido, granos y té", sort_order: 4 },
  { id: "cat-5", slug: "especias-hierbas", name: "Especias y Hierbas", description: "Especias, hierbas aromáticas y sazonadores", sort_order: 5 },
  { id: "cat-6", slug: "legumbres-granos", name: "Legumbres y Granos", description: "Lentejas, garbanzos, bulgur, semola", sort_order: 6 },
  { id: "cat-7", slug: "snacks", name: "Snacks", description: "Crunchy, chips y snacks", sort_order: 7 },
  { id: "cat-8", slug: "preparados", name: "Productos Preparados", description: "Empanadas, falafel, baklawa", sort_order: 8 },
  { id: "cat-9", slug: "salsas-condimentos", name: "Salsas y Condimentos", description: "Tahine, zaatar, sal de limón", sort_order: 9 },
];

// ── Productos (77) ──
const PRODUCTS = [
  { category_id: "cat-1", slug: "albaricoque-seco", name: "Albaricoque Seco", description: "Albaricoque Seco - Producto del almacén Beirut", price: 25000, unit: "unidad" },
  { category_id: "cat-1", slug: "almendra-media-l", name: "Almendra Media L", description: "Almendra Media L - Producto del almacén Beirut", price: 20000, unit: "unidad" },
  { category_id: "cat-1", slug: "castania-azul-lat", name: "Castania Azul Lat", description: "Castania Azul Lat - Producto del almacén Beirut", price: 50000, unit: "unidad" },
  { category_id: "cat-1", slug: "castania-sin-sal", name: "Castania Sin Sal", description: "Castania Sin Sal - Producto del almacén Beirut", price: 75000, unit: "unidad" },
  { category_id: "cat-1", slug: "castania-verde-lat", name: "Castania Verde Lat", description: "Castania Verde Lat - Producto del almacén Beirut", price: 65000, unit: "unidad" },
  { category_id: "cat-1", slug: "chanclis", name: "Chanclis", description: "Chanclis - Producto del almacén Beirut", price: 38000, unit: "unidad" },
  { category_id: "cat-1", slug: "datil-libra", name: "Datil", description: "Datil - Producto del almacén Beirut", price: 45000, unit: "libra" },
  { category_id: "cat-1", slug: "datil-relleno", name: "Datil Relleno", description: "Datil Relleno - Producto del almacén Beirut", price: 100000, unit: "unidad" },
  { category_id: "cat-1", slug: "datiles-kilo", name: "Datiles", description: "Datiles - Producto del almacén Beirut", price: 90000, unit: "kilo" },
  { category_id: "cat-1", slug: "ghraybeh", name: "Ghraybeh", description: "Ghraybeh - Producto del almacén Beirut", price: 14000, unit: "unidad" },
  { category_id: "cat-1", slug: "higos-secos-125gr", name: "Higos Secos", description: "Higos Secos - Producto del almacén Beirut", price: 17000, unit: "125GR" },
  { category_id: "cat-1", slug: "manguera", name: "Manguera", description: "Manguera - Producto del almacén Beirut", price: 30000, unit: "unidad" },
  { category_id: "cat-1", slug: "nuez-250", name: "Nuez 250", description: "Nuez 250 - Producto del almacén Beirut", price: 30000, unit: "unidad" },
  { category_id: "cat-1", slug: "pinones", name: "Piñones", description: "Piñones - Producto del almacén Beirut", price: 85000, unit: "unidad" },
  { category_id: "cat-1", slug: "zaatar-500gr", name: "Zaatar", description: "Zaatar - Producto del almacén Beirut", price: 45000, unit: "500GR" },
  { category_id: "cat-1", slug: "zwan-caene-850", name: "Zwan Caene 850", description: "Zwan Caene 850 - Producto del almacén Beirut", price: 55000, unit: "unidad" },
  { category_id: "cat-1", slug: "zwan-carne-340", name: "Zwan Carne 340", description: "Zwan Carne 340 - Producto del almacén Beirut", price: 30000, unit: "unidad" },
  { category_id: "cat-1", slug: "zwan-pollo", name: "Zwan Pollo", description: "Zwan Pollo - Producto del almacén Beirut", price: 30000, unit: "unidad" },
  { category_id: "cat-1", slug: "zwan-pollo-850gr", name: "Zwan Pollo", description: "Zwan Pollo - Producto del almacén Beirut", price: 55000, unit: "850GR" },
  { category_id: "cat-2", slug: "empanada-carne", name: "Empanada Carne", description: "Empanada Carne - Producto del almacén Beirut", price: 29000, unit: "unidad" },
  { category_id: "cat-2", slug: "empanada-carne-con-labneh", name: "Empanada Carne Con Labneh", description: "Empanada Carne Con Labneh - Producto del almacén Beirut", price: 29000, unit: "unidad" },
  { category_id: "cat-2", slug: "empanada-de-arish", name: "Empanada De Arish", description: "Empanada De Arish - Producto del almacén Beirut", price: 22000, unit: "unidad" },
  { category_id: "cat-2", slug: "empanada-de-espinaca", name: "Empanada De Espinaca", description: "Empanada De Espinaca - Producto del almacén Beirut", price: 24000, unit: "unidad" },
  { category_id: "cat-2", slug: "empanada-de-pollo", name: "Empanada De Pollo", description: "Empanada De Pollo - Producto del almacén Beirut", price: 22000, unit: "unidad" },
  { category_id: "cat-2", slug: "empanada-papa-y-carne", name: "Empanada Papa Y Carne", description: "Empanada Papa Y Carne - Producto del almacén Beirut", price: 29000, unit: "unidad" },
  { category_id: "cat-2", slug: "pan-ajonjoli-x3", name: "Pan Ajonjoli X3", description: "Pan Ajonjoli X3 - Producto del almacén Beirut", price: 6000, unit: "unidad" },
  { category_id: "cat-2", slug: "pan-arabe", name: "Pan Arabe", description: "Pan Arabe - Producto del almacén Beirut", price: 8000, unit: "unidad" },
  { category_id: "cat-2", slug: "pan-con-zaatar", name: "Pan Con Zaatar", description: "Pan Con Zaatar - Producto del almacén Beirut", price: 7000, unit: "unidad" },
  { category_id: "cat-2", slug: "pan-integral", name: "Pan Integral", description: "Pan Integral - Producto del almacén Beirut", price: 7000, unit: "unidad" },
  { category_id: "cat-2", slug: "pan-mini", name: "Pan Mini", description: "Pan Mini - Producto del almacén Beirut", price: 7000, unit: "unidad" },
  { category_id: "cat-2", slug: "pan-tostado", name: "Pan Tostado", description: "Pan Tostado - Producto del almacén Beirut", price: 5000, unit: "unidad" },
  { category_id: "cat-3", slug: "labne", name: "Labne", description: "Labne - Producto del almacén Beirut", price: 38000, unit: "unidad" },
  { category_id: "cat-4", slug: "cafe-maatouk-450gr", name: "Cafe Maatouk", description: "Cafe Maatouk - Producto del almacén Beirut", price: 55000, unit: "450GR" },
  { category_id: "cat-4", slug: "cafe-maatuk-200gr", name: "Cafe Maatuk", description: "Cafe Maatuk - Producto del almacén Beirut", price: 30000, unit: "200GR" },
  { category_id: "cat-4", slug: "cafe-najjar-clasic", name: "Cafe Najjar Clasic", description: "Cafe Najjar Clasic - Producto del almacén Beirut", price: 50000, unit: "unidad" },
  { category_id: "cat-4", slug: "cafe-najjar-con-cardamomo", name: "Cafe Najjar Con Cardamomo", description: "Cafe Najjar Con Cardamomo - Producto del almacén Beirut", price: 27000, unit: "unidad" },
  { category_id: "cat-4", slug: "te-ceylon-400gr", name: "Te Ceylon", description: "Te Ceylon - Producto del almacén Beirut", price: 45000, unit: "400GR" },
  { category_id: "cat-4", slug: "te-ceylon-160", name: "Te Ceylon 160", description: "Te Ceylon 160 - Producto del almacén Beirut", price: 25000, unit: "unidad" },
  { category_id: "cat-5", slug: "especias-7-pimienta-454gr", name: "Especias 7 Pimienta", description: "Especias 7 Pimienta - Producto del almacén Beirut", price: 70000, unit: "454GR" },
  { category_id: "cat-5", slug: "especias-falafel-454gr", name: "Especias Falafel", description: "Especias Falafel - Producto del almacén Beirut", price: 70000, unit: "454GR" },
  { category_id: "cat-5", slug: "especias-kebbe454gr", name: "Especias Kebbe454gr", description: "Especias Kebbe454gr - Producto del almacén Beirut", price: 70000, unit: "unidad" },
  { category_id: "cat-5", slug: "hierbabuena-seca-200gr", name: "Hierbabuena Seca", description: "Hierbabuena Seca - Producto del almacén Beirut", price: 55000, unit: "200GR" },
  { category_id: "cat-5", slug: "hierbamate", name: "Hierbamate", description: "Hierbamate - Producto del almacén Beirut", price: 16000, unit: "unidad" },
  { category_id: "cat-5", slug: "hierbamate-2", name: "Hierbamate", description: "Hierbamate - Producto del almacén Beirut", price: 16000, unit: "unidad" },
  { category_id: "cat-6", slug: "bulgur-trigo-blanco-1", name: "Bulgur Trigo Blanco 1", description: "Bulgur Trigo Blanco 1 - Producto del almacén Beirut", price: 16000, unit: "unidad" },
  { category_id: "cat-6", slug: "garbanzo-amarillo", name: "Garbanzo Amarillo", description: "Garbanzo Amarillo - Producto del almacén Beirut", price: 12000, unit: "unidad" },
  { category_id: "cat-6", slug: "habas-lata-400gr", name: "Habas Lata", description: "Habas Lata - Producto del almacén Beirut", price: 7000, unit: "400GR" },
  { category_id: "cat-6", slug: "lentejas-rojas", name: "Lentejas Rojas", description: "Lentejas Rojas - Producto del almacén Beirut", price: 22000, unit: "unidad" },
  { category_id: "cat-6", slug: "semola-fina", name: "Semola Fina", description: "Semola Fina - Producto del almacén Beirut", price: 22000, unit: "unidad" },
  { category_id: "cat-6", slug: "semola-gruesa", name: "Semola Gruesa", description: "Semola Gruesa - Producto del almacén Beirut", price: 22000, unit: "unidad" },
  { category_id: "cat-6", slug: "tahine-con-garbanzo", name: "Tahine Con Garbanzo", description: "Tahine Con Garbanzo - Producto del almacén Beirut", price: 12000, unit: "unidad" },
  { category_id: "cat-6", slug: "trigo-entero", name: "Trigo Entero", description: "Trigo Entero - Producto del almacén Beirut", price: 15000, unit: "unidad" },
  { category_id: "cat-7", slug: "crunchy-170gr", name: "Crunchy", description: "Crunchy - Producto del almacén Beirut", price: 30000, unit: "170GR" },
  { category_id: "cat-7", slug: "crunchy-bite-80gr", name: "Crunchy Bite", description: "Crunchy Bite - Producto del almacén Beirut", price: 15000, unit: "80GR" },
  { category_id: "cat-7", slug: "crunchy-bites-80gr", name: "Crunchy Bites", description: "Crunchy Bites - Producto del almacén Beirut", price: 15000, unit: "80GR" },
  { category_id: "cat-7", slug: "crunchy-bites-80gr-2", name: "Crunchy Bites", description: "Crunchy Bites - Producto del almacén Beirut", price: 15000, unit: "80GR" },
  { category_id: "cat-7", slug: "crunchy-lat-morada-170gr", name: "Crunchy Lat Morada", description: "Crunchy Lat Morada - Producto del almacén Beirut", price: 20000, unit: "170GR" },
  { category_id: "cat-7", slug: "crunchy-lat-morada-340gr", name: "Crunchy Lat Morada", description: "Crunchy Lat Morada - Producto del almacén Beirut", price: 35000, unit: "340GR" },
  { category_id: "cat-7", slug: "crunchy-lat-morada", name: "Crunchy Lat Morada", description: "Crunchy Lat Morada - Producto del almacén Beirut", price: 45000, unit: "unidad" },
  { category_id: "cat-7", slug: "crunchy-lat-roja-340gr", name: "Crunchy Lat Roja", description: "Crunchy Lat Roja - Producto del almacén Beirut", price: 60000, unit: "340GR" },
  { category_id: "cat-7", slug: "crunchy-lat-verde-450gr", name: "Crunchy Lat Verde", description: "Crunchy Lat Verde - Producto del almacén Beirut", price: 55000, unit: "450GR" },
  { category_id: "cat-7", slug: "crunchy-lata-200gr", name: "Crunchy Lata", description: "Crunchy Lata - Producto del almacén Beirut", price: 25000, unit: "200GR" },
  { category_id: "cat-7", slug: "crunchy-lt-verde-170gr", name: "Crunchy Lt Verde", description: "Crunchy Lt Verde - Producto del almacén Beirut", price: 25000, unit: "170GR" },
  { category_id: "cat-7", slug: "crunchy-tarro-200gr", name: "Crunchy Tarro", description: "Crunchy Tarro - Producto del almacén Beirut", price: 25000, unit: "200GR" },
  { category_id: "cat-7", slug: "crunchy-tarro-200gr-2", name: "Crunchy Tarro", description: "Crunchy Tarro - Producto del almacén Beirut", price: 25000, unit: "200GR" },
  { category_id: "cat-7", slug: "crunchy-verde-pinante", name: "Crunchy Verde Pinante", description: "Crunchy Verde Pinante - Producto del almacén Beirut", price: 55000, unit: "unidad" },
  { category_id: "cat-7", slug: "ctunchy-bites-80gr", name: "Ctunchy Bites", description: "Ctunchy Bites - Producto del almacén Beirut", price: 15000, unit: "80GR" },
  { category_id: "cat-8", slug: "baklawa-kilo", name: "Baklawa", description: "Baklawa - Producto del almacén Beirut", price: 180000, unit: "kilo" },
  { category_id: "cat-8", slug: "baklawa-hojaldre", name: "Baklawa Hojaldre", description: "Baklawa Hojaldre - Producto del almacén Beirut", price: 15000, unit: "unidad" },
  { category_id: "cat-8", slug: "bordon", name: "Bordon", description: "Bordon - Producto del almacén Beirut", price: 25000, unit: "unidad" },
  { category_id: "cat-8", slug: "falafel", name: "Falafel", description: "Falafel - Producto del almacén Beirut", price: 20000, unit: "unidad" },
  { category_id: "cat-9", slug: "berenjena-con-tahine", name: "Berenjena Con Tahine", description: "Berenjena Con Tahine - Producto del almacén Beirut", price: 12000, unit: "unidad" },
  { category_id: "cat-9", slug: "sal-de-limon-libra", name: "Sal De Limon", description: "Sal De Limon - Producto del almacén Beirut", price: 20000, unit: "libra" },
  { category_id: "cat-9", slug: "tahine-454gr", name: "Tahine", description: "Tahine - Producto del almacén Beirut", price: 25000, unit: "454GR" },
  { category_id: "cat-9", slug: "tahine-907gr", name: "Tahine", description: "Tahine - Producto del almacén Beirut", price: 50000, unit: "907GR" },
  { category_id: "cat-9", slug: "tahine-kilo", name: "Tahine", description: "Tahine - Producto del almacén Beirut", price: 50000, unit: "kilo" },
  { category_id: "cat-9", slug: "tahine-libra", name: "Tahine", description: "Tahine - Producto del almacén Beirut", price: 25000, unit: "libra" },
];

// ── Helpers ──
function getPublicUrl(slug) {
  const files = fs.readdirSync(IMAGES_DIR);
  // Buscamos un archivo que coincida con el slug, ignorando guiones y extensiones
  const normalizedSlug = slug.replace(/-/g, '').toLowerCase();
  const foundFile = files.find(f => f.toLowerCase().replace(/-/g, '').startsWith(normalizedSlug));
  
  if (!foundFile) return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${slug}.jpg`; 

  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${foundFile}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Paso 0: Limpiar datos viejos ──
async function cleanOldData() {
  console.log("\n=== PASO 0: Limpiando datos viejos ===");

  // Eliminar order_items que referencien productos viejos (si hay)
  // Luego eliminar todos los productos viejos
  const { error: delProds } = await supabase
    .from("products")
    .delete()
    .neq("slug", "___nonexistent___"); // delete all

  if (delProds) {
    console.error("  Error eliminando productos viejos:", delProds.message);
    // No abortar, puede que no haya productos
  } else {
    console.log("  Productos viejos eliminados");
  }

  // Eliminar categorías viejas
  const { error: delCats } = await supabase
    .from("categories")
    .delete()
    .neq("id", "___nonexistent___"); // delete all

  if (delCats) {
    console.error("  Error eliminando categorías viejas:", delCats.message);
  } else {
    console.log("  Categorías viejas eliminadas");
  }

  return true;
}

// ── Paso 1: Insertar categorías ──
async function seedCategories() {
  console.log("\n=== PASO 1: Insertando categorías ===");

  const { data, error } = await supabase
    .from("categories")
    .insert(CATEGORIES)
    .select();

  if (error) {
    console.error("Error insertando categorías:", error.message);
    return false;
  }
  console.log(`  ${data.length} categorías insertadas`);
  return true;
}

// ── Paso 2: Insertar productos ──
async function seedProducts() {
  console.log("\n=== PASO 2: Insertando productos ===");

  // Primero insertar sin image_url (lo actualizamos después de subir las fotos)
  const productsWithImage = PRODUCTS.map((p) => ({
    ...p,
    image_url: null, // se actualiza en paso 4
    featured: false,
    in_stock: true,
  }));

  const { data, error } = await supabase
    .from("products")
    .insert(productsWithImage)
    .select();

  if (error) {
    console.error("Error insertando productos:", error.message);
    console.error("Detalle:", error);
    return false;
  }
  console.log(`  ${data.length} productos insertados/actualizados`);
  return true;
}

// ── Paso 3: Subir imágenes a Storage ──
async function uploadImages() {
  console.log("\n=== PASO 3: Subiendo imágenes a Storage ===");

  let ok = 0;
  let fail = 0;
  let skip = 0;
  const files = fs.readdirSync(IMAGES_DIR);

  for (const p of PRODUCTS) {
    const normalizedSlug = p.slug.replace(/-/g, '').toLowerCase();
    const foundFile = files.find(f => f.toLowerCase().replace(/-/g, '').startsWith(normalizedSlug));

    if (!foundFile) {
        console.log(`  SKIP (no local found for ${p.slug})`);
        skip++;
        continue;
    }
    
    const localPath = path.join(IMAGES_DIR, foundFile);

    const fileData = fs.readFileSync(localPath);
    const storagePath = foundFile; // Usar el nombre del archivo redimensionado

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, fileData, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (error) {
      console.error(`  ERROR subiendo ${foundFile}:`, error.message);
      fail++;
    } else {
      ok++;
      process.stdout.write(".");
    }

    // Pequeña pausa para no saturar la API
    if (ok % 10 === 0) await sleep(200);
  }

  console.log(`\n  Subidas: ${ok} | Errores: ${fail} | Omitidas: ${skip}`);
  return fail === 0;
}

// ── Paso 4: Actualizar image_url con URL pública ──
async function updateImageUrls() {
  console.log("\n=== PASO 4: Actualizando image_url de productos ===");

  let ok = 0;
  let fail = 0;

  for (const p of PRODUCTS) {
    const publicUrl = getPublicUrl(p.slug);

    const { error } = await supabase
      .from("products")
      .update({ image_url: publicUrl })
      .eq("slug", p.slug);

    if (error) {
      console.error(`  ERROR actualizando ${p.slug}:`, error.message);
      fail++;
    } else {
      ok++;
    }
  }

  console.log(`  Actualizados: ${ok} | Errores: ${fail}`);
  return fail === 0;
}

// ── Paso 5: Verificar ──
async function verify() {
  console.log("\n=== PASO 5: Verificando ===");

  const { data: cats, error: cErr } = await supabase
    .from("categories")
    .select("id, slug, name")
    .order("sort_order");

  if (cErr) {
    console.error("Error leyendo categorías:", cErr.message);
  } else {
    console.log(`  Categorías en DB: ${cats.length}`);
    for (const c of cats) console.log(`    ${c.id} | ${c.slug} | ${c.name}`);
  }

  const { data: prods, error: pErr } = await supabase
    .from("products")
    .select("slug, name, price, image_url")
    .order("name");

  if (pErr) {
    console.error("Error leyendo productos:", pErr.message);
  } else {
    console.log(`  Productos en DB: ${prods.length}`);
    const withImage = prods.filter((p) => p.image_url);
    const withoutImage = prods.filter((p) => !p.image_url);
    console.log(`    Con imagen: ${withImage.length}`);
    console.log(`    Sin imagen: ${withoutImage.length}`);
    if (withoutImage.length > 0) {
      console.log("    Productos sin imagen:");
      withoutImage.forEach((p) => console.log(`      - ${p.slug}`));
    }
  }
}

// ── Main ──
async function main() {
  console.log("================================================");
  console.log("  BEIRUT - Seed completo a Supabase");
  console.log("  URL:", SUPABASE_URL);
  console.log("  Categorías:", CATEGORIES.length);
  console.log("  Productos:", PRODUCTS.length);
  console.log("  Imágenes locales:", IMAGES_DIR);
  console.log("================================================");

  const step0 = await cleanOldData();
  if (!step0) { console.error("\nFalló paso 0. Abortando."); process.exit(1); }

  const step1 = await seedCategories();
  if (!step1) { console.error("\nFalló paso 1. Abortando."); process.exit(1); }

  const step2 = await seedProducts();
  if (!step2) { console.error("\nFalló paso 2. Abortando."); process.exit(1); }

  await uploadImages();

  await updateImageUrls();

  await verify();

  console.log("\n================================================");
  console.log("  SEED COMPLETADO");
  console.log("================================================\n");
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
