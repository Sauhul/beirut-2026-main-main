import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://unjojlgwgbcxyxqqkjbe.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam9qbGd3Z2JjeHl4cXFramJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2MTA1MiwiZXhwIjoyMTAzMTM3MDUyfQ.bItD8RtFhEYDyVPmritnlV5SU42ahq7q0iLt-NQ9Irg";
const BUCKET = "productos";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function fixImageUrls() {
  console.log("Obteniendo archivos del bucket...");
  const { data: files } = await supabase.storage.from(BUCKET).list();
  const fileNames = files.map(f => f.name);

  console.log("Obteniendo productos...");
  const { data: products } = await supabase.from("products").select("id, slug");

  for (const p of products) {
    // Intentar encontrar un archivo en el bucket que coincida con el slug
    // Nuestros archivos en bucket tienen "-jpg.jpg" al final a menudo
    const matchingFile = fileNames.find(f => 
        f.replace(/-jpg.jpg$/, "").replace(/-jpg$/, "") === p.slug
    );

    if (matchingFile) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${matchingFile}`;
        await supabase.from("products").update({ image_url: publicUrl }).eq("id", p.id);
        console.log(`Actualizado ${p.slug}: ${matchingFile}`);
    } else {
        console.log(`No encontrado archivo para ${p.slug}`);
    }
  }
}

fixImageUrls();
