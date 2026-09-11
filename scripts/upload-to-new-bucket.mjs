import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const SUPABASE_URL = "https://unjojlgwgbcxyxqqkjbe.supabase.co";
// Utilizando la clave de servicio del script de siembra
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam9qbGd3Z2JjeHl4cXFramJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2MTA1MiwiZXhwIjoyMTAzMTM3MDUyfQ.bItD8RtFhEYDyVPmritnlV5SU42ahq7q0iLt-NQ9Irg";
const BUCKET = "productos";
const IMAGES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/products-hq');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function uploadFiles() {
  console.log(`Iniciando carga de imágenes al bucket '${BUCKET}'...`);

  // 1. Crear el bucket si no existe
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.find(b => b.name === BUCKET);
  
  if (!bucketExists) {
      console.log(`Creando bucket '${BUCKET}'...`);
      const { error: createError } = await supabase.storage.createBucket(BUCKET, { public: true });
      if (createError) {
          console.error("Error al crear bucket:", createError);
          return;
      }
  }

  // 2. Subir archivos
  const files = fs.readdirSync(IMAGES_DIR);
  for (const file of files) {
      if (!file.toLowerCase().endsWith('.jpg') && !file.toLowerCase().endsWith('.jpeg')) continue;
      
      console.log(`Subiendo: ${file}`);
      const fileData = fs.readFileSync(path.join(IMAGES_DIR, file));
      
      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(file, fileData, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
          console.error(`Error al subir ${file}:`, error);
      }
  }
  console.log("Carga finalizada.");
}

uploadFiles();
