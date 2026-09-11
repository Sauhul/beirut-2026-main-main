import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT_DIR = path.join(__dirname, '../public/products-hq');
const OUTPUT_DIR = path.join(__dirname, '../public/products');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function processImages() {
  const files = fs.readdirSync(INPUT_DIR);
  
  for (const file of files) {
    if (!file.toLowerCase().endsWith('.jpg') && !file.toLowerCase().endsWith('.jpeg')) continue;
    
    // Aca logica simple de normalizacion de nombre para que coincida con el slug
    // Esto es un ejemplo, se deberia ajustar al mapeo real
    const newName = file
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-') + '.jpg';

    // Nota: Esto generara nombres como "albaricoque-seco-25000.jpg"
    // El script de siembra debe usar estos nombres o renombrarlos a su slug correspondiente.
    
    console.log(`Procesando: ${file} -> ${newName}`);
    
    try {
        await sharp(path.join(INPUT_DIR, file))
          .resize(800, 800, { fit: 'inside' })
          .jpeg({ quality: 80, mozjpeg: true })
          .toFile(path.join(OUTPUT_DIR, newName));
    } catch (e) {
        console.error(`Error procesando ${file}:`, e);
    }
  }
}

processImages();
