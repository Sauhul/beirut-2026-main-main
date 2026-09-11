import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const SUPABASE_URL = "https://unjojlgwgbcxyxqqkjbe.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam9qbGd3Z2JjeHl4cXFramJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2MTA1MiwiZXhwIjoyMTAzMTM3MDUyfQ.bItD8RtFhEYDyVPmritnlV5SU42ahq7q0iLt-NQ9Irg";
const BUCKET = "productos";
const IMAGES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/products');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function cleanFilename(name) {
    return name
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]/g, '-') // replace non-alphanumeric with -
        .replace(/-+/g, '-') // collapse hyphens
        .replace(/^-|-$/g, '') // remove leading/trailing hyphens
        + '.jpg';
}

async function uploadFiles() {
  console.log(`Iniciando carga de imágenes limpias al bucket '${BUCKET}'...`);

  const files = fs.readdirSync(IMAGES_DIR);
  for (const file of files) {
      if (!file.toLowerCase().endsWith('.jpg') && !file.toLowerCase().endsWith('.jpeg')) continue;
      
      const cleanName = cleanFilename(file);
      console.log(`Subiendo: ${file} -> ${cleanName}`);
      
      const fileData = fs.readFileSync(path.join(IMAGES_DIR, file));
      
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(cleanName, fileData, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
          console.error(`Error al subir ${cleanName}:`, error);
      }
  }
  console.log("Carga finalizada.");
}

uploadFiles();
