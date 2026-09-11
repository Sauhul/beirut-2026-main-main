import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const SUPABASE_URL = "https://unjojlgwgbcxyxqqkjbe.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam9qbGd3Z2JjeHl4cXFramJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2MTA1MiwiZXhwIjoyMTAzMTM3MDUyfQ.bItD8RtFhEYDyVPmritnlV5SU42ahq7q0iLt-NQ9Irg";
const BUCKET = "product-images";
const IMAGES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/products');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function cleanupStorage() {
  console.log("Iniciando limpieza de Storage en Supabase...");
  // 1. Get local files
  const localFiles = fs.readdirSync(IMAGES_DIR);

  // 2. Get remote files
  const { data: remoteFiles, error } = await supabase.storage.from(BUCKET).list();
  if (error) {
    console.error("Error listando archivos:", error);
    return;
  }

  // 3. Identify files to delete
  const remoteFileNames = remoteFiles.map(f => f.name);
  // Excluir archivos que no sean imágenes o carpetas (si las hay)
  const filesToDelete = remoteFileNames.filter(remote => !localFiles.includes(remote) && remote.endsWith('.jpg'));

  console.log(`Archivos encontrados en storage: ${remoteFiles.length}`);
  console.log(`Archivos locales a conservar: ${localFiles.length}`);
  console.log(`Archivos a eliminar de storage: ${filesToDelete.length}`);
  
  if (filesToDelete.length > 0) {
      // Eliminar en lotes para evitar errores
      const { error: delError } = await supabase.storage.from(BUCKET).remove(filesToDelete);
      if (delError) {
        console.error("Error eliminando archivos:", delError);
      } else {
        console.log('Archivos extra eliminados correctamente del Storage de Supabase.');
      }
  } else {
      console.log("No se encontraron archivos extras para eliminar.");
  }
}

cleanupStorage();
