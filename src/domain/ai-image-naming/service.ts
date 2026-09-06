/**
 * Servicio cliente para el sistema de nombrado de imágenes con IA.
 *
 * Llama a la Supabase Edge Function `generate-image-name` que mantiene
 * la API key de OpenAI segura en el servidor.
 *
 * Incluye:
 * - Procesamiento individual
 * - Procesamiento masivo por lotes con control de concurrencia
 * - Fallback de normalización en cliente (si la Edge Function no está disponible)
 */

import { supabase } from "@data/supabase/client";

/* ─────────────────────────────────────────
   Tipos
───────────────────────────────────────── */

export interface GenerateNameResult {
  success: boolean;
  productId: string;
  originalImageUrl: string;
  generatedFilename: string;
  usedFallback: boolean;
  alreadyProcessed?: boolean;
  error?: string;
}

export interface BatchProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  currentProduct?: string;
}

export interface BatchResult {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  results: GenerateNameResult[];
}

export interface ProductForNaming {
  id: string;
  name: string;
  image_url: string | null;
  image_filename_generated_at?: string | null;
}

/* ─────────────────────────────────────────
   Normalización fallback (cliente)
   Usada cuando la Edge Function no está disponible
───────────────────────────────────────── */

const MAX_FILENAME_LENGTH = 80;

export function normalizeFilenameClient(raw: string): string {
  if (!raw || typeof raw !== "string") return "producto";

  const name = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ñ/g, "n")
    .replace(/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_FILENAME_LENGTH);

  if (!name || name.includes("..") || name.includes("/")) return "producto";
  return name;
}

/* ─────────────────────────────────────────
   Procesamiento individual
───────────────────────────────────────── */

/**
 * Genera el nombre de archivo para un producto usando IA.
 * Si la Edge Function no está disponible, usa el fallback de normalización.
 */
export async function generateImageName(
  product: ProductForNaming,
): Promise<GenerateNameResult> {
  if (!supabase || !product.image_url) {
    // Fallback local: normalizar nombre del producto
    const filename = normalizeFilenameClient(product.name) + ".jpg";
    return {
      success: true,
      productId: product.id,
      originalImageUrl: product.image_url ?? "",
      generatedFilename: filename,
      usedFallback: true,
    };
  }

  try {
    // Obtener token de sesión del admin
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("No authenticated session");

    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
    const functionUrl = `${supabaseUrl}/functions/v1/generate-image-name`;

    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
        "apikey": session.access_token,
      },
      body: JSON.stringify({
        productId: product.id,
        productName: product.name,
        imageUrl: product.image_url,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(err.error ?? `HTTP ${response.status}`);
    }

    return await response.json() as GenerateNameResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[AI Naming] Error for product ${product.id}:`, message);

    // Fallback: normalizar nombre del producto
    const filename = normalizeFilenameClient(product.name) + ".jpg";
    return {
      success: true,
      productId: product.id,
      originalImageUrl: product.image_url ?? "",
      generatedFilename: filename,
      usedFallback: true,
      error: message,
    };
  }
}

/* ─────────────────────────────────────────
   Procesamiento masivo por lotes
───────────────────────────────────────── */

const DEFAULT_BATCH_SIZE = 5;
const BATCH_DELAY_MS = 500; // pausa entre lotes para no saturar

/**
 * Procesa múltiples productos en lotes con control de concurrencia.
 * @param products Lista de productos a procesar
 * @param options.batchSize Tamaño del lote (default: 5)
 * @param options.onProgress Callback de progreso
 * @param options.skipAlreadyProcessed Omitir los que ya tienen timestamp (default: true)
 */
export async function generateImageNamesBatch(
  products: ProductForNaming[],
  options: {
    batchSize?: number;
    onProgress?: (progress: BatchProgress) => void;
    skipAlreadyProcessed?: boolean;
    signal?: AbortSignal;
  } = {},
): Promise<BatchResult> {
  const {
    batchSize = DEFAULT_BATCH_SIZE,
    onProgress,
    skipAlreadyProcessed = true,
    signal,
  } = options;

  const toProcess = skipAlreadyProcessed
    ? products.filter((p) => !p.image_filename_generated_at && p.image_url)
    : products.filter((p) => p.image_url);

  const skipped = products.length - toProcess.length;
  const total = toProcess.length;

  const progress: BatchProgress = {
    total,
    processed: 0,
    successful: 0,
    failed: 0,
    skipped,
  };

  const allResults: GenerateNameResult[] = [];

  // Dividir en lotes
  for (let i = 0; i < toProcess.length; i += batchSize) {
    if (signal?.aborted) break;

    const batch = toProcess.slice(i, i + batchSize);

    // Procesar lote en paralelo (controlado)
    const batchResults = await Promise.all(
      batch.map(async (product) => {
        if (signal?.aborted) {
          return {
            success: false,
            productId: product.id,
            originalImageUrl: product.image_url ?? "",
            generatedFilename: "",
            usedFallback: false,
            error: "Aborted",
          };
        }

        progress.currentProduct = product.name;
        const result = await generateImageName(product);

        progress.processed++;
        if (result.success) {
          progress.successful++;
        } else {
          progress.failed++;
        }

        onProgress?.({ ...progress });
        return result;
      }),
    );

    allResults.push(...batchResults);

    // Pausa entre lotes (excepto en el último)
    if (i + batchSize < toProcess.length && !signal?.aborted) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
    }
  }

  return {
    total: products.length,
    successful: progress.successful,
    failed: progress.failed,
    skipped,
    results: allResults,
  };
}
