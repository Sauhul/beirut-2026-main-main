#!/usr/bin/env node
/**
 * Genera un PDF con las 321 fotos sin nombre de producto.
 * Muestra: archivo, nombre faltante, precio faltante, cantidad/gramaje faltante.
 *
 * Ejecutar: node scripts/generate-missing-pdf.mjs
 * Requiere: npm install pdfkit
 */

import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";

const PHOTOS_DIR = "/media/Guest/FOTOS DELIK/FOTOS ALMACEN PRODUCTOS PRECIO/FOTOS ALMACEN";
const OUTPUT_PDF = path.resolve("docs/fotos-sin-nombre.pdf");

// ── Parsear qué falta de cada archivo ──────────────────────────
function analyzeFile(filename) {
  const base = filename.replace(/\.(jpg|jpeg|png|webp)$/i, "");

  const hasPrice = /\(\s*[0-9.,]+\s*\)/.test(base);
  const hasWeight = /\b\d+\s*(GR|gr|G|g|ML|ml)\b/i.test(base);
  const hasUnit = /\b(KILO|LIBRA|LB|UNIDAD)\b/i.test(base);

  // Detectar si parece tener nombre (no es solo timestamp)
  const hasName = !/^(IMG|MVIMG|MVIMG)_\d{8}_\d{6}/.test(base);

  const missing = [];
  if (!hasName) missing.push("Nombre");
  if (!hasPrice) missing.push("Precio");
  if (!hasWeight && !hasUnit) missing.push("Gramaje/Cantidad");

  return { filename, missing, hasName, hasPrice, hasWeight };
}

// ── main ───────────────────────────────────────────────────────
function main() {
  const files = fs.readdirSync(PHOTOS_DIR).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));

  // Filtrar solo las que tienen problema (trashed o sin nombre)
  const problematic = [];
  for (const file of files) {
    if (file.startsWith(".trashed-")) {
      problematic.push({ filename: file, missing: ["Archivo eliminado (trashed)"], hasName: false, hasPrice: false, hasWeight: false });
      continue;
    }
    const analysis = analyzeFile(file);
    if (analysis.missing.length > 0) {
      problematic.push(analysis);
    }
  }

  // Ordenar: primero las que más les falta
  problematic.sort((a, b) => b.missing.length - a.missing.length || a.filename.localeCompare(b.filename));

  console.log(`Fotos con información faltante: ${problematic.length}`);

  // ── Generar PDF ──────────────────────────────────────────────
  fs.mkdirSync(path.dirname(OUTPUT_PDF), { recursive: true });

  const doc = new PDFDocument({ margin: 40, size: "letter" });
  const stream = fs.createWriteStream(OUTPUT_PDF);
  doc.pipe(stream);

  // Portada
  doc.fontSize(22).font("Helvetica-Bold").text("Fotos sin Información Completa", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(11).font("Helvetica").text(`Total: ${problematic.length} fotos`, { align: "center" });
  doc.text(`Fecha: ${new Date().toISOString().slice(0, 10)}`, { align: "center" });
  doc.moveDown(1);

  // Leyenda
  doc.fontSize(10).font("Helvetica-Bold").text("Leyenda de columnas:");
  doc.font("Helvetica").fontSize(9);
  doc.text("  #          - Número de orden");
  doc.text("  Archivo    - Nombre del archivo de foto");
  doc.text("  Faltante   - Qué información falta (Nombre / Precio / Gramaje)");
  doc.moveDown(1);

  // Tabla de resumen
  const withAllMissing = problematic.filter((p) => p.missing.length === 3);
  const withTwoMissing = problematic.filter((p) => p.missing.length === 2);
  const withOneMissing = problematic.filter((p) => p.missing.length === 1);

  doc.fontSize(10).font("Helvetica-Bold").text("Resumen:");
  doc.font("Helvetica").fontSize(9);
  doc.text(`  • Sin nombre, precio ni gramaje: ${withAllMissing.length} fotos`);
  doc.text(`  • Faltan 2 datos: ${withTwoMissing.length} fotos`);
  doc.text(`  • Falta 1 dato: ${withOneMissing.length} fotos`);
  doc.moveDown(1.5);

  // ── Tabla principal ──────────────────────────────────────────
  const TABLE_TOP = doc.y;
  const COL_NUM = 40;
  const COL_FILE = 70;
  const COL_MISSING = 320;
  const ROW_HEIGHT = 14;

  // Header
  doc.fontSize(9).font("Helvetica-Bold");
  doc.text("#", COL_NUM, TABLE_TOP, { width: 30 });
  doc.text("Archivo", COL_FILE, TABLE_TOP, { width: 250 });
  doc.text("Falta", COL_MISSING, TABLE_TOP, { width: 250 });
  doc.moveDown(0.3);

  // Línea separadora
  const lineY = doc.y;
  doc.moveTo(40, lineY).lineTo(560, lineY).stroke();
  doc.moveDown(0.3);

  doc.font("Helvetica").fontSize(8);

  let y = doc.y;
  const pageBottom = doc.page.height - 60;

  for (let i = 0; i < problematic.length; i++) {
    const p = problematic[i];

    // Nueva página si es necesario
    if (y > pageBottom) {
      doc.addPage();
      y = 40;

      // Re-dibuj header
      doc.fontSize(9).font("Helvetica-Bold");
      doc.text("#", COL_NUM, y, { width: 30 });
      doc.text("Archivo", COL_FILE, y, { width: 250 });
      doc.text("Falta", COL_MISSING, y, { width: 250 });
      y += 14;
      doc.moveTo(40, y).lineTo(560, y).stroke();
      y += 4;
      doc.font("Helvetica").fontSize(8);
    }

    const num = String(i + 1).padStart(3, " ");
    const missingText = p.missing.join(", ");

    // Color: rojo si falta todo, naranja si faltan 2, amarillo si falta 1
    if (p.missing.length === 3) doc.fillColor("#cc0000");
    else if (p.missing.length === 2) doc.fillColor("#cc6600");
    else doc.fillColor("#999900");

    doc.text(num, COL_NUM, y, { width: 30 });
    doc.fillColor("#000000");
    doc.text(p.filename, COL_FILE, y, { width: 250 });
    doc.fillColor("#cc0000");
    doc.text(missingText, COL_MISSING, y, { width: 250 });
    doc.fillColor("#000000");

    y += ROW_HEIGHT;
  }

  // ── Última página: listado para llenar manual ────────────────
  doc.addPage();
  doc.fontSize(16).font("Helvetica-Bold").text("Formulario para Llenar", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(9).font("Helvetica").text("Completa la información de cada producto:", { align: "center" });
  doc.moveDown(1);

  const FORM_COL_NUM = 40;
  const FORM_COL_ARCHIVO = 70;
  const FORM_COL_NOMBRE = 200;
  const FORM_COL_PRECIO = 340;
  const FORM_COL_GRAMAJE = 440;
  const FORM_ROW_H = 16;

  let fy = doc.y;
  doc.fontSize(8).font("Helvetica-Bold");
  doc.text("#", FORM_COL_NUM, fy, { width: 30 });
  doc.text("Archivo", FORM_COL_ARCHIVO, fy, { width: 130 });
  doc.text("Nombre", FORM_COL_NOMBRE, fy, { width: 140 });
  doc.text("Precio", FORM_COL_PRECIO, fy, { width: 100 });
  doc.text("Gramaje", FORM_COL_GRAMAJE, fy, { width: 100 });
  fy += 12;
  doc.moveTo(40, fy).lineTo(560, fy).stroke();
  fy += 4;

  doc.font("Helvetica").fontSize(7);

  for (let i = 0; i < problematic.length; i++) {
    if (fy > pageBottom) {
      doc.addPage();
      fy = 40;
      doc.fontSize(8).font("Helvetica-Bold");
      doc.text("#", FORM_COL_NUM, fy, { width: 30 });
      doc.text("Archivo", FORM_COL_ARCHIVO, fy, { width: 130 });
      doc.text("Nombre", FORM_COL_NOMBRE, fy, { width: 140 });
      doc.text("Precio", FORM_COL_PRECIO, fy, { width: 100 });
      doc.text("Gramaje", FORM_COL_GRAMAJE, fy, { width: 100 });
      fy += 12;
      doc.moveTo(40, fy).lineTo(560, fy).stroke();
      fy += 4;
      doc.font("Helvetica").fontSize(7);
    }

    const p = problematic[i];
    doc.fillColor("#666666");
    doc.text(String(i + 1), FORM_COL_NUM, fy, { width: 30 });
    doc.text(p.filename.length > 25 ? p.filename.slice(0, 22) + "..." : p.filename, FORM_COL_ARCHIVO, fy, { width: 130 });
    // Línea para escribir nombre
    doc.moveTo(FORM_COL_NOMBRE, fy + 10).lineTo(FORM_COL_NOMBRE + 130, fy + 10).stroke();
    // Línea para escribir precio
    doc.moveTo(FORM_COL_PRECIO, fy + 10).lineTo(FORM_COL_PRECIO + 90, fy + 10).stroke();
    // Línea para escribir gramaje
    doc.moveTo(FORM_COL_GRAMAJE, fy + 10).lineTo(FORM_COL_GRAMAJE + 90, fy + 10).stroke();
    doc.fillColor("#000000");

    fy += FORM_ROW_H;
  }

  doc.end();

  stream.on("finish", () => {
    console.log(`✅ PDF generado: ${OUTPUT_PDF}`);
    console.log(`   ${problematic.length} fotos listadas`);
  });
}

main();
