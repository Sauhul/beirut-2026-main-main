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
    # Create the base image
    base = Image.new("RGBA", size, edge_color)
    
    # Create a gradient image
    # We create a smaller image and scale it up to create the effect
    gradient = Image.new("L", (1, height), 0)
    for y in range(height):
        # Linear interpolation
        ratio = y / height
        gradient.putpixel((0, y), int(255 * ratio))
    
    # This is a bit simple, but effective for a soft background
    # Let's just create a soft radial gradient using drawing
    canvas = Image.new("RGBA", size, edge_color)
    draw = ImageDraw.Draw(canvas)
    
    # Circular gradient
    for i in range(min(size) // 2, 0, -1):
        color = (
            int(center_color[0] + (edge_color[0] - center_color[0]) * (i / (min(size) // 2))),
            int(center_color[1] + (edge_color[1] - center_color[1]) * (i / (min(size) // 2))),
            int(center_color[2] + (edge_color[2] - center_color[2]) * (i / (min(size) // 2))),
            255
        )
        draw.ellipse((width//2 - i, height//2 - i, width//2 + i, height//2 + i), fill=color)
        
    return canvas

colors = {
    # Light creamish-warm gradient
    "center": (255, 250, 240, 255),
    "edge": (230, 220, 200, 255)
}

def process_image(file_path):
    print(f"Procesando: {file_path.name}")
    # 1. Quitar fondo
    img = Image.open(file_path).convert("RGBA")
    img_no_bg = remove(img, session=session)
    
    # 2. Mejoras
    enhancer = ImageEnhance.Contrast(img_no_bg)
    img_no_bg = enhancer.enhance(1.1) 
    enhancer = ImageEnhance.Sharpness(img_no_bg)
    img_no_bg = enhancer.enhance(1.2)
    
    # 3. Sombra natural
    shadow_mask = img_no_bg.split()[3].filter(ImageFilter.GaussianBlur(30)) 
    shadow = Image.new("RGBA", img_no_bg.size, (50, 50, 50, 255)) 
    shadow.putalpha(shadow_mask)
    
    # 4. Canvas con fondo "con vida" (gradient)
    canvas = create_radial_gradient((1000, 1200), colors["center"], colors["edge"])
    
    # Product setup
    img_no_bg.thumbnail((850, 1050))
    shadow.thumbnail((850, 1050))
    
    w, h = img_no_bg.size
    offset_x = (1000 - w) // 2
    offset_y = (1200 - h) // 2
    
    # Paste
    canvas.paste(shadow, (offset_x + 20, offset_y + 20), shadow)
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
