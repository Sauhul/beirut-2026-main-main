/**
 * Panel de nombrado de imágenes con IA.
 * Se integra en la pestaña "productos" del AdminPage.
 *
 * Funcionalidades:
 * - Botón individual por producto: [✨ IA]
 * - Selección múltiple + procesamiento masivo
 * - Barra de progreso en tiempo real
 * - Vista previa antes de confirmar (modo preview)
 * - Resumen final con estadísticas
 */

import { useCallback, useRef, useState } from "react";
import { Bot, CheckCircle2, ChevronDown, ChevronUp, Loader2, Sparkles, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  generateImageName,
  generateImageNamesBatch,
  type BatchProgress,
  type BatchResult,
  type GenerateNameResult,
  type ProductForNaming,
} from "@domain/ai-image-naming/service";
import type { ProductRow } from "./admin.types";

/* ─────────────────────────────────────────
   Tipos
───────────────────────────────────────── */

interface PreviewItem {
  product: ProductForNaming;
  result: GenerateNameResult;
}

type PanelState = "idle" | "processing" | "preview" | "done";

/* ─────────────────────────────────────────
   Botón individual por producto
───────────────────────────────────────── */

export function AiNameButton({
  product,
  onDone,
}: {
  product: ProductRow;
  onDone?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (!product.image_url) {
      toast.error("Este producto no tiene imagen aún.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateImageName(product as ProductForNaming);
      if (result.alreadyProcessed) {
        toast.info(`Ya procesado: ${result.generatedFilename}`);
      } else if (result.success) {
        toast.success(
          result.usedFallback
            ? `Nombre generado (fallback): ${result.generatedFilename}`
            : `✨ Nombre generado: ${result.generatedFilename}`,
        );
        onDone?.();
      } else {
        toast.error(`Error: ${result.error ?? "desconocido"}`);
      }
    } catch (err) {
      toast.error("No se pudo generar el nombre.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || !product.image_url}
      title={
        !product.image_url
          ? "Sin imagen"
          : "Generar nombre con IA"
      }
      className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Sparkles className="h-3 w-3" />
      )}
      IA
    </button>
  );
}

/* ─────────────────────────────────────────
   Panel masivo
───────────────────────────────────────── */

export function AiImageNamingPanel({
  products,
  onDone,
}: {
  products: ProductRow[];
  onDone?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState<PanelState>("idle");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<BatchProgress | null>(null);
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const productsWithImage = products.filter((p) => p.image_url);
  const unprocessed = productsWithImage.filter((p) => !(p as ProductForNaming & { image_filename_generated_at?: string | null }).image_filename_generated_at);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(unprocessed.map((p) => p.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const selectedProducts: ProductForNaming[] = products
    .filter((p) => selectedIds.has(p.id))
    .map((p) => p as ProductForNaming);

  /* ── Iniciar procesamiento masivo ── */
  const handleBatch = useCallback(async () => {
    if (selectedProducts.length === 0) {
      toast.error("Selecciona al menos un producto.");
      return;
    }

    abortRef.current = new AbortController();
    setState("processing");
    setProgress({
      total: selectedProducts.length,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
    });

    const result = await generateImageNamesBatch(selectedProducts, {
      batchSize: 5,
      skipAlreadyProcessed: true,
      signal: abortRef.current.signal,
      onProgress: (p) => setProgress({ ...p }),
    });

    setBatchResult(result);
    setState("done");
    onDone?.();
  }, [selectedProducts, onDone]);

  /* ── Cancelar ── */
  const handleAbort = () => {
    abortRef.current?.abort();
    setState("idle");
    setProgress(null);
  };

  /* ── Reset ── */
  const handleReset = () => {
    setState("idle");
    setProgress(null);
    setBatchResult(null);
    setPreview([]);
    clearSelection();
  };

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
      >
        <Bot className="h-4 w-4" />
        Nombrado de imágenes con IA
        <ChevronDown className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-amber-600" />
          <h3 className="text-base font-semibold text-amber-900">
            Nombrado de imágenes con IA
          </h3>
          <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[11px] font-bold text-amber-800">
            {unprocessed.length} sin procesar / {productsWithImage.length} con imagen
          </span>
        </div>
        <button
          onClick={() => setExpanded(false)}
          className="text-amber-500 hover:text-amber-800"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-1 text-xs text-amber-700">
        Genera nombres de archivo limpios y descriptivos para las imágenes de tus productos usando IA.
        Los nombres ya procesados no se vuelven a enviar a la IA.
      </p>

      {/* Estado: idle */}
      {state === "idle" && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <button
              onClick={selectAll}
              className="rounded-full border border-amber-300 px-4 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100"
            >
              Seleccionar todos sin procesar ({unprocessed.length})
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={clearSelection}
                className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Limpiar selección
              </button>
            )}
            {selectedIds.size > 0 && (
              <span className="ml-auto text-xs font-semibold text-amber-700">
                {selectedIds.size} seleccionados
              </span>
            )}
          </div>

          {/* Lista de productos seleccionables */}
          {productsWithImage.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-xl border border-amber-200 bg-white">
              {productsWithImage.map((p) => {
                const processed = !!(p as ProductForNaming & { image_filename_generated_at?: string | null }).image_filename_generated_at;
                return (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-3 border-b border-amber-100 px-4 py-2.5 text-sm last:border-0 hover:bg-amber-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(p.id)}
                      onChange={() => toggleSelect(p.id)}
                      disabled={processed}
                      className="h-4 w-4 accent-amber-600"
                    />
                    <span className={`flex-1 font-medium ${processed ? "text-muted-foreground line-through" : ""}`}>
                      {p.name}
                    </span>
                    {processed && (
                      <span className="text-[10px] font-semibold text-green-600">✓ ya procesado</span>
                    )}
                  </label>
                );
              })}
            </div>
          )}

          <button
            onClick={handleBatch}
            disabled={selectedIds.size === 0}
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" />
            Generar nombres con IA ({selectedIds.size})
          </button>
        </div>
      )}

      {/* Estado: procesando */}
      {state === "processing" && progress && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-amber-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              Procesando…
              {progress.currentProduct && (
                <span className="max-w-[200px] truncate text-xs text-amber-600">
                  {progress.currentProduct}
                </span>
              )}
            </span>
            <span className="font-bold text-amber-900">
              {progress.processed} / {progress.total}
            </span>
          </div>

          {/* Barra de progreso */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-amber-200">
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-300"
              style={{
                width: `${progress.total > 0 ? (progress.processed / progress.total) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="flex gap-4 text-xs text-amber-700">
            <span>✅ {progress.successful} exitosos</span>
            <span>❌ {progress.failed} errores</span>
            <span>⏭ {progress.skipped} omitidos</span>
          </div>

          <button
            onClick={handleAbort}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:border-destructive hover:text-destructive"
          >
            <X className="h-3 w-3" /> Cancelar
          </button>
        </div>
      )}

      {/* Estado: resultados */}
      {state === "done" && batchResult && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap gap-4 rounded-xl border border-amber-200 bg-white p-4 text-sm">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              <strong>{batchResult.successful}</strong> exitosos
            </div>
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="h-4 w-4" />
              <strong>{batchResult.failed}</strong> con error
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <strong>{batchResult.skipped}</strong> omitidos
            </div>
            <div className="flex items-center gap-2 font-semibold text-amber-800">
              <strong>{batchResult.total}</strong> total
            </div>
          </div>

          {/* Detalle de errores si los hay */}
          {batchResult.results.filter((r) => !r.success).length > 0 && (
            <details className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              <summary className="cursor-pointer font-semibold">
                Ver errores ({batchResult.results.filter((r) => !r.success).length})
              </summary>
              <ul className="mt-2 space-y-1">
                {batchResult.results
                  .filter((r) => !r.success)
                  .map((r) => (
                    <li key={r.productId}>
                      <strong>{r.productId}</strong>: {r.error}
                    </li>
                  ))}
              </ul>
            </details>
          )}

          <button
            onClick={handleReset}
            className="rounded-full border border-amber-300 px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-100"
          >
            Volver
          </button>
        </div>
      )}
    </div>
  );
}
