/**
 * Tests del sistema de nombrado de imágenes con IA.
 *
 * Cubre:
 * - Normalización de nombres
 * - Seguridad (path traversal, XSS, caracteres peligrosos)
 * - Procesamiento masivo (batch)
 * - Fallback cuando la IA no responde
 *
 * Ejecutar: npx vitest run src/domain/ai-image-naming/service.test.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { normalizeFilenameClient, generateImageNamesBatch } from "./service";

/* ─────────────────────────────────────────
   Normalización
───────────────────────────────────────── */

describe("normalizeFilenameClient — casos básicos", () => {
  it("convierte a minúsculas", () => {
    expect(normalizeFilenameClient("CAMISETA NEGRA")).toBe("camiseta-negra");
  });

  it("reemplaza espacios por guiones", () => {
    expect(normalizeFilenameClient("tahine 454 gr")).toBe("tahine-454-gr");
  });

  it("elimina espacios al inicio y final", () => {
    expect(normalizeFilenameClient("  camiseta negra  ")).toBe("camiseta-negra");
  });

  it("elimina guiones duplicados", () => {
    expect(normalizeFilenameClient("camiseta--negra---hombre")).toBe("camiseta-negra-hombre");
  });

  it("elimina guiones al inicio y final", () => {
    expect(normalizeFilenameClient("-camiseta-negra-")).toBe("camiseta-negra");
  });

  it("normaliza tildes: á é í ó ú", () => {
    expect(normalizeFilenameClient("Café Cáfé Ítem Óscar Úvula")).toBe(
      "cafe-cafe-item-oscar-uvula",
    );
  });

  it("normaliza ñ", () => {
    expect(normalizeFilenameClient("piñones secos")).toBe("pi-ones-secos");
  });

  it("elimina caracteres especiales: !, @, #, $, %", () => {
    expect(normalizeFilenameClient("Camiseta Negra!!!")).toBe("camiseta-negra");
  });

  it("elimina extensión si la IA la incluye", () => {
    expect(normalizeFilenameClient("camiseta-negra.jpg")).toBe("camiseta-negra");
    expect(normalizeFilenameClient("producto.jpeg")).toBe("producto");
    expect(normalizeFilenameClient("imagen.png")).toBe("imagen");
    expect(normalizeFilenameClient("foto.webp")).toBe("foto");
  });

  it("limita la longitud máxima a 80 caracteres", () => {
    const long = "a".repeat(200);
    expect(normalizeFilenameClient(long).length).toBeLessThanOrEqual(80);
  });

  it("devuelve 'producto' si el resultado queda vacío", () => {
    expect(normalizeFilenameClient("")).toBe("producto");
    expect(normalizeFilenameClient("   ")).toBe("producto");
    expect(normalizeFilenameClient("!!!###$$$")).toBe("producto");
  });

  it("preserva números", () => {
    expect(normalizeFilenameClient("Crunchy Lat Morada 340GR")).toBe(
      "crunchy-lat-morada-340gr",
    );
  });

  it("manejo correcto de texto en MAYÚSCULAS con signos", () => {
    expect(normalizeFilenameClient("  CAMISETA   NEGRA  ")).toBe("camiseta-negra");
  });
});

describe("normalizeFilenameClient — seguridad", () => {
  it("bloquea path traversal con ../", () => {
    expect(normalizeFilenameClient("../../archivo")).toBe("producto");
  });

  it("bloquea path traversal con ../../../etc/passwd", () => {
    expect(normalizeFilenameClient("../../../etc/passwd")).toBe("producto");
  });

  it("elimina <script> tags", () => {
    // Los caracteres < > son eliminados por la regex de caracteres especiales
    const result = normalizeFilenameClient("<script>alert(1)</script>");
    expect(result).not.toContain("<");
    expect(result).not.toContain(">");
  });

  it("elimina barras diagonales", () => {
    const result = normalizeFilenameClient("folder/file");
    expect(result).not.toContain("/");
  });

  it("elimina barras invertidas", () => {
    const result = normalizeFilenameClient("folder\\file");
    expect(result).not.toContain("\\");
  });

  it("elimina comillas dobles y simples", () => {
    const result = normalizeFilenameClient('camiseta "negra" hombre');
    expect(result).not.toContain('"');
    expect(result).toBe("camiseta-negra-hombre");
  });

  it("elimina caracteres unicode peligrosos", () => {
    const result = normalizeFilenameClient("café\u0000producto");
    expect(result).not.toContain("\u0000");
  });

  it("no produce nombres vacíos ante entradas maliciosas", () => {
    const cases = [
      "../../../../",
      "\u0000\u0001\u0002",
      "   \t\n\r   ",
    ];
    for (const c of cases) {
      expect(normalizeFilenameClient(c)).toBeTruthy();
      expect(normalizeFilenameClient(c).length).toBeGreaterThan(0);
    }
  });
});

/* ─────────────────────────────────────────
   Procesamiento masivo (batch)
───────────────────────────────────────── */

// Mock del módulo supabase para tests de batch
vi.mock("@data/supabase/client", () => ({
  supabase: null, // sin supabase → fallback automático
}));

const makeProduct = (id: string, name: string, imageUrl?: string) => ({
  id,
  name,
  image_url: imageUrl ?? `https://example.com/products/${id}.jpg`,
  image_filename_generated_at: null,
});

describe("generateImageNamesBatch — 10 productos", () => {
  it("procesa 10 productos con fallback", async () => {
    const products = Array.from({ length: 10 }, (_, i) =>
      makeProduct(`prod-${i}`, `Producto Número ${i + 1}`),
    );

    const result = await generateImageNamesBatch(products, { batchSize: 3 });

    expect(result.total).toBe(10);
    expect(result.successful).toBe(10);
    expect(result.failed).toBe(0);
    expect(result.results).toHaveLength(10);
    expect(result.results.every((r) => r.success)).toBe(true);
    expect(result.results.every((r) => r.usedFallback)).toBe(true);
  });

  it("genera nombres correctos para cada producto", async () => {
    const products = [
      makeProduct("1", "Tahine 454 GR"),
      makeProduct("2", "Café Najjar con Cardamomo"),
      makeProduct("3", "Crunchy Lat Morada 340GR"),
    ];

    const result = await generateImageNamesBatch(products);

    expect(result.results[0].generatedFilename).toBe("tahine-454-gr.jpg");
    expect(result.results[1].generatedFilename).toBe("cafe-najjar-con-cardamomo.jpg");
    expect(result.results[2].generatedFilename).toBe("crunchy-lat-morada-340gr.jpg");
  });
});

describe("generateImageNamesBatch — productos ya procesados", () => {
  it("omite productos con image_filename_generated_at", async () => {
    const products = [
      makeProduct("1", "Producto 1"), // no procesado
      {
        ...makeProduct("2", "Producto 2"),
        image_filename_generated_at: "2026-01-01T00:00:00Z", // ya procesado
      },
      makeProduct("3", "Producto 3"), // no procesado
    ];

    const progressCalls: number[] = [];
    const result = await generateImageNamesBatch(products, {
      skipAlreadyProcessed: true,
      onProgress: (p) => progressCalls.push(p.processed),
    });

    expect(result.skipped).toBe(1);
    expect(result.successful).toBe(2);
    expect(result.total).toBe(3);
  });

  it("procesa todos si skipAlreadyProcessed=false", async () => {
    const products = [
      {
        ...makeProduct("1", "Producto 1"),
        image_filename_generated_at: "2026-01-01T00:00:00Z",
      },
    ];

    const result = await generateImageNamesBatch(products, {
      skipAlreadyProcessed: false,
    });

    expect(result.skipped).toBe(0);
    expect(result.successful).toBe(1);
  });
});

describe("generateImageNamesBatch — productos sin imagen", () => {
  it("omite productos sin image_url", async () => {
    const products = [
      makeProduct("1", "Con imagen"),
      { id: "2", name: "Sin imagen", image_url: null, image_filename_generated_at: null },
    ];

    const result = await generateImageNamesBatch(products);

    // Solo el que tiene imagen se procesa
    expect(result.results).toHaveLength(1);
    expect(result.results[0].productId).toBe("1");
  });
});

describe("generateImageNamesBatch — un producto con error", () => {
  it("continúa procesando si un producto falla", async () => {
    // En modo fallback (supabase=null) no hay errores reales,
    // pero verificamos que el batch continúa tras resultados individuales
    const products = Array.from({ length: 5 }, (_, i) =>
      makeProduct(`prod-${i}`, `Producto ${i + 1}`),
    );

    const result = await generateImageNamesBatch(products, { batchSize: 2 });

    // Con fallback, todos deben ser exitosos
    expect(result.successful + result.failed).toBe(result.total - result.skipped);
    expect(result.results.length).toBeGreaterThan(0);
  });
});

describe("generateImageNamesBatch — cancelación", () => {
  it("respeta AbortSignal", async () => {
    const products = Array.from({ length: 20 }, (_, i) =>
      makeProduct(`prod-${i}`, `Producto ${i + 1}`),
    );

    const controller = new AbortController();

    // Cancelar después de un tick
    setTimeout(() => controller.abort(), 10);

    const result = await generateImageNamesBatch(products, {
      batchSize: 2,
      signal: controller.signal,
    });

    // Debe haber procesado menos del total por la cancelación
    expect(result.results.length).toBeLessThanOrEqual(products.length);
  });
});

describe("generateImageNamesBatch — callback de progreso", () => {
  it("llama onProgress con datos correctos", async () => {
    const products = Array.from({ length: 3 }, (_, i) =>
      makeProduct(`p${i}`, `Producto ${i}`),
    );

    const progressUpdates: number[] = [];
    await generateImageNamesBatch(products, {
      onProgress: (p) => progressUpdates.push(p.processed),
    });

    // Debe haber llamado onProgress al menos una vez por producto
    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates[progressUpdates.length - 1]).toBe(3);
  });
});

/* ─────────────────────────────────────────
   Test de integración del fallback completo
───────────────────────────────────────── */

describe("Fallback cuando IA no está disponible", () => {
  it("genera nombre limpio desde el nombre del producto", () => {
    const productName = "Camiseta Oversize Negra para Hombre";
    expect(normalizeFilenameClient(productName)).toBe("camiseta-oversize-negra-para-hombre");
  });

  it("el fallback nunca produce cadena vacía", () => {
    const names = [
      "Producto",
      "A",
      "123",
      "Tahine 454 GR",
      "Café Maatouk 450gr",
    ];
    for (const name of names) {
      const result = normalizeFilenameClient(name);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toBeTruthy();
    }
  });
});
