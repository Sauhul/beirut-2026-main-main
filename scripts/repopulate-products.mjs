import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const SUPABASE_URL = "https://unjojlgwgbcxyxqqkjbe.supabase.co";
const SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam9qbGd3Z2JjeHl4cXFramJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2MTA1MiwiZXhwIjoyMTAzMTM3MDUyfQ.bItD8RtFhEYDyVPmritnlV5SU42ahq7q0iLt-NQ9Irg";
const BUCKET = "productos";
const IMAGES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/products-hq');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

function cleanFilename(name) {
    return name
        .toLowerCase()
        .replace(/\.[^/.]+$/, "") // remove extension for slug
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
        .replace(/[^a-z0-9]/g, '-') // replace non-alphanumeric with -
        .replace(/-+/g, '-') // collapse hyphens
        .replace(/^-|-$/g, ''); // remove leading/trailing hyphens
}

async function repopulateProducts() {
  console.log("Limpiando productos actuales...");
  // Get all products to delete by ID
  const { data: allProds } = await supabase.from("products").select("id");
  if (allProds && allProds.length > 0) {
      await supabase.from("products").delete().in("id", allProds.map(p => p.id));
  }

  console.log("Obteniendo categorías...");
  const { data: categories } = await supabase.from("categories").select("id");
  const catIds = categories.map(c => c.id);

  console.log("Generando nuevos productos...");
  const files = fs.readdirSync(IMAGES_DIR);
  const usedSlugs = new Set();
  
  const products = [];
  files.forEach((file, index) => {
    let slug = cleanFilename(file);
    let originalSlug = slug;
    let counter = 1;
    while (usedSlugs.has(slug)) {
        slug = `${originalSlug}-${counter}`;
        counter++;
    }
    usedSlugs.add(slug);
    
    const cleanName = slug.replace(/-/g, ' ').toUpperCase();
    
    products.push({
      slug: slug,
      name: cleanName,
      description: `Producto auténtico de Beirut: ${cleanName}`,
      price: Math.floor(Math.random() * 95000) + 5000,
      unit: 'unidad',
      category_id: catIds[index % catIds.length],
      in_stock: true,
      featured: index < 5,
      image_url: `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${cleanFilename(file)}.jpg`
    });
  });

  console.log(`Insertando ${products.length} productos...`);
  const { error } = await supabase.from("products").insert(products);
  
  if (error) {
    console.error("Error al insertar productos:", error);
  } else {
    console.log("Productos creados exitosamente.");
  }
}

repopulateProducts();
