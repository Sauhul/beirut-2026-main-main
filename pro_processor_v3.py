from PIL import Image, ImageEnhance, ImageFilter, ImageDraw
from rembg import remove, new_session
import os
from pathlib import Path

# Configuración
INPUT_DIR = Path(r"D:\FOTOS ALMACEN PRODUCTOS PRECIO\FOTOS ALMACEN")
OUTPUT_DIR = Path(r"D:\IMAGENES GEMINI")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Forzar uso de CPU
session = new_session("u2net", providers=['CPUExecutionProvider'])

def create_radial_gradient(size, center_color, edge_color):
    width, height = size
    canvas = Image.new("RGBA", size, edge_color)
    draw = ImageDraw.Draw(canvas)
    
    # Circular gradient improvement
    for i in range(max(size), 0, -1):
        # Interpolate color between edge and center
        alpha = i / max(size)
        color = (
            int(center_color[0] * (1-alpha) + edge_color[0] * alpha),
            int(center_color[1] * (1-alpha) + edge_color[1] * alpha),
            int(center_color[2] * (1-alpha) + edge_color[2] * alpha),
            255
        )
        draw.ellipse((width//2 - i, height//2 - i, width//2 + i, height//2 + i), fill=color)
        
    return canvas

colors = {
    "center": (250, 245, 230, 255), # Creamy light
    "edge": (210, 200, 180, 255)     # Warm gray
}

def process_image(file_path):
    print(f"Procesando: {file_path.name}")
    # 1. Quitar fondo
    img = Image.open(file_path).convert("RGBA")
    img_no_bg = remove(img, session=session)
    
    # 2. Crop del producto real para consistencia absoluta de tamaño
    bbox = img_no_bg.getbbox()
    if bbox:
        img_no_bg = img_no_bg.crop(bbox)
        
    # 3. Escalar producto a un tamaño fijo (max dimension) para uniformidad
    img_no_bg.thumbnail((800, 1000), Image.Resampling.LANCZOS)
    
    # 4. Mejoras
    enhancer = ImageEnhance.Contrast(img_no_bg)
    img_no_bg = enhancer.enhance(1.1) 
    enhancer = ImageEnhance.Sharpness(img_no_bg)
    img_no_bg = enhancer.enhance(1.2)
    
    w, h = img_no_bg.size
    offset_x = (1000 - w) // 2
    offset_y = (1200 - h) // 2
    
    # 5. (Sombra eliminada)
    
    # 6. Canvas con fondo "con vida"
    canvas = create_radial_gradient((1000, 1200), colors["center"], colors["edge"])
    
    # Paste producto
    canvas.paste(img_no_bg, (offset_x, offset_y), img_no_bg)
    
    # Save
    output_path = OUTPUT_DIR / f"{file_path.stem}.jpg"
    canvas.convert("RGB").save(output_path, "JPEG", quality=95)
    print(f"Guardado: {output_path}")

if __name__ == "__main__":
    files = [f for f in INPUT_DIR.glob("*") if f.suffix.lower() in ['.jpg', '.jpeg', '.png']]
    # Filter files
    files = [f for f in files if "MVIMG" not in f.name]
    total = len(files)
    print(f"Total imágenes a procesar: {total}")
    for i, file_path in enumerate(files, 1):
        try:
            print(f"[{i}/{total}]", end=" ")
            process_image(file_path)
        except Exception as e:
            print(f"Error {file_path.name}: {e}")
