import os
import google.generativeai as genai
from pathlib import Path
import time

# Configuración
API_KEY = "TU_API_KEY_AQUI"
genai.configure(api_key=API_KEY)
# Usando gemini-1.5-flash para análisis
model = genai.GenerativeModel('gemini-1.5-flash')

PROMPT = """Actua como un editor de fotos profesional para productos E-commerce. 
Centra el producto, pon un fondo blanco puro, expande a 1000x1200 y uniformiza la iluminación.
El producto debe ser perfecto y legible.
IMPORTANTE: Si la imagen no tiene un nombre de producto claramente legible, responde únicamente con la palabra: OMITIR."""

input_dir = Path(r"D:\FOTOS ALMACEN PRODUCTOS PRECIO\FOTOS ALMACEN")
output_dir = Path(r"D:\IMAGENES GEMINI")

def procesar():
    if not output_dir.exists():
        output_dir.mkdir(parents=True)
        
    for file_path in input_dir.glob("*"):
        if file_path.suffix.lower() in ['.jpg', '.jpeg', '.png']:
            print(f"Analizando: {file_path.name}")
            
            try:
                # Cargar imagen y enviar a Gemini
                sample_file = genai.upload_file(str(file_path))
                response = model.generate_content([PROMPT, sample_file])
                
                # Manejar respuesta
                if "OMITIR" in response.text.upper():
                    print(f"Omitido: {file_path.name}")
                else:
                    # NOTA: Gemini API devuelve texto o datos estructurados.
                    # No devuelve automáticamente el archivo de imagen editado.
                    print(f"Procesado: {file_path.name}. (Respuesta recibida: {response.text[:50]}...)")
                    # Aquí deberías implementar cómo guardar la respuesta si fuera una imagen,
                    # lo cual no está soportado directamente por esta API para edición.
                
                # Limpiar archivo subido
                genai.delete_file(sample_file.name)
                
            except Exception as e:
                print(f"Error procesando {file_path.name}: {e}")

if __name__ == "__main__":
    procesar()
