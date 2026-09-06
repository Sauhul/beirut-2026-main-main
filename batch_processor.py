from PIL import Image, ImageEnhance, ImageFilter
from rembg import remove
import os
from pathlib import Path

# Configuración
INPUT_DIR = Path(r"D:\FOTOS ALMACEN PRODUCTOS PRECIO\FOTOS ALMACEN")
OUTPUT_DIR = Path(r"D:\IMAGENES GEMINI")
OUTPUT_DIR.mkdir(exist_ok=True)

def process_image(file_path):
    print(f"Procesando: {file_path.name}")
    # 1. Cargar y quitar fondo
    img = Image.open(file_path).convert("RGBA")
    img_no_bg = remove(img)
    
    # 2. Mejoras suaves de contraste y nitidez
    enhancer = ImageEnhance.Contrast(img_no_bg)
    img_no_bg = enhancer.enhance(1.1) 
    enhancer = ImageEnhance.Sharpness(img_no_bg)
    img_no_bg = enhancer.enhance(1.2)
    
    # 3. Crear sombra más suave y natural
    shadow_mask = img_no_bg.split()[3].filter(ImageFilter.GaussianBlur(30)) 
    shadow = Image.new("RGBA", img_no_bg.size, (50, 50, 50, 255)) 
    shadow.putalpha(shadow_mask)
    
    # 4. Fondo gris muy claro para realismo
    canvas = Image.new("RGBA", (1000, 1200), (245, 245, 245, 255))
    
    # Centrar objeto
    img_no_bg.thumbnail((800, 1000))
    shadow.thumbnail((800, 1000))
    
    w, h = img_no_bg.size
    offset_x = (1000 - w) // 2
    offset_y = (1200 - h) // 2
    
    # Desplazar sombra
    shadow_offset = (offset_x + 20, offset_y + 20)
    
    canvas.paste(shadow, shadow_offset, shadow)
    canvas.paste(img_no_bg, (offset_x, offset_y), img_no_bg)
    
    # Guardar
    output_path = OUTPUT_DIR / f"PROCESSED_{file_path.name}"
    canvas.convert("RGB").save(output_path, "JPEG", quality=95)
    print(f"Guardado en: {output_path}")

if __name__ == "__main__":
    for file_path in INPUT_DIR.glob("*"):
        if file_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
            try:
                process_image(file_path)
            except Exception as e:
                print(f"Error en {file_path.name}: {e}")
