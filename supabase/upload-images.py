#!/usr/bin/env python3
"""
Sube las imágenes del almacén Beirut a Supabase Storage.
- Redimensiona a máximo 1200px con Pillow antes de subir
- Usa upsert para sobreescribir si ya existe
"""

import os
import io
import urllib.request
import urllib.error
import json
from PIL import Image

SUPABASE_URL = "https://unjojlgwgbcxyxqqkjbe.supabase.co"
SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam9qbGd3Z2JjeHl4cXFramJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2MTA1MiwiZXhwIjoyMTAzMTM3MDUyfQ.bItD8RtFhEYDyVPmritnlV5SU42ahq7q0iLt-NQ9Irg"
BUCKET = "product-images"
SOURCE_DIR = "/media/Guest/FOTOS DELIK/FOTOS ALMACEN PRODUCTOS PRECIO/FOTOS ALMACEN"

# Mapeo: nombre en USB -> slug destino en Supabase
IMAGE_MAP = {
    "ALBARICOQUE SECO (25.000) .jpg":        "albaricoque-seco.jpg",
    "ALMENDRA MEDIA L(20.000).jpg":           "almendra-media-l.jpg",
    "BAKLAWA HOJALDRE (15.000) .jpg":         "baklawa-hojaldre.jpg",
    "BAKLAWA KILO (180.000) .jpg":            "baklawa-kilo.jpg",
    "BERENJENA CON TAHINE(12.000).jpg":       "berenjena-con-tahine.jpg",
    "BORDON (25.000).jpg":                    "bordon.jpg",
    "BULGUR TRIGO BLANCO 1 (16.000) .jpg":    "bulgur-trigo-blanco-1.jpg",
    "CAFE MAATOUK 450GR  (55.000).jpg":       "cafe-maatouk-450gr.jpg",
    "CAFE MAATUK 200GR (30.000) .jpg":        "cafe-maatuk-200gr.jpg",
    "CAFE NAJJAR CLASIC(50.000).jpg":         "cafe-najjar-clasic.jpg",
    "CAFE NAJJAR CON CARDAMOMO(27.000).jpg":  "cafe-najjar-con-cardamomo.jpg",
    "CASTANIA AZUL LAT (50.000).jpg":         "castania-azul-lat.jpg",
    "CASTANIA SIN SAL(75.000).jpg":           "castania-sin-sal.jpg",
    "CASTANIA VERDE LAT(65.000).jpg":         "castania-verde-lat.jpg",
    "chanclis (38000).jpg":                   "chanclis.jpg",
    "CRUNCHY 170GR (30.000).jpg":             "crunchy-170gr.jpg",
    "CRUNCHY BITE 80GR (15.000) .jpg":        "crunchy-bite-80gr.jpg",
    "CRUNCHY BITES 80GR (15.000) .jpg":       "crunchy-bites-80gr.jpg",
    "CRUNCHY BITES 80GR (15.000)  (2).jpg":   "crunchy-bites-80gr-2.jpg",
    "CRUNCHY LAT MORADA 170GR (20.000) .jpg": "crunchy-lat-morada-170gr.jpg",
    "CRUNCHY LAT MORADA 340GR (35.000) .jpg": "crunchy-lat-morada-340gr.jpg",
    "CRUNCHY LAT MORADA(45.000).jpg":         "crunchy-lat-morada.jpg",
    "CRUNCHY LAT ROJA 340GR (60.000) .jpg":   "crunchy-lat-roja-340gr.jpg",
    "CRUNCHY LAT VERDE 450GR (55.000) .jpg":  "crunchy-lat-verde-450gr.jpg",
    "CRUNCHY LATA 200GR (25.000).jpg":        "crunchy-lata-200gr.jpg",
    "CRUNCHY LT VERDE 170GR (25.000) .jpg":   "crunchy-lt-verde-170gr.jpg",
    "CRUNCHY TARRO 200GR (25.000) .jpg":      "crunchy-tarro-200gr.jpg",
    "CRUNCHY TARRO 200GR (25.000)  (2).jpg":  "crunchy-tarro-200gr-2.jpg",
    "CRUNCHY VERDE PINANTE (55.000).jpg":     "crunchy-verde-pinante.jpg",
    "CTUNCHY BITES 80GR (15.000) .jpg":       "ctunchy-bites-80gr.jpg",
    "DATIL LIBRA(45.000).jpg":                "datil-libra.jpg",
    "DATIL RELLENO(100.000).jpg":             "datil-relleno.jpg",
    "DATILES KILO (90.000) .jpg":             "datiles-kilo.jpg",
    "EMPANADA CARNE (29.000) .jpg":           "empanada-carne.jpg",
    "EMPANADA CARNE CON LABNEH (29.000) .jpg":"empanada-carne-con-labneh.jpg",
    "EMPANADA DE ARISH (22.000).jpg":         "empanada-de-arish.jpg",
    "EMPANADA DE ESPINACA (24.000).jpg":      "empanada-de-espinaca.jpg",
    "EMPANADA DE POLLO (22.000) .jpg":        "empanada-de-pollo.jpg",
    "EMPANADA PAPA Y CARNE (29.000).jpg":     "empanada-papa-y-carne.jpg",
    "ESPECIAS 7 PIMIENTA 454GR (.jpg":        "especias-7-pimienta-454gr.jpg",
    "ESPECIAS FALAFEL 454GR (70.000) .jpg":   "especias-falafel-454gr.jpg",
    "ESPECIAS KEBBE454GR (70.000) .jpg":      "especias-kebbe454gr.jpg",
    "FALAFEL (20.000) .jpg":                  "falafel.jpg",
    "GARBANZO AMARILLO (12.000) .jpg":        "garbanzo-amarillo.jpg",
    "GHRAYBEH (14.000).jpg":                  "ghraybeh.jpg",
    "HABAS LATA 400GR (7.000) .jpg":          "habas-lata-400gr.jpg",
    "HIERBABUENA SECA 200GR (55.000) .jpg":   "hierbabuena-seca-200gr.jpg",
    "HIERBAMATE (16.000) .jpg":               "hierbamate.jpg",
    "HIERBAMATE(16.000).jpg":                 "hierbamate-2.jpg",
    "HIGOS SECOS 125GR (17.000) .jpg":        "higos-secos-125gr.jpg",
    "LABNE (38.000) .jpg":                    "labne.jpg",
    "LENTEJAS ROJAS (22.000) .jpg":           "lentejas-rojas.jpg",
    "MANGUERA (30.000).jpg":                  "manguera.jpg",
    "NUEZ 250(30.000).jpg":                   "nuez-250.jpg",
    "PAN AJONJOLI X3(6.000).jpg":             "pan-ajonjoli-x3.jpg",
    "PAN ARABE(8.000).jpg":                   "pan-arabe.jpg",
    "PAN CON ZAATAR(7.000).jpg":              "pan-con-zaatar.jpg",
    "PAN INTEGRAL(7.000).jpg":                "pan-integral.jpg",
    "PAN MINI (7.000).jpg":                   "pan-mini.jpg",
    "PAN TOSTADO(5.000).jpg":                 "pan-tostado.jpg",
    "piñones(85.000).jpg":                    "pinones.jpg",
    "SAL DE LIMON LB (20.000) .jpg":          "sal-de-limon-libra.jpg",
    "SEMOLA FINA(22.000).jpg":                "semola-fina.jpg",
    "SEMOLA GRUESA (22.000).jpg":             "semola-gruesa.jpg",
    "TAHINE 454GR (25.000) .jpg":             "tahine-454gr.jpg",
    "TAHINE 907GR (50.000) .jpg":             "tahine-907gr.jpg",
    "TAHINE CON GARBANZO(12.000).jpg":        "tahine-con-garbanzo.jpg",
    "TAHINE KILO(50.000).jpg":                "tahine-kilo.jpg",
    "tahine libra(25.000).jpg":               "tahine-libra.jpg",
    "TE CEYLON 160 (25.000).jpg":             "te-ceylon-160.jpg",
    "TE CEYLON 400GR(45.000).jpg":            "te-ceylon-400gr.jpg",
    "TRIGO ENTERO (15.000) .jpg":             "trigo-entero.jpg",
    "ZAATAR 500GR (45.000) .jpg":             "zaatar-500gr.jpg",
    "ZWAN CAENE 850(55.000).jpg":             "zwan-caene-850.jpg",
    "ZWAN CARNE 340(30.000).jpg":             "zwan-carne-340.jpg",
    "ZWAN POLLO (30.000).jpg":                "zwan-pollo.jpg",
    "ZWAN POLLO 850GR (55.000).jpg":          "zwan-pollo-850gr.jpg",
}


def compress_image(src_path: str, max_size: int = 1200, quality: int = 82) -> bytes:
    """Abre, redimensiona y devuelve los bytes JPEG comprimidos."""
    with Image.open(src_path) as img:
        # Convertir a RGB si tiene canal alpha (PNG, WEBP, etc.)
        if img.mode in ("RGBA", "P", "LA"):
            img = img.convert("RGB")
        img.thumbnail((max_size, max_size), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=quality, optimize=True)
        return buf.getvalue()


def upload_to_supabase(dest_name: str, image_bytes: bytes) -> tuple[int, str]:
    """Sube los bytes al Storage de Supabase. Devuelve (http_code, mensaje)."""
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/products/{dest_name}"
    req = urllib.request.Request(
        url,
        data=image_bytes,
        method="POST",
        headers={
            "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
            "Content-Type": "image/jpeg",
            "x-upsert": "true",
        },
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def main():
    ok = 0
    skipped = 0
    failed = 0

    print(f"\n📤 Comprimiendo y subiendo {len(IMAGE_MAP)} imágenes...")
    print("=" * 52)

    for src_name, dest_name in IMAGE_MAP.items():
        src_path = os.path.join(SOURCE_DIR, src_name)

        if not os.path.isfile(src_path):
            print(f"⚠️  No encontrado: {src_name}")
            skipped += 1
            continue

        try:
            image_bytes = compress_image(src_path)
        except Exception as e:
            print(f"❌ Comprimir falló [{dest_name}]: {e}")
            failed += 1
            continue

        code, body = upload_to_supabase(dest_name, image_bytes)

        if code in (200, 201):
            size_kb = len(image_bytes) / 1024
            print(f"✅ {dest_name}  ({size_kb:.0f} KB)")
            ok += 1
        else:
            print(f"❌ {dest_name}  (HTTP {code}) → {body[:120]}")
            failed += 1

    print("=" * 52)
    print(f"✅ Subidas:        {ok}")
    print(f"⚠️  No encontradas: {skipped}")
    print(f"❌ Errores:        {failed}")
    print()
    print("URL base de tus imágenes:")
    print(f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/products/")


if __name__ == "__main__":
    main()
