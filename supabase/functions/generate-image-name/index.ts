/**
 * Supabase Edge Function: generate-image-name
 *
 * Recibe { productId, productName, imageUrl } y devuelve un nombre de
 * archivo limpio generado por IA (OpenAI GPT-4o Vision) o por fallback
 * si la IA no está disponible.
 *
 * Variables de entorno (Supabase → Edge Functions → Secrets):
 *   AI_API_KEY   — OpenAI API key (obligatoria para IA real)
 *   AI_API_URL   — base URL  (default: https://api.openai.com/v1)
 *   AI_MODEL     — modelo    (default: gpt-4o)
 *   SUPABASE_URL              — inyectada automáticamente por Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — inyectada automáticamente por Supabase
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/* ─────────────────────────────────────────
   Tipos
───────────────────────────────────────── */

interface RequestBody {
  productId: string;
  productName: string;
  imageUrl: string;
}

interface GenerateResult {
  success: boolean;
  productId: string;
  originalImageUrl: string;
  generatedFilename: string;
  usedFallback: boolean;
  error?: string;
}

/* ─────────────────────────────────────────
   Normalización (backend – fuente de verdad)
───────────────────────────────────────── */

const MAX_FILENAME_LENGTH = 80;
const DANGEROUS_NAMES = new Set(["con", "prn", "aux", "nul", "com1", "lpt1", "passwd", "etc"]);

export function normalizeFilename(raw: string): string {
  if (!raw || typeof raw !== "string") return "producto";

  let name = raw
    .trim()
    .toLowerCase()
    // Normalizar Unicode (tildes → base + diacritic)
    .normalize("NFD")
    // Eliminar diacríticos
    .replace(/[\u0300-\u036f]/g, "")
    // ñ → n  (queda después de NFD no separa ñ totalmente en algunos casos)
    .replace(/ñ/g, "n")
    // Eliminar extensión si el modelo la incluyó
    .replace(/\.(jpg|jpeg|png|webp|gif|bmp|svg)$/i, "")
    // Solo alfanuméricos y guiones
    .replace(/[^a-z0-9]+/g, "-")
    // Guiones duplicados
    .replace(/-{2,}/g, "-")
    // Guiones al principio/final
    .replace(/^-+|-+$/g, "")
    // Longitud máxima
    .slice(0, MAX_FILENAME_LENGTH);

  // Evitar nombres vacíos
  if (!name) return "producto";

  // Evitar path traversal
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    return "producto";
  }

  // Evitar nombres potencialmente peligrosos
  if (DANGEROUS_NAMES.has(name)) return "producto";

  return name;
}

/* ─────────────────────────────────────────
   Fallback: derivar nombre del título del producto
───────────────────────────────────────── */

function fallbackFilename(productName: string): string {
  return normalizeFilename(productName) || "producto";
}

/* ─────────────────────────────────────────
   Llamada a la API de IA con reintentos + backoff
───────────────────────────────────────── */

const AI_API_URL = Deno.env.get("AI_API_URL") ?? "https://api.openai.com/v1";
const AI_MODEL   = Deno.env.get("AI_MODEL")   ?? "gpt-4o";
const AI_TIMEOUT_MS = 20_000;

const SYSTEM_PROMPT = `You are a file naming assistant for an e-commerce product catalog.
Given a product name and its image, generate a clean, SEO-friendly filename (WITHOUT extension).

Rules (STRICT):
- Base the name primarily on the PRODUCT NAME provided, not on image interpretation
- Use the image only as context/validation
- Output ONLY the filename, nothing else — no explanations, no quotes, no extension
- Use lowercase letters only
- Use hyphens (-) to separate words
- No spaces, no special characters, no accents, no emojis
- No leading or trailing hyphens
- Maximum 60 characters
- Be concise but descriptive
- Preserve important product attributes (size, color, flavor, brand if in the name)
- Remove filler words like "para", "de", "del", "la", "el", "y" only when they don't add meaning
- Do NOT invent attributes not present in the product name

Examples:
  Product: "Café Najjar con Cardamomo" → cafe-najjar-cardamomo
  Product: "Crunchy Lat Morada 340GR" → crunchy-lat-morada-340gr
  Product: "Tahine 454 GR" → tahine-454gr`;

async function callAIWithRetry(
  productName: string,
  imageUrl: string,
  maxRetries = 3,
): Promise<{ filename: string; usedFallback: boolean }> {
  const apiKey = Deno.env.get("AI_API_KEY");

  if (!apiKey) {
    console.warn("[AI] AI_API_KEY not set — using fallback");
    return { filename: fallbackFilename(productName), usedFallback: true };
  }

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);

      const response = await fetch(`${AI_API_URL}/chat/completions`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: AI_MODEL,
          max_tokens: 60,
          temperature: 0,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Product name: "${productName}"`,
                },
                {
                  type: "image_url",
                  image_url: { url: imageUrl, detail: "low" },
                },
              ],
            },
          ],
        }),
      });

      clearTimeout(timer);

      // Errores no recuperables — no reintentar
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        const body = await response.json().catch(() => ({}));
        throw new Error(`AI API permanent error ${response.status}: ${JSON.stringify(body)}`);
      }

      // Rate limit o error temporal — reintentar con backoff
      if (response.status === 429 || response.status >= 500) {
        const waitMs = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.warn(`[AI] HTTP ${response.status}, retry ${attempt}/${maxRetries} in ${waitMs}ms`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      if (!response.ok) {
        throw new Error(`AI API unexpected status ${response.status}`);
      }

      const data = await response.json();
      const raw: string = data?.choices?.[0]?.message?.content ?? "";

      if (!raw.trim()) {
        console.warn("[AI] Empty response from AI, using fallback");
        return { filename: fallbackFilename(productName), usedFallback: true };
      }

      const filename = normalizeFilename(raw.trim());
      return { filename, usedFallback: false };

    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Timeout o error de red — reintentar con backoff
      if (lastError.name === "AbortError" || lastError.message.includes("network")) {
        const waitMs = Math.min(1000 * 2 ** (attempt - 1), 8000);
        console.warn(`[AI] Timeout/network, retry ${attempt}/${maxRetries} in ${waitMs}ms`);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      // Error permanente (401, 403, etc.) — no reintentar
      break;
    }
  }

  console.error("[AI] All retries exhausted, using fallback:", lastError?.message);
  return { filename: fallbackFilename(productName), usedFallback: true };
}

/* ─────────────────────────────────────────
   Deduplicación: generar nombre único
───────────────────────────────────────── */

async function uniqueFilename(
  supabaseClient: ReturnType<typeof createClient>,
  base: string,
  productId: string,
): Promise<string> {
  // Verificar si este producto ya tiene este nombre → no duplicar
  const { data: self } = await supabaseClient
    .from("products")
    .select("id, image_url")
    .eq("id", productId)
    .single();

  const currentFilename = self?.image_url?.split("/").pop()?.replace(/\.[^.]+$/, "") ?? null;
  if (currentFilename === base) return base; // ya tiene este nombre

  // Buscar conflictos con otros productos
  const { data: conflicts } = await supabaseClient
    .from("products")
    .select("image_url")
    .neq("id", productId)
    .not("image_url", "is", null);

  const existingNames = new Set(
    (conflicts ?? [])
      .map((p: { image_url: string | null }) =>
        p.image_url?.split("/").pop()?.replace(/\.[^.]+$/, "") ?? ""
      )
      .filter(Boolean),
  );

  if (!existingNames.has(base)) return base;

  // Agregar sufijo numérico
  for (let i = 2; i <= 999; i++) {
    const candidate = `${base}-${i}`;
    if (!existingNames.has(candidate)) return candidate;
  }

  return `${base}-${Date.now()}`;
}

/* ─────────────────────────────────────────
   Handler principal
───────────────────────────────────────── */

Deno.serve(async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405);
  }

  /* ── Autenticación: solo admins ─── */
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey     = req.headers.get("apikey") ?? authHeader.replace("Bearer ", "");

  // Verificar que el token pertenece a un admin
  const userClient = createClient(supabaseUrl, anonKey);
  const { data: { user }, error: authError } = await userClient.auth.getUser();

  if (authError || !user?.email) {
    return jsonResponse({ success: false, error: "Unauthorized" }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { data: adminCheck } = await adminClient
    .from("admin_emails")
    .select("email")
    .eq("email", user.email.toLowerCase())
    .maybeSingle();

  if (!adminCheck) {
    return jsonResponse({ success: false, error: "Forbidden: not an admin" }, 403);
  }

  /* ── Parsear body ─── */
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ success: false, error: "Invalid JSON body" }, 400);
  }

  const { productId, productName, imageUrl } = body;

  if (!productId || typeof productId !== "string") {
    return jsonResponse({ success: false, error: "productId is required" }, 400);
  }
  if (!productName || typeof productName !== "string" || productName.trim().length < 1) {
    return jsonResponse({ success: false, error: "productName is required" }, 400);
  }
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
    return jsonResponse({ success: false, error: "imageUrl must be a valid URL" }, 400);
  }

  /* ── Verificar si ya fue procesado (evitar llamadas innecesarias) ─── */
  const { data: product } = await adminClient
    .from("products")
    .select("id, name, image_url, image_filename_generated_at")
    .eq("id", productId)
    .single();

  if (!product) {
    return jsonResponse({ success: false, error: "Product not found" }, 404);
  }

  if (product.image_filename_generated_at) {
    const currentFilename = product.image_url?.split("/").pop() ?? "";
    return jsonResponse({
      success: true,
      productId,
      originalImageUrl: imageUrl,
      generatedFilename: currentFilename,
      usedFallback: false,
      alreadyProcessed: true,
    } as GenerateResult & { alreadyProcessed: boolean });
  }

  /* ── Llamar a la IA ─── */
  const { filename: baseFilename, usedFallback } = await callAIWithRetry(
    productName.trim(),
    imageUrl,
  );

  /* ── Deduplicar ─── */
  const uniqueName = await uniqueFilename(adminClient, baseFilename, productId);
  const generatedFilename = `${uniqueName}.jpg`;

  /* ── Renombrar archivo en Storage ─── */
  const currentPath = imageUrl.includes("/product-images/")
    ? imageUrl.split("/product-images/").pop() ?? ""
    : "";

  if (currentPath) {
    const newPath = `products/${uniqueName}.jpg`;

    if (currentPath !== newPath) {
      // Descargar imagen original
      const { data: fileData, error: downloadError } = await adminClient.storage
        .from("product-images")
        .download(currentPath);

      if (!downloadError && fileData) {
        // Subir con el nuevo nombre
        const { error: uploadError } = await adminClient.storage
          .from("product-images")
          .upload(newPath, fileData, { contentType: "image/jpeg", upsert: true });

        if (!uploadError) {
          // Eliminar el archivo anterior si era distinto
          await adminClient.storage.from("product-images").remove([currentPath]);
        }
      }
    }
  }

  /* ── Actualizar products en DB ─── */
  const newImageUrl = `${supabaseUrl}/storage/v1/object/public/product-images/products/${uniqueName}.jpg`;

  const { error: updateError } = await adminClient
    .from("products")
    .update({
      image_url: newImageUrl,
      image_filename_generated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (updateError) {
    console.error("[DB] Update error:", updateError.message);
    return jsonResponse(
      { success: false, error: `DB update failed: ${updateError.message}` },
      500,
    );
  }

  const result: GenerateResult = {
    success: true,
    productId,
    originalImageUrl: imageUrl,
    generatedFilename,
    usedFallback,
  };

  return jsonResponse(result);
});

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
