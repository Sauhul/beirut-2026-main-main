import { supabase } from "./src/data/supabase/client.ts";

async function checkConnection() {
  if (!supabase) {
    console.error("No se pudo inicializar Supabase. Verifica tu .env");
    return;
  }

  console.log("Probando conexión a Supabase...");
  
  const { data, error } = await supabase.from("products").select("count", { count: 'exact', head: true });

  if (error) {
    console.error("❌ Error de conexión:", error.message);
  } else {
    console.log("✅ Conexión exitosa. Productos en la base de datos:", data);
  }
}

checkConnection();
