from PIL import Image, ImageEnhance, ImageFilter
from pathlib import Path

# Configuración
INPUT_DIR = Path(r"D:\FOTOS ALMACEN PRODUCTOS PRECIO\FOTOS ALMACEN")
OUTPUT_DIR = Path(r"D:\IMAGENES GEMINI")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

def process_all():
    files = list(INPUT_DIR.glob("*"))
    total = len([f for f in files if f.suffix.lower() in ['.jpg', '.jpeg', '.png']])
    print(f"Total de imágenes a procesar: {total}")
    
    count = 0
    for file_path in files:
        if file_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
            count += 1
            print(f"[{count}/{total}] Procesando: {file_path.name}")
            try:
                # 1. Cargar imagen original
                img = Image.open(file_path).convert("RGB")
                
                # 2. Ajustes de color simples
                enhancer = ImageEnhance.Contrast(img)
                img = enhancer.enhance(1.1)
                
                # 3. Canvas 1000x1200 fondo gris muy claro
                canvas = Image.new("RGB", (1000, 1200), (245, 245, 245))
                
                # 4. Redimensionar producto (manteniendo proporción)
                img.thumbnail((850, 1050))
                w, h = img.size
                offset_x = (1000 - w) // 2
                offset_y = (1200 - h) // 2
                
                # 5. Crear sombra suave
                shadow = Image.new("RGB", (w + 20, h + 20), (200, 200, 200))
                shadow = shadow.filter(ImageFilter.GaussianBlur(30))
                
                # Pegar sombra y producto
                canvas.paste(shadow, (offset_x - 10, offset_y - 10))
                canvas.paste(img, (offset_x, offset_y))
                
                # Guardar
                output_path = OUTPUT_DIR / file_path.name
                canvas.save(output_path, "JPEG", quality=90)
            except Exception as e:
                print(f"Error procesando {file_path.name}: {e}")

if __name__ == "__main__":
    process_all()
