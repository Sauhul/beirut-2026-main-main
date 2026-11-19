import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL;
const key = process.env.REACT_APP_SUPABASE_ANON_KEY;

function isPublicKey(value) {
  if (value.startsWith("sb_publishable_")) return true;

  try {
    const payload = Buffer.from(value.split(".")[1], "base64url").toString();
    return JSON.parse(payload).role === "anon";
  } catch {
    return false;
  }
}

async function checkCatalog() {
  if (!url || !key) throw new Error("Configura la URL y la clave pública en .env.");
  if (!isPublicKey(key)) throw new Error("Usa una clave publishable o anon.");

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const tables = ["categories", "products"];
  const readings = await Promise.all(
    tables.map((table) =>
      client.from(table).select("id", { head: true, count: "exact" })
        .abortSignal(AbortSignal.timeout(10000)),
    ),
  );

  readings.forEach(({ error, count }, index) => {
    const table = tables[index];
    if (error || count === null) {
      console.error(`${table}: lectura fallida (${error?.code || "sin conteo"}).`);
      process.exitCode = 1;
    } else {
      console.log(`${table}: ${count} filas visibles con la clave pública.`);
    }
  });
}

try {
  await checkCatalog();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
