from PIL import Image, ImageEnhance, ImageFilter
from rembg import remove, new_session
import os
from pathlib import Path

# Configuración
INPUT_DIR = Path(r"D:\FOTOS ALMACEN PRODUCTOS PRECIO\FOTOS ALMACEN")
OUTPUT_DIR = Path(r"D:\IMAGENES GEMINI")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Forzar uso de CPU para evitar errores de GPU
session = new_session("u2net", providers=['CPUExecutionProvider'])

def process_image(file_path):
    print(f"Procesando: {file_path.name}")
    # 1. Quitar fondo usando rembg
    img = Image.open(file_path).convert("RGBA")
    img_no_bg = remove(img, session=session)
    
    # 2. Mejoras suaves de contraste y nitidez
    enhancer = ImageEnhance.Contrast(img_no_bg)
    img_no_bg = enhancer.enhance(1.1) 
    enhancer = ImageEnhance.Sharpness(img_no_bg)
    img_no_bg = enhancer.enhance(1.2)
    
    # 3. Crear sombra más suave y natural
    # Obtenemos la máscara de transparencia
    shadow_mask = img_no_bg.split()[3].filter(ImageFilter.GaussianBlur(30)) 
    shadow = Image.new("RGBA", img_no_bg.size, (50, 50, 50, 255)) 
    shadow.putalpha(shadow_mask)
    
    # 4. Fondo gris muy claro para realismo
    canvas = Image.new("RGBA", (1000, 1200), (245, 245, 245, 255))
    
    # Redimensionar producto para que quepa bien
    img_no_bg.thumbnail((850, 1050))
    shadow.thumbnail((850, 1050))
    
    w, h = img_no_bg.size
    offset_x = (1000 - w) // 2
    offset_y = (1200 - h) // 2
    
    # Desplazar sombra (efecto realista)
    shadow_offset = (offset_x + 20, offset_y + 20)
    
    canvas.paste(shadow, shadow_offset, shadow)
    canvas.paste(img_no_bg, (offset_x, offset_y), img_no_bg)
    
    # Guardar como Jpeg
    output_path = OUTPUT_DIR / f"{file_path.stem}.jpg"
    canvas.convert("RGB").save(output_path, "JPEG", quality=95)
    print(f"Guardado: {output_path}")

if __name__ == "__main__":
    files = [f for f in INPUT_DIR.glob("*") if f.suffix.lower() in ['.jpg', '.jpeg', '.png']]
    total = len(files)
    print(f"Total imágenes: {total}")
    for i, file_path in enumerate(files, 1):
        try:
            print(f"[{i}/{total}]", end=" ")
            process_image(file_path)
        except Exception as e:
            print(f"Error {file_path.name}: {e}")
