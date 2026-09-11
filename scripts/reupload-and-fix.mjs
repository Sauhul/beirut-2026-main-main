import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const SUPABASE_URL = "https://unjojlgwgbcxyxqqkjbe.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam9qbGd3Z2JjeHl4cXFramJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2MTA1MiwiZXhwIjoyMTAzMTM3MDUyfQ.bItD8RtFhEYDyVPmritnlV5SU42ahq7q0iLt-NQ9Irg";
const BUCKET = "productos";
const IMAGES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/products');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function getSlugFromName(name) {
    // We need a mapping from the physical file name to the slug.
    // The previous script that generated `products` used:
    // slug = cleanFilename(file);
    // where cleanFilename(file) removed the extension.
    return name
        .toLowerCase()
        .replace(/\.[^/.]+$/, "") 
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

async function reuploadAndFix() {
  console.log("Limpiando bucket...");
  const { data: files } = await supabase.storage.from(BUCKET).list();
  if (files && files.length > 0) {
      await supabase.storage.from(BUCKET).remove(files.map(f => f.name));
  }

  console.log("Subiendo archivos con nombres limpios (slug.jpg)...");
  const localFiles = fs.readdirSync(IMAGES_DIR);
  
  for (const file of localFiles) {
      if (!file.toLowerCase().endsWith('.jpg') && !file.toLowerCase().endsWith('.jpeg')) continue;
      
      const slug = getSlugFromName(file);
      const targetName = `${slug}.jpg`;
      console.log(`Subiendo: ${file} -> ${targetName}`);
      
      const fileData = fs.readFileSync(path.join(IMAGES_DIR, file));
      
      await supabase.storage.from(BUCKET).upload(targetName, fileData, {
          contentType: 'image/jpeg',
          upsert: true
      });
  }
  
  console.log("Bucket actualizado. Sincronizando BD...");
  const { data: products } = await supabase.from("products").select("id, slug");
  for (const p of products) {
      const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${p.slug}.jpg`;
      await supabase.from("products").update({ image_url: publicUrl }).eq("id", p.id);
  }
  console.log("Sincronización finalizada.");
}

reuploadAndFix();
