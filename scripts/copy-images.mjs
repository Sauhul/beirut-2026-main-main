#!/usr/bin/env node
/**
 * Copia las imágenes de productos desde el disco externo a public/products/
 * mapeando cada slug con su archivo original.
 */
import fs from "node:fs";
import path from "node:path";

const PHOTOS_DIR = "/media/Guest/FOTOS DELIK/FOTOS ALMACEN PRODUCTOS PRECIO/FOTOS ALMACEN";
const DEST_DIR = path.resolve("public/products");

// Mapeo: slug → nombre de archivo original
const SLUG_TO_FILE = {
  "albaricoque-seco": "ALBARICOQUE SECO (25.000) .jpg",
  "almendra-media-l": "ALMENDRA MEDIA L(20.000).jpg",
  "baklawa-kilo": "BAKLAWA KILO (180.000) .jpg",
  "baklawa-hojaldre": "BAKLAWA HOJALDRE (15.000) .jpg",
  "berenjena-con-tahine": "BERENJENA CON TAHINE(12.000).jpg",
  "bordon": "BORDON (25.000).jpg",
  "bulgur-trigo-blanco-1": "BULGUR TRIGO BLANCO 1 (16.000) .jpg",
  "cafe-maatouk-450gr": "CAFE MAATOUK 450GR  (55.000).jpg",
  "cafe-maatuk-200gr": "CAFE MAATUK 200GR (30.000) .jpg",
  "cafe-najjar-clasic": "CAFE NAJJAR CLASIC(50.000).jpg",
  "cafe-najjar-con-cardamomo": "CAFE NAJJAR CON CARDAMOMO(27.000).jpg",
  "castania-azul-lat": "CASTANIA AZUL LAT (50.000).jpg",
  "castania-sin-sal": "CASTANIA SIN SAL(75.000).jpg",
  "castania-verde-lat": "CASTANIA VERDE LAT(65.000).jpg",
  "chanclis": "chanclis (38000).jpg",
  "crunchy-170gr": "CRUNCHY 170GR (30.000).jpg",
  "crunchy-bite-80gr": "CRUNCHY BITE 80GR (15.000) .jpg",
  "crunchy-bites-80gr": "CRUNCHY BITES 80GR (15.000) .jpg",
  "crunchy-bites-80gr-2": "CRUNCHY BITES 80GR (15.000)  (2).jpg",
  "crunchy-lat-morada-170gr": "CRUNCHY LAT MORADA 170GR (20.000) .jpg",
  "crunchy-lat-morada-340gr": "CRUNCHY LAT MORADA 340GR (35.000) .jpg",
  "crunchy-lat-morada": "CRUNCHY LAT MORADA(45.000).jpg",
  "crunchy-lat-roja-340gr": "CRUNCHY LAT ROJA 340GR (60.000) .jpg",
  "crunchy-lat-verde-450gr": "CRUNCHY LAT VERDE 450GR (55.000) .jpg",
  "crunchy-lata-200gr": "CRUNCHY LATA 200GR (25.000).jpg",
  "crunchy-lt-verde-170gr": "CRUNCHY LT VERDE 170GR (25.000) .jpg",
  "crunchy-tarro-200gr": "CRUNCHY TARRO 200GR (25.000) .jpg",
  "crunchy-tarro-200gr-2": "CRUNCHY TARRO 200GR (25.000)  (2).jpg",
  "crunchy-verde-pinante": "CRUNCHY VERDE PINANTE (55.000).jpg",
  "ctunchy-bites-80gr": "CTUNCHY BITES 80GR (15.000) .jpg",
  "datil-libra": "DATIL LIBRA(45.000).jpg",
  "datil-relleno": "DATIL RELLENO(100.000).jpg",
  "datiles-kilo": "DATILES KILO (90.000) .jpg",
  "empanada-carne": "EMPANADA CARNE (29.000) .jpg",
  "empanada-carne-con-labneh": "EMPANADA CARNE CON LABNEH (29.000) .jpg",
  "empanada-de-arish": "EMPANADA DE ARISH (22.000).jpg",
  "empanada-de-espinaca": "EMPANADA DE ESPINACA (24.000).jpg",
  "empanada-de-pollo": "EMPANADA DE POLLO (22.000) .jpg",
  "empanada-papa-y-carne": "EMPANADA PAPA Y CARNE (29.000).jpg",
  "especias-7-pimienta-454gr": "ESPECIAS 7 PIMIENTA 454GR (.jpg",
  "especias-falafel-454gr": "ESPECIAS FALAFEL 454GR (70.000) .jpg",
  "especias-kebbe454gr": "ESPECIAS KEBBE454GR (70.000) .jpg",
  "falafel": "FALAFEL (20.000) .jpg",
  "garbanzo-amarillo": "GARBANZO AMARILLO (12.000) .jpg",
  "ghraybeh": "GHRAYBEH (14.000).jpg",
  "habas-lata-400gr": "HABAS LATA 400GR (7.000) .jpg",
  "hierbabuena-seca-200gr": "HIERBABUENA SECA 200GR (55.000) .jpg",
  "hierbamate": "HIERBAMATE (16.000) .jpg",
  "hierbamate-2": "HIERBAMATE(16.000).jpg",
  "higos-secos-125gr": "HIGOS SECOS 125GR (17.000) .jpg",
  "labne": "labne(38.000).jpg",
  "lentejas-rojas": "LENTEJAS ROJAS (22.000) .jpg",
  "manguera": "MANGUERA (30.000) .jpg",
  "nuez-250": "NUEZ 250(30.000).jpg",
  "pan-ajonjoli-x3": "PAN AJONJOLI X3(6.000).jpg",
  "pan-arabe": "PAN ARABE(8.000).jpg",
  "pan-con-zaatar": "PAN CON ZAATAR(7.000).jpg",
  "pan-integral": "PAN INTEGRAL(7.000).jpg",
  "pan-mini": "PAN MINI (7.000).jpg",
  "pan-tostado": "PAN TOSTADO(5.000).jpg",
  "pinones": "piñones(85.000).jpg",
  "sal-de-limon-libra": "SAL DE LIMON LB (20.000) .jpg",
  "semola-fina": "SEMOLA FINA(22.000).jpg",
  "semola-gruesa": "SEMOLA GRUESA (22.000).jpg",
  "tahine-454gr": "TAHINE 454GR (25.000) .jpg",
  "tahine-907gr": "TAHINE 907GR (50.000) .jpg",
  "tahine-con-garbanzo": "TAHINE CON GARBANZO(12.000).jpg",
  "tahine-kilo": "TAHINE KILO(50.000).jpg",
  "tahine-libra": "tahine libra(25.000).jpg",
  "te-ceylon-160": "TE CEYLON 160 (25.000).jpg",
  "te-ceylon-400gr": "TE CEYLON 400GR(45.000).jpg",
  "trigo-entero": "TRIGO ENTERO (15.000) .jpg",
  "zaatar-500gr": "ZAATAR 500GR (45.000) .jpg",
  "zwan-caene-850": "ZWAN CAENE 850(55.000).jpg",
  "zwan-carne-340": "ZWAN CARNE 340(30.000).jpg",
  "zwan-pollo": "ZWAN POLLO (30.000).jpg",
  "zwan-pollo-850gr": "ZWAN POLLO 850GR (55.000).jpg",
};

fs.mkdirSync(DEST_DIR, { recursive: true });

let ok = 0, fail = 0;
for (const [slug, filename] of Object.entries(SLUG_TO_FILE)) {
  const src = path.join(PHOTOS_DIR, filename);
  const dest = path.join(DEST_DIR, `${slug}.jpg`);

  if (!fs.existsSync(src)) {
    console.log(`⚠️  No existe: ${filename}`);
    fail++;
    continue;
  }

  fs.copyFileSync(src, dest);
  ok++;
}

console.log(`\n✅ Copiadas: ${ok}, No encontradas: ${fail}`);
console.log(`📁 Destino: ${DEST_DIR}`);
