# Contexto y Tarea: Edición Masiva de Imágenes por Lote (300 Fotos) con IA (Gratis)

## 📌 Contexto del Estado Actual
- **Sistema Operativo:** Arch Linux.
- **Volumen de trabajo:** ~300 imágenes.
- **Objetivo:** Aplicar un prompt de edición de IA a cada imagen de una carpeta origen y guardar el resultado en una carpeta destino.
- **Restricciones:** 
  - NO usar Gemini (debe ser gratuito y no depender de Gemini).
  - Ejecución en lote (batch), automatizada.

---

## 🛠️ Opciones de Implementación Disponibles

### Opción A: Script Nativo Python en Arch Linux (API Gratuita Hugging Face)
**Ventajas:** Rápido de configurar, no requiere GPU pesada localmente, procesa archivo por archivo con barra de progreso.

**Requisitos:**
1. Crear entorno Python y dependencias:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install requests pillow tqdm
   ```
2. Obtener un token gratuito en [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens).
3. Colocar las fotos en `./imagenes_entrada`.

**Código del Script (`procesar_lote.py`):**
```python
import os
import requests
from PIL import Image
from tqdm import tqdm

INPUT_DIR = "./imagenes_entrada"
OUTPUT_DIR = "./imagenes_salida"
HF_TOKEN = "TU_TOKEN_DE_HUGGINGFACE" # Reemplazar con el token
API_URL = "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix"
HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}

# EDITAR AQUÍ EL PROMPT DESEADO:
PROMPT = "Change background to clean white product studio lighting, improve image sharpness"

os.makedirs(OUTPUT_DIR, exist_ok=True)
archivos = [f for f in os.listdir(INPUT_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]

print(f"Iniciando procesamiento de {len(archivos)} imágenes...")

for archivo in tqdm(archivos):
    ruta_in = os.path.join(INPUT_DIR, archivo)
    ruta_out = os.path.join(OUTPUT_DIR, archivo)
    
    if os.path.exists(ruta_out):
        continue

    try:
        with open(ruta_in, "rb") as f:
            img_bytes = f.read()

        response = requests.post(
            API_URL, 
            headers=HEADERS, 
            data=img_bytes, 
            params={"prompt": PROMPT}
        )
        
        if response.status_code == 200:
            with open(ruta_out, "wb") as f_out:
                f_out.write(response.content)
        else:
            print(f"\nError en {archivo}: HTTP {response.status_code}")
    except Exception as e:
        print(f"\nError procesando {archivo}: {e}")

print("¡Proceso finalizado!")
```

---

### Opción B: Google Colab (Gratis con GPU T4 en la Nube)
**Ventajas:** Utiliza modelos locales completos (`diffusers` / Stable Diffusion InstructPix2Pix) corriendo en la GPU de Google sin gastar recursos locales.

**Pasos:**
1. Subir la carpeta de 300 fotos a **Google Drive** (`MyDrive/imagenes_entrada`).
2. Abrir cuaderno en Google Colab con entorno GPU T4.
3. Ejecutar script de integración con PyTorch/Diffusers para guardar en `MyDrive/imagenes_salida`.

---

## 🎯 Próximo Paso Requerido
Dile a OpenCode cuál es la ruta exacta de tu carpeta de 300 imágenes y cuál es el **prompt exacto** que deseas aplicar a las imágenes para que te cree y ejecute el entorno y script automáticamente en tu terminal de Arch Linux.
