#!/usr/bin/env node
/**
 * Sube las imágenes de productos a Supabase Storage.
 * Ejecutar: node scripts/upload-images.mjs
 * Requiere: SUPABASE_URL y SUPABASE_SERVICE_KEY en .env.local
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;
if (!url || !key) { console.error("Faltan SUPABASE_URL y SUPABASE_SERVICE_KEY"); process.exit(1); }
const supabase = createClient(url, key);

const PHOTOS = "/media/Guest/FOTOS DELIK/FOTOS ALMACEN PRODUCTOS PRECIO/FOTOS ALMACEN";
const BUCKET = "product-images";

const products = [
  { slug: "albaricoque-seco", file: "ALBARICOQUE SECO (25.000) .jpg" },
  { slug: "almendra-media-l", file: "ALMENDRA MEDIA L(20.000).jpg" },
  { slug: "castania-azul-lat", file: "CASTANIA AZUL LAT (50.000).jpg" },
  { slug: "castania-sin-sal", file: "CASTANIA SIN SAL(75.000).jpg" },
  { slug: "castania-verde-lat", file: "CASTANIA VERDE LAT(65.000).jpg" },
  { slug: "chanclis", file: "chanclis (38000).jpg" },
  { slug: "datil-libra", file: "DATIL LIBRA(45.000).jpg" },
  { slug: "datil-relleno", file: "DATIL RELLENO(100.000).jpg" },
  { slug: "datiles-kilo", file: "DATILES KILO (90.000) .jpg" },
  { slug: "ghraybeh", file: "GHRAYBEH (14.000).jpg" },
  { slug: "higos-secos-125gr", file: "HIGOS SECOS 125GR (17.000) .jpg" },
  { slug: "manguera", file: "MANGUERA (30.000) .jpg" },
  { slug: "nuez-250", file: "NUEZ 250(30.000).jpg" },
  { slug: "pinones", file: "piñones(85.000).jpg" },
  { slug: "zaatar-500gr", file: "ZAATAR 500GR (45.000) .jpg" },
  { slug: "zwan-caene-850", file: "ZWAN CAENE 850(55.000).jpg" },
  { slug: "zwan-carne-340", file: "ZWAN CARNE 340(30.000).jpg" },
  { slug: "zwan-pollo", file: "ZWAN POLLO (30.000).jpg" },
  { slug: "zwan-pollo-850gr", file: "ZWAN POLLO 850GR (55.000).jpg" },
  { slug: "empanada-carne", file: "EMPANADA CARNE (29.000) .jpg" },
  { slug: "empanada-carne-con-labneh", file: "EMPANADA CARNE CON LABNEH (29.000) .jpg" },
  { slug: "empanada-de-arish", file: "EMPANADA DE ARISH (22.000).jpg" },
  { slug: "empanada-de-espinaca", file: "EMPANADA DE ESPINACA (24.000).jpg" },
  { slug: "empanada-de-pollo", file: "EMPANADA DE POLLO (22.000) .jpg" },
  { slug: "empanada-papa-y-carne", file: "EMPANADA PAPA Y CARNE (29.000).jpg" },
  { slug: "pan-ajonjoli-x3", file: "PAN AJONJOLI X3(6.000).jpg" },
  { slug: "pan-arabe", file: "PAN ARABE(8.000).jpg" },
  { slug: "pan-con-zaatar", file: "PAN CON ZAATAR(7.000).jpg" },
  { slug: "pan-integral", file: "PAN INTEGRAL(7.000).jpg" },
  { slug: "pan-mini", file: "PAN MINI (7.000).jpg" },
  { slug: "pan-tostado", file: "PAN TOSTADO(5.000).jpg" },
  { slug: "labne", file: "labne(38.000).jpg" },
  { slug: "cafe-maatouk-450gr", file: "CAFE MAATOUK 450GR  (55.000).jpg" },
  { slug: "cafe-maatuk-200gr", file: "CAFE MAATUK 200GR (30.000) .jpg" },
  { slug: "cafe-najjar-clasic", file: "CAFE NAJJAR CLASIC(50.000).jpg" },
  { slug: "cafe-najjar-con-cardamomo", file: "CAFE NAJJAR CON CARDAMOMO(27.000).jpg" },
  { slug: "te-ceylon-400gr", file: "TE CEYLON 400GR(45.000).jpg" },
  { slug: "te-ceylon-160", file: "TE CEYLON 160 (25.000).jpg" },
  { slug: "especias-7-pimienta-454gr", file: "ESPECIAS 7 PIMIENTA 454GR (.jpg" },
  { slug: "especias-falafel-454gr", file: "ESPECIAS FALAFEL 454GR (70.000) .jpg" },
  { slug: "especias-kebbe454gr", file: "ESPECIAS KEBBE454GR (70.000) .jpg" },
  { slug: "hierbabuena-seca-200gr", file: "HIERBABUENA SECA 200GR (55.000) .jpg" },
  { slug: "hierbamate", file: "HIERBAMATE (16.000) .jpg" },
  { slug: "hierbamate-2", file: "HIERBAMATE(16.000).jpg" },
  { slug: "bulgur-trigo-blanco-1", file: "BULGUR TRIGO BLANCO 1 (16.000) .jpg" },
  { slug: "garbanzo-amarillo", file: "GARBANZO AMARILLO (12.000) .jpg" },
  { slug: "habas-lata-400gr", file: "HABAS LATA 400GR (7.000) .jpg" },
  { slug: "lentejas-rojas", file: "LENTEJAS ROJAS (22.000) .jpg" },
  { slug: "semola-fina", file: "SEMOLA FINA(22.000).jpg" },
  { slug: "semola-gruesa", file: "SEMOLA GRUESA (22.000).jpg" },
  { slug: "tahine-con-garbanzo", file: "TAHINE CON GARBANZO(12.000).jpg" },
  { slug: "trigo-entero", file: "TRIGO ENTERO (15.000) .jpg" },
  { slug: "crunchy-170gr", file: "CRUNCHY 170GR (30.000).jpg" },
  { slug: "crunchy-bite-80gr", file: "CRUNCHY BITE 80GR (15.000) .jpg" },
  { slug: "crunchy-bites-80gr", file: "CRUNCHY BITES 80GR (15.000)  (2).jpg" },
  { slug: "crunchy-bites-80gr-2", file: "CRUNCHY BITES 80GR (15.000) .jpg" },
  { slug: "crunchy-lat-morada-170gr", file: "CRUNCHY LAT MORADA 170GR (20.000) .jpg" },
  { slug: "crunchy-lat-morada-340gr", file: "CRUNCHY LAT MORADA 340GR (35.000) .jpg" },
  { slug: "crunchy-lat-morada", file: "CRUNCHY LAT MORADA(45.000).jpg" },
  { slug: "crunchy-lat-roja-340gr", file: "CRUNCHY LAT ROJA 340GR (60.000) .jpg" },
  { slug: "crunchy-lat-verde-450gr", file: "CRUNCHY LAT VERDE 450GR (55.000) .jpg" },
  { slug: "crunchy-lata-200gr", file: "CRUNCHY LATA 200GR (25.000).jpg" },
  { slug: "crunchy-lt-verde-170gr", file: "CRUNCHY LT VERDE 170GR (25.000) .jpg" },
  { slug: "crunchy-tarro-200gr", file: "CRUNCHY TARRO 200GR (25.000)  (2).jpg" },
  { slug: "crunchy-tarro-200gr-2", file: "CRUNCHY TARRO 200GR (25.000) .jpg" },
  { slug: "crunchy-verde-pinante", file: "CRUNCHY VERDE PINANTE (55.000).jpg" },
  { slug: "ctunchy-bites-80gr", file: "CTUNCHY BITES 80GR (15.000) .jpg" },
  { slug: "baklawa-kilo", file: "BAKLAWA KILO (180.000) .jpg" },
  { slug: "baklawa-hojaldre", file: "BAKLAWA HOJALDRE (15.000) .jpg" },
  { slug: "bordon", file: "BORDON (25.000).jpg" },
  { slug: "falafel", file: "FALAFEL (20.000) .jpg" },
  { slug: "berenjena-con-tahine", file: "BERENJENA CON TAHINE(12.000).jpg" },
  { slug: "sal-de-limon-libra", file: "SAL DE LIMON LB (20.000) .jpg" },
  { slug: "tahine-454gr", file: "TAHINE 454GR (25.000) .jpg" },
  { slug: "tahine-907gr", file: "TAHINE 907GR (50.000) .jpg" },
  { slug: "tahine-kilo", file: "TAHINE KILO(50.000).jpg" },
  { slug: "tahine-libra", file: "tahine libra(25.000).jpg" },
];

async function uploadAll() {
  let ok = 0, fail = 0;
  for (const p of products) {
    const filePath = path.join(PHOTOS, p.file);
    if (!fs.existsSync(filePath)) { console.log("⚠️  No existe:", p.file); fail++; continue; }
    const data = fs.readFileSync(filePath);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(`${p.slug}.jpg`, data, { contentType: "image/jpeg", upsert: true });
    if (error) { console.error("❌", p.slug, error.message); fail++; }
    else { ok++; process.stdout.write("."); }
  }
  console.log(`\n✅ Subidas: ${ok}, Errores: ${fail}`);
}

uploadAll();
