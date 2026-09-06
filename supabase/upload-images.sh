#!/usr/bin/env bash
# ============================================================
# Sube las imágenes del almacén Beirut a Supabase Storage
# Redimensiona a max 1200px y comprime antes de subir
# Bucket: product-images
# ============================================================

SUPABASE_URL="https://unjojlgwgbcxyxqqkjbe.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuam9qbGd3Z2JjeHl4cXFramJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU2MTA1MiwiZXhwIjoyMTAzMTM3MDUyfQ.bItD8RtFhEYDyVPmritnlV5SU42ahq7q0iLt-NQ9Irg"
BUCKET="product-images"
SOURCE_DIR="/media/Guest/FOTOS DELIK/FOTOS ALMACEN PRODUCTOS PRECIO/FOTOS ALMACEN"
TMP_DIR="/tmp/beirut-images"

mkdir -p "$TMP_DIR"

# Mapeo: "NOMBRE EN USB" -> "slug-en-supabase"
# Generado desde products_import.json — 156 productos
declare -A MAP
MAP["ACEITE_OLIVA_3LITROS.jpg"]="aceite-oliva-3litros.jpg"
MAP["ACEITE_OLIVA_KOURA.jpg"]="aceite-oliva-koura.jpg"
MAP["ACEITUNAS_VERDES_ENCURTIDAS.jpg"]="aceitunas-verdes-encurtidas.jpg"
MAP["AGUA_AZAHAR.jpg"]="agua-azahar.jpg"
MAP["AGUA_aZAHAR_GRANDE.jpg"]="agua-azahar-grande.jpg"
MAP["AGUA_ROSAS_300ML.jpg"]="agua-rosas-300ml.jpg"
MAP["AGUA_rosas_750ml.jpg"]="agua-rosas-750ml.jpg"
MAP["ALBARICOQUE SECO (25.000) .jpg"]="albaricoque-seco.jpg"
MAP["ALMENDRA MEDIA L(20.000).jpg"]="almendra-media-l.jpg"
MAP["ALTRAMUCES SECOS.jpg"]="altramuces-secos.jpg"
MAP["Anatolia Moda Cezve Cafetera Turca de Cobre Pulido.jpg"]="anatolia-moda-cezve-cafetera-turca-de-cobre-pulido.jpg"
MAP["ARAK_TOUMA.jpg"]="arak-touma.jpg"
MAP["AZAHAR_AGUA_260ML.jpg"]="azahar-agua-260ml.jpg"
MAP["BAKLAWA HOJALDRE (15.000) .jpg"]="baklawa-hojaldre.jpg"
MAP["BAKLAWA KILO (180.000) .jpg"]="baklawa-kilo.jpg"
MAP["Bandeja de Vidrio Circular con Espiral Dorado.jpg"]="bandeja-de-vidrio-circular-con-espiral-dorado.jpg"
MAP["BERENJENA CON TAHINE(12.000).jpg"]="berenjena-con-tahine.jpg"
MAP["BORDON (25.000).jpg"]="bordon.jpg"
MAP["Brioni Cezve Cafetera Turca de Granito Azul.jpg"]="brioni-cezve-cafetera-turca-de-granito-azul.jpg"
MAP["Brioni Cezve Cafetera Turca de Granito Gris y Negro.jpg"]="brioni-cezve-cafetera-turca-de-granito-gris-y-negro.jpg"
MAP["Brioni Cezve Cafetera Turca de Granito Negro.jpg"]="brioni-cezve-cafetera-turca-de-granito-negro.jpg"
MAP["BULGUR TRIGO BLANCO 1 (16.000) .jpg"]="bulgur-trigo-blanco-1.jpg"
MAP["CAFE MAATOUK 450GR  (55.000).jpg"]="cafe-maatouk-450gr.jpg"
MAP["CAFE MAATUK 200GR (30.000) .jpg"]="cafe-maatuk-200gr.jpg"
MAP["CAFE NAJJAR CLASIC(50.000).jpg"]="cafe-najjar-clasic.jpg"
MAP["CAFE NAJJAR CON CARDAMOMO(27.000).jpg"]="cafe-najjar-con-cardamomo.jpg"
MAP["CASTANIA AZUL LAT (50.000).jpg"]="castania-azul-lat.jpg"
MAP["CASTANIA NUTS.jpg"]="castania-nuts.jpg"
MAP["CASTANIA SIN SAL(75.000).jpg"]="castania-sin-sal.jpg"
MAP["CASTANIA VERDE LAT(65.000).jpg"]="castania-verde-lat.jpg"
MAP["Cezve Cafetera Turca de Hierro Fundido Negro.jpg"]="cezve-cafetera-turca-de-hierro-fundido-negro.jpg"
MAP["Cezve Cafetera Turca Esmaltada Marrón con Motivos Blancos.jpg"]="cezve-cafetera-turca-esmaltada-marr-n-con-motivos-blancos.jpg"
MAP["Cezve Cafetera Turca Esmaltada Roja con Motivos Blancos .jpg"]="cezve-cafetera-turca-esmaltada-roja-con-motivos-blancos.jpg"
MAP["chanclis (38000).jpg"]="chanclis.jpg"
MAP["CRUNCHY 170GR (30.000).jpg"]="crunchy-170gr.jpg"
MAP["CRUNCHY BITE 80GR (15.000) .jpg"]="crunchy-bite-80gr.jpg"
MAP["CRUNCHY BITES 80GR (15.000) .jpg"]="crunchy-bites-80gr.jpg"
MAP["CRUNCHY BITES 80GR (15.000)  (2).jpg"]="crunchy-bites-80gr.jpg"
MAP["CRUNCHY LAT MORADA 170GR (20.000) .jpg"]="crunchy-lat-morada-170gr.jpg"
MAP["CRUNCHY LAT MORADA 340GR (35.000) .jpg"]="crunchy-lat-morada-340gr.jpg"
MAP["CRUNCHY LAT MORADA(45.000).jpg"]="crunchy-lat-morada.jpg"
MAP["CRUNCHY LAT ROJA 340GR (60.000) .jpg"]="crunchy-lat-roja-340gr.jpg"
MAP["CRUNCHY LAT VERDE 450GR (55.000) .jpg"]="crunchy-lat-verde-450gr.jpg"
MAP["CRUNCHY LATA 200GR (25.000).jpg"]="crunchy-lata-200gr.jpg"
MAP["CRUNCHY LT VERDE 170GR (25.000) .jpg"]="crunchy-lt-verde-170gr.jpg"
MAP["CRUNCHY MIX.jpg"]="crunchy-mix.jpg"
MAP["CRUNCHY SESAME.jpg"]="crunchy-sesame.jpg"
MAP["CRUNCHY TARRO 200GR (25.000) .jpg"]="crunchy-tarro-200gr.jpg"
MAP["CRUNCHY TARRO 200GR (25.000)  (2).jpg"]="crunchy-tarro-200gr.jpg"
MAP["CRUNCHY VERDE PINANTE (55.000).jpg"]="crunchy-verde-pinante.jpg"
MAP["CTUNCHY BITES 80GR (15.000) .jpg"]="ctunchy-bites-80gr.jpg"
MAP["DATIL LIBRA(45.000).jpg"]="datil-libra.jpg"
MAP["DATIL RELLENO(100.000).jpg"]="datil-relleno.jpg"
MAP["DATILES KILO (90.000) .jpg"]="datiles-kilo.jpg"
MAP["EMPANADA CARNE (29.000) .jpg"]="empanada-carne.jpg"
MAP["EMPANADA CARNE CON LABNEH (29.000) .jpg"]="empanada-carne-con-labneh.jpg"
MAP["EMPANADA DE ARISH (22.000).jpg"]="empanada-de-arish.jpg"
MAP["EMPANADA DE ESPINACA (24.000).jpg"]="empanada-de-espinaca.jpg"
MAP["EMPANADA DE POLLO (22.000) .jpg"]="empanada-de-pollo.jpg"
MAP["EMPANADA PAPA Y CARNE (29.000).jpg"]="empanada-papa-y-carne.jpg"
MAP["ESCENCIA_CHOCOLATE_MENTA.jpg"]="escencia-chocolate-menta.jpg"
MAP["ESCENCIA_COCO_BLUEBBERRY.jpg"]="escencia-coco-bluebberry.jpg"
MAP["ESPECIAS 7 PIMIENTA 454GR (.jpg"]="especias-7-pimienta-454gr.jpg"
MAP["ESPECIAS FALAFEL 454GR (70.000) .jpg"]="especias-falafel-454gr.jpg"
MAP["ESPECIAS KEBBE454GR (70.000) .jpg"]="especias-kebbe454gr.jpg"
MAP["etera Clásica de Acero Inoxidable Pulido.jpg"]="etera-cl-sica-de-acero-inoxidable-pulido.jpg"
MAP["FALAFEL (20.000) .jpg"]="falafel.jpg"
MAP["GALLETAS MAMOUL.jpg"]="galletas-mamoul.jpg"
MAP["GARBANZO AMARILLO (12.000) .jpg"]="garbanzo-amarillo.jpg"
MAP["GHRAYBEH (14.000).jpg"]="ghraybeh.jpg"
MAP["HABAS LATA 400GR (7.000) .jpg"]="habas-lata-400gr.jpg"
MAP["Halva con pistacho Al Nakhil.jpg"]="halva-con-pistacho-al-nakhil.jpg"
MAP["Halva original Al Nakhil.jpg"]="halva-original-al-nakhil.jpg"
MAP["Halva original Al NakhiLL grande.jpg"]="halva-original-al-nakhill-grande.jpg"
MAP["Halva original sin azúcar.jpg"]="halva-original-sin-az-car.jpg"
MAP["HIERBABUENA SECA 200GR (55.000) .jpg"]="hierbabuena-seca-200gr.jpg"
MAP["HIERBAMATE (16.000) .jpg"]="hierbamate.jpg"
MAP["HIERBAMATE(16.000).jpg"]="hierbamate.jpg"
MAP["HIGOS SECOS 125GR (17.000) .jpg"]="higos-secos-125gr.jpg"
MAP["HUMMUS EN LATA.jpg"]="hummus-en-lata.jpg"
MAP["JABON_OLIVA_y_ TE VERDE.jpg"]="jabon-oliva-y-te-verde.jpg"
MAP["Juego de Café Porcelana Árbol de Oro.jpg"]="juego-de-caf-porcelana-rbol-de-oro.jpg"
MAP["Juego de Café Porcelana Blanco Puro con Filo Dorado.jpg"]="juego-de-caf-porcelana-blanco-puro-con-filo-dorado.jpg"
MAP["Juego de Café Porcelana Espiral Óptica Gold.jpg"]="juego-de-caf-porcelana-espiral-ptica-gold.jpg"
MAP["Juego de Café Porcelana Labrada Crema.jpg"]="juego-de-caf-porcelana-labrada-crema.jpg"
MAP["Juego de Café Porcelana Labrada Gris.jpg"]="juego-de-caf-porcelana-labrada-gris.jpg"
MAP["Juego de Café Porcelana Mandala Étnico y Oro.jpg"]="juego-de-caf-porcelana-mandala-tnico-y-oro.jpg"
MAP["Juego de Café Porcelana Mosaico Geométrico Gold.jpg"]="juego-de-caf-porcelana-mosaico-geom-trico-gold.jpg"
MAP["Juego de Café Porcelana Multicolor (1).jpg"]="juego-de-caf-porcelana-multicolor.jpg"
MAP["Juego de Café Porcelana Multicolor (4).jpg"]="juego-de-caf-porcelana-multicolor.jpg"
MAP["Juego de Café Porcelana Relieve Pétalo Blanco.jpg"]="juego-de-caf-porcelana-relieve-p-talo-blanco.jpg"
MAP["labne(38.000).jpg"]="labne.jpg"
MAP["LENTEJAS ROJAS (22.000) .jpg"]="lentejas-rojas.jpg"
MAP["MANGUERA (30.000) .jpg"]="manguera.jpg"
MAP["MANI CONFITADO CON MIEL.jpg"]="mani-confitado-con-miel.jpg"
MAP["MELAZA_GRANADA.jpg"]="melaza-granada.jpg"
MAP["MELAZA_GRANADA_500ML.jpg"]="melaza-granada-500ml.jpg"
MAP["MELAZA_GRANADA_AL_KASSER.jpg"]="melaza-granada-al-kasser.jpg"
MAP["MELAZA_GRANADINA.jpg"]="melaza-granadina.jpg"
MAP["MERMELADA_ALBARICOQUE_LIGHT.jpg"]="mermelada-albaricoque-light.jpg"
MAP["MOLDE_KIBBEH.jpg"]="molde-kibbeh.jpg"
MAP["MOLDE_MAAMOUL_ALARGADO.jpg"]="molde-maamoul-alargado.jpg"
MAP["MOLDE_MAAMOUL_PEQUEÑO.jpg"]="molde-maamoul-peque-o.jpg"
MAP["MOLDE_PARA_MAAOUL.jpg"]="molde-para-maaoul.jpg"
MAP["MUG CERAMICA DORADO.jpg"]="mug-ceramica-dorado.jpg"
MAP["NUEZ 250(30.000).jpg"]="nuez-250.jpg"
MAP["ORGANIZADOR DE CUCHARAS PLATEADO.jpg"]="organizador-de-cucharas-plateado.jpg"
MAP["ORGANIZADOR_CUCHARAS_DORADO.jpg"]="organizador-cucharas-dorado.jpg"
MAP["PAN AJONJOLI X3(6.000).jpg"]="pan-ajonjoli-x3.jpg"
MAP["PAN ARABE(8.000).jpg"]="pan-arabe.jpg"
MAP["PAN CON ZAATAR(7.000).jpg"]="pan-con-zaatar.jpg"
MAP["PAN INTEGRAL(7.000).jpg"]="pan-integral.jpg"
MAP["PAN MINI (7.000).jpg"]="pan-mini.jpg"
MAP["PAN TOSTADO(5.000).jpg"]="pan-tostado.jpg"
MAP["PEPINOS_SILVESTRES_1000G.jpg"]="pepinos-silvestres-1000g.jpg"
MAP["piñones(85.000).jpg"]="pi-ones.jpg"
MAP["PROCESADOR_ALIMENTOS.jpg"]="procesador-alimentos.jpg"
MAP["QUESO PUCK.jpg"]="queso-puck.jpg"
MAP["REMOLACHA ENCUTIDA.jpg"]="remolacha-encutida.jpg"
MAP["SAL DE LIMON LB (20.000) .jpg"]="sal-de-limon-lb.jpg"
MAP["SEMOLA FINA(22.000).jpg"]="semola-fina.jpg"
MAP["SEMOLA GRUESA (22.000).jpg"]="semola-gruesa.jpg"
MAP["SET DE CAFE ARBOL DE LA VIDA.jpg"]="set-de-cafe-arbol-de-la-vida.jpg"
MAP["SET DE CAFE BLANCO BASE ANILLOS DORADOS.jpg"]="set-de-cafe-blanco-base-anillos-dorados.jpg"
MAP["SET DE CAFE BLANCO BASE ANILLOS PLATEADO.jpg"]="set-de-cafe-blanco-base-anillos-plateado.jpg"
MAP["SET DE CAFE HOJAS DE ORO.jpg"]="set-de-cafe-hojas-de-oro.jpg"
MAP["SET DE CAFE TAZAS BLANCAS BASE DE ANILLOS DORADOS.jpg"]="set-de-cafe-tazas-blancas-base-de-anillos-dorados.jpg"
MAP["SET DE TAZADA NEGRO MATE.jpg"]="set-de-tazada-negro-mate.jpg"
MAP["SET_BROCHETAS_BARBACOA.jpg"]="set-brochetas-barbacoa.jpg"
MAP["SIROPE_ALBARICOQUE.jpg"]="sirope-albaricoque.jpg"
MAP["SIROPE_ALMENDRA.jpg"]="sirope-almendra.jpg"
MAP["SIROPE_GRANADINA.jpg"]="sirope-granadina.jpg"
MAP["SIROPE_JALLAB.jpg"]="sirope-jallab.jpg"
MAP["SIROPE_MORA.jpg"]="sirope-mora.jpg"
MAP["Surtido de Dulces Árabes.jpg"]="surtido-de-dulces-rabes.jpg"
MAP["TABACO_DOS_MANZANAS.jpg"]="tabaco-dos-manzanas.jpg"
MAP["TAHINE 454GR (25.000) .jpg"]="tahine-454gr.jpg"
MAP["TAHINE 907GR (50.000) .jpg"]="tahine-907gr.jpg"
MAP["TAHINE CON GARBANZO(12.000).jpg"]="tahine-con-garbanzo.jpg"
MAP["TAHINE KILO(50.000).jpg"]="tahine-kilo.jpg"
MAP["tahine libra(25.000).jpg"]="tahine-libra.jpg"
MAP["TE CEYLON 160 (25.000).jpg"]="te-ceylon-160.jpg"
MAP["TE CEYLON 400GR(45.000).jpg"]="te-ceylon-400gr.jpg"
MAP["TE RAWVI.jpg"]="te-rawvi.jpg"
MAP["Tetera de Vidrio Borosilicato Labrado con Detalles Dorados.jpg"]="tetera-de-vidrio-borosilicato-labrado-con-detalles-dorados.jpg"
MAP["TINTE_HENNA_ROJA.jpg"]="tinte-henna-roja.jpg"
MAP["TRIGO ENTERO (15.000) .jpg"]="trigo-entero.jpg"
MAP["TURRON DE AJONJOLI.jpg"]="turron-de-ajonjoli.jpg"
MAP["VINAGRE_MANZANA.jpg"]="vinagre-manzana.jpg"
MAP["VINAGRE_MANZANA_CASERO.jpg"]="vinagre-manzana-casero.jpg"
MAP["VINAGRE_UVA.jpg"]="vinagre-uva.jpg"
MAP["ZAATAR 500GR (45.000) .jpg"]="zaatar-500gr.jpg"
MAP["ZWAN CAENE 850(55.000).jpg"]="zwan-caene-850.jpg"
MAP["ZWAN CARNE 340(30.000).jpg"]="zwan-carne-340.jpg"
MAP["ZWAN POLLO (30.000).jpg"]="zwan-pollo.jpg"
MAP["ZWAN POLLO 850GR (55.000).jpg"]="zwan-pollo-850gr.jpg"

# Crear bucket (si no existe)
echo "🪣  Verificando bucket '$BUCKET'..."
curl -s -X POST \
  "${SUPABASE_URL}/storage/v1/bucket" \
  -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"${BUCKET}\",\"name\":\"${BUCKET}\",\"public\":true}" \
  > /dev/null

echo ""
echo "📤 Comprimiendo y subiendo imágenes..."
echo "============================================"

OK=0
FAIL=0
SKIP=0

for src_name in "${!MAP[@]}"; do
  dest_name="${MAP[$src_name]}"
  src_path="${SOURCE_DIR}/${src_name}"
  tmp_path="${TMP_DIR}/${dest_name}"

  if [ ! -f "$src_path" ]; then
    echo "⚠️  No encontrado en USB: $src_name"
    ((SKIP++))
    continue
  fi

  # Comprimir con ImageMagick: max 1200px ancho/alto, calidad 82%
  convert "$src_path" -resize "1200x1200>" -strip -define jpeg:quality=82 "$tmp_path" 2>/dev/null
  if [ $? -ne 0 ]; then
    echo "❌ Error al comprimir: $src_name"
    ((FAIL++))
    continue
  fi

  HTTP_CODE=$(curl -s -o /tmp/curl_out.txt -w "%{http_code}" \
    -X POST \
    "${SUPABASE_URL}/storage/v1/object/${BUCKET}/products/${dest_name}" \
    -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
    -H "Content-Type: image/jpeg" \
    -H "x-upsert: true" \
    --data-binary "@${tmp_path}")

  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo "✅ $dest_name"
    ((OK++))
  else
    BODY=$(cat /tmp/curl_out.txt)
    echo "❌ $dest_name  (HTTP $HTTP_CODE) → $BODY"
    ((FAIL++))
  fi

  # Limpiar temporal
  rm -f "$tmp_path"
done

echo "============================================"
echo "✅ Subidas: $OK"
echo "⚠️  No encontradas: $SKIP"
echo "❌ Errores: $FAIL"
echo ""
echo "URL base:"
echo "${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/products/"
