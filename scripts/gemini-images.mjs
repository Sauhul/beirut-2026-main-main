#!/usr/bin/env node
/**
 * Procesador de imágenes de productos con la API de Gemini (Gemini 2.5 Flash Image).
 *
 * Lee todas las fotos de una carpeta, les aplica el MISMO prompt de edición
 * profesional a cada una (fondo blanco, producto centrado, iluminación
 * consistente) y guarda el resultado como JPEG de exactamente 1000x1200 en
 * la carpeta de salida.
 *
 * Ejecutar:
 *   node scripts/gemini-images.mjs
 *
 * Opciones:
 *   --input DIR       Carpeta con las fotos originales
 *                     (por defecto: GEMINI_INPUT_DIR o "D:\FOTOS ALMACEN PRODUCTOS PRECIO\FOTOS ALMACEN")
 *   --output DIR      Carpeta donde se guardan las fotos retocadas
 *                     (por defecto: GEMINI_OUTPUT_DIR o "D:\IMAGENES GEMINI")
 *   --limit N         Procesar solo las primeras N imágenes (para probar)
 *   --concurrency N   Imágenes en paralelo (por defecto: 3)
 *   --force           Reprocesar imágenes que ya existen en la salida
 *   --model M         Modelo de Gemini (por defecto: gemini-3.1-flash-image)
 *   --dry-run         No llama a la API: lista qué se procesaría
 *
 * Requiere: GEMINI_API_KEY en el entorno o en .env.gemini (junto a este proyecto).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GoogleGenAI, ApiError } from "@google/genai";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// El prompt ÚNICO que se le da a Gemini para cada foto
// ---------------------------------------------------------------------------
const PROMPT = `Actúa como un editor de fotos profesional, el mejor en creación de imágenes para productos de tiendas E-commerce. Vas a centrar el producto, ponerle un fondo totalmente blanco puro (#FFFFFF), además de eso expandir la imagen a 1000x1200 píxeles en formato vertical y hacer que todas las imágenes queden con la misma iluminación. Que estas imágenes, aunque tengan empaques del color del fondo, o que el contenido sea transparente, se vean de manera perfecta el producto y se pueda apreciar la marca, la presentación y los detalles de cada empaque.

Reglas obligatorias para TODAS las imágenes:
1. Respeta el producto original: no inventes ni cambies la marca, los textos, los colores, las medidas ni los detalles del empaque. Solo corrige composición, fondo e iluminación.
2. Centra el producto en el lienzo dejando un margen blanco proporcionado alrededor.
3. Fondo 100% blanco y uniforme, sin reflejos ni sombras duras.
4. Iluminación consistente, suave y uniforme.
5. Salida en formato vertical (más alto que ancho), a la proporción del lienzo final 1000x1200.
6. IMPORTANTE: Si la imagen NO tiene legible el nombre, la marca o los textos del producto (imagen borrosa, dañada, fuera de foco o sin identificación visible), NO apliques ninguna instrucción de retoque: devuelve la imagen original sin cambios y responde únicamente con la palabra SKIP.`;

// ---------------------------------------------------------------------------
// Configuración por defecto
// ---------------------------------------------------------------------------
const DEFAULTS = {
  inputDir: "D:\\FOTOS ALMACEN PRODUCTOS PRECIO\\FOTOS ALMACEN",
  outputDir: "D:\\IMAGENES GEMINI",
  model: "gemini-3.1-flash-image",
  target: { width: 1000, height: 1200 },
  concurrency: 3,
  aspectRatio: "4:5",
  extensions: [".jpg", ".jpeg", ".png", ".webp"],
  logFile: path.join(__dirname, "..", "gemini-process-log.json"),
};

// ---------------------------------------------------------------------------
// Carga de variables de entorno (.env.gemini) sin dependencias extra
// ---------------------------------------------------------------------------
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.gemini");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf8");
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line
      .slice(eq + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

// ---------------------------------------------------------------------------
// Parámetros de línea de comandos
// ---------------------------------------------------------------------------
function parseArgs(argv) {
  const args = { ...DEFAULTS };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case "--input":
        args.inputDir = next();
        break;
      case "--output":
        args.outputDir = next();
        break;
      case "--limit":
        args.limit = parseInt(next(), 10);
        break;
      case "--concurrency":
        args.concurrency = parseInt(next(), 10) || 3;
        break;
      case "--force":
        args.force = true;
        break;
      case "--dry-run":
        args.dryRun = true;
        break;
      case "--model":
        args.model = next();
        break;
      default:
        break;
    }
  }
  args.inputDir = process.env.GEMINI_INPUT_DIR || args.inputDir;
  args.outputDir = process.env.GEMINI_OUTPUT_DIR || args.outputDir;
  return args;
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function listImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return DEFAULTS.extensions.includes(ext);
    })
    .sort()
    .map((f) => path.join(dir, f));
}

function readLog(logFile) {
  try {
    return JSON.parse(fs.readFileSync(logFile, "utf8"));
  } catch {
    return [];
  }
}

function appendLog(logFile, entry) {
  const log = readLog(logFile);
  const existing = log.findIndex((e) => e.file === entry.file);
  if (existing >= 0) log[existing] = { ...log[existing], ...entry };
  else log.push({ ...entry, at: new Date().toISOString() });
  fs.writeFileSync(logFile, JSON.stringify(log, null, 2));
}

// ---------------------------------------------------------------------------
// Llamada a Gemini con reintentos (SDK con API key o REST con token OAuth)
// ---------------------------------------------------------------------------
async function callGeminiRest(token, args, imageBytes, mimeType, aspectRatio) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${args.model}:generateContent`;
  const b64 = imageBytes.toString("base64");

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: PROMPT }, { inlineData: { mimeType, data: b64 } }],
      },
    ],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"],
      ...(aspectRatio ? { imageConfig: { aspectRatio } } : {}),
    },
  };

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const err = new Error(json?.error?.message ?? `Error HTTP ${resp.status} de Gemini`);
    err.status = json?.error?.code ?? resp.status;
    throw err;
  }
  return json;
}

async function callGeminiSdk(ai, args, imageBytes, mimeType, aspectRatio) {
  const resp = await ai.models.generateContent({
    model: args.model,
    contents: [
      {
        role: "user",
        parts: [
          { text: PROMPT },
          {
            inlineData: {
              mimeType,
              data: imageBytes.toString("base64"),
            },
          },
        ],
      },
    ],
    config: {
      responseModalities: ["TEXT", "IMAGE"],
      ...(aspectRatio ? { imageConfig: { aspectRatio } } : {}),
    },
  });
  return { parts: resp.candidates?.[0]?.content?.parts ?? [] };
}

async function callGemini(ctx, imageBytes, mimeType, aspectRatio, attempt = 0) {
  const { args } = ctx;

  try {
    const response = ctx.token
      ? await callGeminiRest(ctx.token, args, imageBytes, mimeType, aspectRatio)
      : await callGeminiSdk(ctx.ai, args, imageBytes, mimeType, aspectRatio);

    const parts = response.parts ?? [];
    const text = (parts.find((p) => p.text && p.text.trim())?.text ?? "").trim();
    const imgPart = parts.find((p) => p.inlineData?.data);

    if (!imgPart) {
      throw new Error("Gemini no devolvió una imagen en la respuesta");
    }

    const png = Buffer.from(imgPart.inlineData.data, "base64");
    const skipped = /SKIP/i.test(text);
    return { png, skipped, text };
  } catch (err) {
    const status = Number(err?.status ?? 0);
    const retryable =
      status === 429 ||
      status >= 500 ||
      (!status && /fetch|network|ECONN|timeout/i.test(String(err?.cause ?? err)));

    const mentionAspect =
      !status && /aspect.?ratio|image.?config|5:6/i.test(String(err?.message ?? err));

    // Si la API rechaza aspectRatio en edición, reintentar sin él.
    if (aspectRatio && (mentionAspect || status === 400)) {
      return callGemini(ctx, imageBytes, mimeType, undefined, attempt);
    }

    if (!retryable || attempt >= 5) throw err;

    const baseDelay = Math.min(1000 * 2 ** attempt, 30000);
    const retryAfter =
      err instanceof ApiError ? parseInt(err.headers?.get?.("retry-after") ?? "", 10) : 0;
    const wait = Math.max(baseDelay, (retryAfter || 1) * 1000);
    await sleep(wait);
    return callGemini(ctx, imageBytes, mimeType, aspectRatio, attempt + 1);
  }
}

// ---------------------------------------------------------------------------
// Normalización final: JPEG exactamente 1000x1200 sobre fondo blanco
// ---------------------------------------------------------------------------
async function finalizeToCanvas(geminiPng, target) {
  try {
    const trimmed = await sharp(geminiPng, { limitInputPixels: false })
      .rotate()
      .flatten({ background: "#ffffff" })
      .trim({ threshold: 30, background: "#ffffff" })
      .toBuffer({ resolveWithObject: true });

    if (trimmed.info.width > 4 && trimmed.info.height > 4) {
      return await sharp(trimmed.data)
        .resize({
          width: target.width,
          height: target.height,
          fit: "contain",
          background: "#ffffff",
        })
        .jpeg({ quality: 92 })
        .toBuffer();
    }
  } catch {
    // si el recorte falla, seguimos sin recortar
  }

  return await sharp(geminiPng, { limitInputPixels: false })
    .rotate()
    .flatten({ background: "#ffffff" })
    .resize({
      width: target.width,
      height: target.height,
      fit: "contain",
      background: "#ffffff",
    })
    .jpeg({ quality: 92 })
    .toBuffer();
}

// ---------------------------------------------------------------------------
// Procesamiento de una imagen
// ---------------------------------------------------------------------------
async function processOne(ctx, file) {
  const args = ctx.args;
  const name = path.basename(file);
  const outFile = path.join(args.outputDir, name);

  if (!args.force && fs.existsSync(outFile)) {
    return { file: name, status: "exists", source: file };
  }

  const raw = await sharp(file, { limitInputPixels: false }).rotate().toBuffer();
  const mimeType = (await sharp(raw).metadata()).format === "png" ? "image/png" : "image/jpeg";

  const { png, skipped } = await callGemini(ctx, raw, mimeType, args.aspectRatio);

  const buffer = skipped ? raw : await finalizeToCanvas(png, args.target);
  fs.writeFileSync(outFile, buffer);

  return {
    file: name,
    status: skipped ? "skipped" : "done",
    skipped,
    source: file,
    output: outFile,
  };
}

// ---------------------------------------------------------------------------
// Pool de workers con concurrencia limitada
// ---------------------------------------------------------------------------
async function mapWithConcurrency(items, limit, fn) {
  const results = [];
  let nextIdx = 0;
  const worker = async () => {
    while (true) {
      const idx = nextIdx++;
      if (idx >= items.length) return;
      try {
        results[idx] = { ok: true, value: await fn(items[idx]) };
      } catch (err) {
        results[idx] = { ok: false, error: err };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(args.inputDir)) {
    console.error(`❌ No existe la carpeta de entrada: ${args.inputDir}`);
    process.exit(1);
  }

  fs.mkdirSync(args.outputDir, { recursive: true });
  console.log(`📷 Entrada : ${args.inputDir}`);
  console.log(`✨ Salida  : ${args.outputDir}`);
  console.log(`🤖 Modelo  : ${args.model}`);
  if (args.dryRun) console.log("🧪 DRY RUN: no se llamará a la API de Gemini.");

  const images = listImages(args.inputDir);
  if (args.limit) images.length = Math.min(images.length, args.limit);

  if (images.length === 0) {
    console.log("No se encontraron imágenes en la carpeta de entrada.");
    process.exit(0);
  }

  console.log(`🗂  Imágenes encontradas: ${images.length}`);
  if (args.dryRun) {
    for (const f of images) {
      const name = path.basename(f);
      const outFile = path.join(args.outputDir, name);
      const state = fs.existsSync(outFile) ? "existente (se omitirá)" : "pendiente";
      console.log(`  • ${name} → ${state}`);
    }
    console.log(`\n✅ Dry run completo (${images.length} imágenes).`);
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const accessToken = process.env.GEMINI_ACCESS_TOKEN;
  if (!apiKey && !accessToken) {
    console.error(
      "❌ Falta GEMINI_API_KEY (o GEMINI_ACCESS_TOKEN). Crea un archivo .env.gemini (junto al proyecto) con:\n   GEMINI_API_KEY=TU_CLAVE\nO configúralo como variable de entorno.",
    );
    process.exit(1);
  }
  const ctx = {
    args,
    apiKey,
    token: accessToken,
    ai: apiKey ? new GoogleGenAI({ apiKey }) : null,
  };

  const started = Date.now();

  const results = await mapWithConcurrency(images, args.concurrency, async (file) => {
    const entry = await processOne(ctx, file);
    appendLog(args.logFile, {
      file: entry.file,
      status: entry.status,
      skipped: entry.skipped,
      source: entry.source,
    });
    return entry;
  });

  const successful = results.filter((r) => r.ok).map((r) => r.value);
  const failed = results.filter((r) => !r.ok);

  const count = (s) => successful.filter((e) => e.status === s).length;

  const totalSec = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `\n✅ Terminado en ${totalSec}s — retocadas: ${count("done")}, omitidas (sin nombre legible): ${count("skipped")}, ya existentes: ${count("exists")}`,
  );

  failed.forEach((f, i) => {
    const msg = f.error?.message ?? String(f.error);
    console.log(`   ❌ ${path.basename(images[i])}: ${msg}`);
    appendLog(args.logFile, {
      file: path.basename(images[i]),
      status: "error",
      error: msg,
    });
  });
  console.log(`📄 Detalle en: ${args.logFile}`);
}

main().catch((err) => {
  console.error("Error fatal:", err);
  process.exit(1);
});
