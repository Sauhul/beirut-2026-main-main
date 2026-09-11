import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = path.join(__dirname, '../public/products-hq');
const OUTPUT_DIR = path.join(__dirname, '../public/products-fixed');

// Color de fondo del aceite (aproximado, según el aceite de oliva)
const BACKGROUND_COLOR = { r: 245, g: 240, b: 220, alpha: 1 };

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function fixBackgrounds() {
  const files = fs.readdirSync(INPUT_DIR);
  
  for (const file of files) {
    if (!file.toLowerCase().endsWith('.jpg') && !file.toLowerCase().endsWith('.jpeg')) continue;
    
    console.log(`Procesando fondo: ${file}`);
    
    try {
        // Primero redimensionamos, luego añadimos el fondo sólido
        await sharp(path.join(INPUT_DIR, file))
          .resize(800, 800, { fit: 'contain', background: BACKGROUND_COLOR })
          .flatten({ background: BACKGROUND_COLOR })
          .jpeg({ quality: 85, mozjpeg: true })
          .toFile(path.join(OUTPUT_DIR, file));
    } catch (e) {
        console.error(`Error procesando ${file}:`, e);
    }
  }
  console.log("Proceso finalizado. Las imágenes están en public/products-fixed");
}

fixBackgrounds();
