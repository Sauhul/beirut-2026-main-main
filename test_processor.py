from PIL import Image, ImageEnhance, ImageFilter
from rembg import remove
import os
from pathlib import Path

# Configuración
INPUT_FILE1 = Path(r"D:\FOTOS ALMACEN PRODUCTOS PRECIO\FOTOS ALMACEN\AGUA_AZAHAR.jpg")
INPUT_FILE2 = Path(r"D:\FOTOS ALMACEN PRODUCTOS PRECIO\FOTOS ALMACEN\MOLDE_KIBBEH.jpg")
OUTPUT_DIR = Path(r"D:\IMAGENES_PRUEBA")
OUTPUT_DIR.mkdir(exist_ok=True)

def process_image(file_path):
    print(f"Procesando: {file_path.name}")
    # 1. Cargar y quitar fondo
    img = Image.open(file_path).convert("RGBA")
    # Usamos rembg para obtener tanto la imagen recortada como la mascara (alpha)
    img_no_bg = remove(img)
    
    # 2. Mejoras de productos (Contraste y Nitidez)
    enhancer = ImageEnhance.Contrast(img_no_bg)
    img_no_bg = enhancer.enhance(1.1) # Contraste más suave
    enhancer = ImageEnhance.Sharpness(img_no_bg)
    img_no_bg = enhancer.enhance(1.2) # Nitidez más suave
    
    # 3. Crear sombra más suave y natural
    # Difuminar mucho más la sombra
    shadow_mask = img_no_bg.split()[3].filter(ImageFilter.GaussianBlur(30)) 
    shadow = Image.new("RGBA", img_no_bg.size, (50, 50, 50, 255)) # Sombra gris oscuro (no negra pura)
    shadow.putalpha(shadow_mask)
    
    # 4. Fondo gris muy claro degradado para realismo (en lugar de blanco plano)
    canvas = Image.new("RGBA", (1000, 1200), (245, 245, 245, 255))
    
    # ... (centrado, pegado)
            
    # Difuminar sombra (ajuste de offset)
    shadow_offset = (offset_x + 20, offset_y + 20)
    
    canvas.paste(shadow, shadow_offset, shadow)
    canvas.paste(img_no_bg, (offset_x, offset_y), img_no_bg)
    
    # Guardar
    output_path = OUTPUT_DIR / f"PROCESSED_{file_path.name}"
    canvas.convert("RGB").save(output_path, "JPEG", quality=95)
    print(f"Guardado en: {output_path}")

if __name__ == "__main__":
    process_image(INPUT_FILE1)
    process_image(INPUT_FILE2)
