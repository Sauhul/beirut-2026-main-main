import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://unjojlgwgbcxyxqqkjbe.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam9qbGd3Z2JjeHl4cXFramJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2MTA1MiwiZXhwIjoyMTAzMTM3MDUyfQ.bItD8RtFhEYDyVPmritnlV5SU42ahq7q0iLt-NQ9Irg";
const BUCKET = "productos";

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function slugify(text) {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function fixImageUrls() {
  const { data: files } = await supabase.storage.from(BUCKET).list();
  const fileNames = files.map(f => f.name);

  const { data: products } = await supabase.from("products").select("id, slug");

  for (const p of products) {
    // Find the file that most closely matches the slug.
    // Files are like: "aceite-oliva-3litros-jpg.jpg" or "molde-maamoul-pequeno-jpg.jpg"
    // Slug is: "aceite-oliva-3litros"
    
    // Simplest strategy: find a file that starts with the slug (normalized)
    const matchingFile = fileNames.find(f => {
        const fSlug = f.replace(/-jpg.jpg$/, "").replace(/-jpg.jpg$/, "").replace(/-jpg.jpg$/, ""); // Handle multiple -jpg
        // Actually just check if it contains the slug part
        return f.includes(p.slug.replace(/-/g, ''));
    });

    if (matchingFile) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${matchingFile}`;
        await supabase.from("products").update({ image_url: publicUrl }).eq("id", p.id);
        console.log(`Actualizado ${p.slug} -> ${matchingFile}`);
    } else {
        console.log(`No encontrado archivo para ${p.slug}`);
    }
  }
}

fixImageUrls();
