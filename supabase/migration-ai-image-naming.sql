-- ============================================================
-- MIGRACIÓN: Sistema de nombrado de imágenes con IA
-- Fecha: 2026-09-02
--
-- Agrega columna de tracking para saber cuándo fue procesada
-- la imagen de un producto por la IA, evitando reprocesamiento.
--
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Es idempotente: se puede ejecutar varias veces sin problema.
-- ============================================================

-- Agregar columna de tracking (nullable, no rompe datos existentes)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS image_filename_generated_at timestamptz DEFAULT NULL;

-- Índice para consultas de "productos no procesados"
CREATE INDEX IF NOT EXISTS idx_products_ai_processed
  ON public.products (image_filename_generated_at)
  WHERE image_filename_generated_at IS NULL;

-- Comentario documental
COMMENT ON COLUMN public.products.image_filename_generated_at IS
  'Timestamp de cuando la IA generó el nombre del archivo de imagen. NULL = no procesado.';
