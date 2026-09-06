import os
import io
import cv2
import numpy as np
from PIL import Image
from dotenv import load_dotenv
from supabase import create_client
from datetime import datetime
import json
from tqdm import tqdm

# Load env (prioritise system env vars over .env file)
load_dotenv(".env.script") 
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("ERROR: Faltan variables de entorno SUPABASE_URL o SUPABASE_KEY.")

print(f"DEBUG: URL cargada: {SUPABASE_URL}")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Config
BUCKET = "productos"
TARGET_SIZE = (1000, 1200)

def process_image(image_bytes):
    # Load with cv2
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    h, w = img.shape[:2]
    orientation = "square"
    if h > w: orientation = "portrait"
    elif w > h: orientation = "landscape"
    
    # Rotate if landscape
    if orientation == "landscape":
        img = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
        h, w = img.shape[:2]
        orientation = "portrait"
        
    # Pad to 1000x1200
    # Create background canvas (pure white)
    canvas = np.full((1200, 1000, 3), [255, 255, 255], dtype=np.uint8)
    
    # Resize img to fit keeping aspect ratio
    scale = min(1000/w, 1200/h)
    new_w, new_h = int(w * scale), int(h * scale)
    img_resized = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_AREA)
    
    # Center image
    x_offset = (1000 - new_w) // 2
    y_offset = (1200 - new_h) // 2
    
    # Apply white background
    canvas = np.full((1200, 1000, 3), 255, dtype=np.uint8)
    canvas[y_offset:y_offset+new_h, x_offset:x_offset+new_w] = img_resized
    
    # Normalise illumination
    lab = cv2.cvtColor(canvas, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    cl = clahe.apply(l)
    limg = cv2.merge((cl,a,b))
    canvas = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
    
    # Denoise/Sharpen
    canvas = cv2.fastNlMeansDenoisingColored(canvas, None, 10, 10, 7, 21)
    kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
    canvas = cv2.filter2D(canvas, -1, kernel)
    
    return canvas, orientation

def run():
    products = supabase.table("products").select("*").execute().data
    results = []
    
    for p in tqdm(products):
        pid = p['id']
        url = p['image_url']
        if not url: continue
        
        # Parse path (ajustar si el bucket es 'productos' pero la tabla es 'products')
        path = url.split(f"/object/public/{BUCKET}/")[-1]
        
        try:
            # Download
            res = supabase.storage.from_(BUCKET).download(path)
            
            # Process
            processed_img, orient = process_image(res)
            
            # Save to buffer
            success, encoded_img = cv2.imencode('.jpg', processed_img, [int(cv2.IMWRITE_JPEG_QUALITY), 95])
            if not success: raise Exception("Encoding failed")
            
            # Upload
            supabase.storage.from_(BUCKET).upload(path, encoded_img.tobytes(), {"upsert": "true", "content-type": "image/jpeg"})
            
            # Update DB
            supabase.table("products").update({"processed_at": datetime.now().isoformat()}).eq("id", pid).execute()
            
            results.append({"id": pid, "orientation": orient, "status": "success"})
            
        except Exception as e:
            results.append({"id": pid, "status": "error", "error": str(e)})
            
    with open("processing_log.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    run()
