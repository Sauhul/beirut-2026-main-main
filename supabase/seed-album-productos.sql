-- ============================================================
-- SEED: Productos del almacén (generado automáticamente)
-- Fecha: 2026-09-01
-- Total: 77 productos
-- ============================================================

-- Categorías
INSERT INTO public.categories (id, slug, name, description, sort_order)
VALUES ('cat-1', 'frutos-secos', 'Frutos Secos y Frutas Secas', 'Almendras, nueces, dátiles, higos y más', 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, slug, name, description, sort_order)
VALUES ('cat-2', 'panaderia', 'Panadería', 'Pan árabe, pita, tostado, empanadas', 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, slug, name, description, sort_order)
VALUES ('cat-3', 'lacteos', 'Lácteos y Derivados', 'Labneh, queso y productos lácteos', 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, slug, name, description, sort_order)
VALUES ('cat-4', 'cafe-te', 'Café y Té', 'Café molido, granos y té', 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, slug, name, description, sort_order)
VALUES ('cat-5', 'especias-hierbas', 'Especias y Hierbas', 'Especias, hierbas aromáticas y sazonadores', 5)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, slug, name, description, sort_order)
VALUES ('cat-6', 'legumbres-granos', 'Legumbres y Granos', 'Lentejas, garbanzos, bulgur, semola', 6)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, slug, name, description, sort_order)
VALUES ('cat-7', 'snacks', 'Snacks', 'Crunchy, chips y snacks', 7)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, slug, name, description, sort_order)
VALUES ('cat-8', 'preparados', 'Productos Preparados', 'Empanadas, falafel, baklawa', 8)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, slug, name, description, sort_order)
VALUES ('cat-9', 'salsas-condimentos', 'Salsas y Condimentos', 'Tahine, zaatar, sal de limón', 9)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- Productos
INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'albaricoque-seco', 'Albaricoque Seco', 'Albaricoque Seco - Producto del almacén Beirut', 25000, 'unidad', 'products/albaricoque-seco.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'almendra-media-l', 'Almendra Media L', 'Almendra Media L - Producto del almacén Beirut', 20000, 'unidad', 'products/almendra-media-l.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'castania-azul-lat', 'Castania Azul Lat', 'Castania Azul Lat - Producto del almacén Beirut', 50000, 'unidad', 'products/castania-azul-lat.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'castania-sin-sal', 'Castania Sin Sal', 'Castania Sin Sal - Producto del almacén Beirut', 75000, 'unidad', 'products/castania-sin-sal.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'castania-verde-lat', 'Castania Verde Lat', 'Castania Verde Lat - Producto del almacén Beirut', 65000, 'unidad', 'products/castania-verde-lat.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'chanclis', 'Chanclis', 'Chanclis - Producto del almacén Beirut', 38000, 'unidad', 'products/chanclis.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'datil-libra', 'Datil', 'Datil - Producto del almacén Beirut', 45000, 'libra', 'products/datil-libra.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'datil-relleno', 'Datil Relleno', 'Datil Relleno - Producto del almacén Beirut', 100000, 'unidad', 'products/datil-relleno.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'datiles-kilo', 'Datiles', 'Datiles - Producto del almacén Beirut', 90000, 'kilo', 'products/datiles-kilo.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'ghraybeh', 'Ghraybeh', 'Ghraybeh - Producto del almacén Beirut', 14000, 'unidad', 'products/ghraybeh.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'higos-secos-125gr', 'Higos Secos', 'Higos Secos - Producto del almacén Beirut', 17000, '125GR', 'products/higos-secos-125gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'manguera', 'Manguera', 'Manguera - Producto del almacén Beirut', 30000, 'unidad', 'products/manguera.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'nuez-250', 'Nuez 250', 'Nuez 250 - Producto del almacén Beirut', 30000, 'unidad', 'products/nuez-250.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'pinones', 'Piñones', 'Piñones - Producto del almacén Beirut', 85000, 'unidad', 'products/pinones.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'zaatar-500gr', 'Zaatar', 'Zaatar - Producto del almacén Beirut', 45000, '500GR', 'products/zaatar-500gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'zwan-caene-850', 'Zwan Caene 850', 'Zwan Caene 850 - Producto del almacén Beirut', 55000, 'unidad', 'products/zwan-caene-850.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'zwan-carne-340', 'Zwan Carne 340', 'Zwan Carne 340 - Producto del almacén Beirut', 30000, 'unidad', 'products/zwan-carne-340.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'zwan-pollo', 'Zwan Pollo', 'Zwan Pollo - Producto del almacén Beirut', 30000, 'unidad', 'products/zwan-pollo.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-1', 'zwan-pollo-850gr', 'Zwan Pollo', 'Zwan Pollo - Producto del almacén Beirut', 55000, '850GR', 'products/zwan-pollo-850gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'empanada-carne', 'Empanada Carne', 'Empanada Carne - Producto del almacén Beirut', 29000, 'unidad', 'products/empanada-carne.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'empanada-carne-con-labneh', 'Empanada Carne Con Labneh', 'Empanada Carne Con Labneh - Producto del almacén Beirut', 29000, 'unidad', 'products/empanada-carne-con-labneh.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'empanada-de-arish', 'Empanada De Arish', 'Empanada De Arish - Producto del almacén Beirut', 22000, 'unidad', 'products/empanada-de-arish.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'empanada-de-espinaca', 'Empanada De Espinaca', 'Empanada De Espinaca - Producto del almacén Beirut', 24000, 'unidad', 'products/empanada-de-espinaca.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'empanada-de-pollo', 'Empanada De Pollo', 'Empanada De Pollo - Producto del almacén Beirut', 22000, 'unidad', 'products/empanada-de-pollo.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'empanada-papa-y-carne', 'Empanada Papa Y Carne', 'Empanada Papa Y Carne - Producto del almacén Beirut', 29000, 'unidad', 'products/empanada-papa-y-carne.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'pan-ajonjoli-x3', 'Pan Ajonjoli X3', 'Pan Ajonjoli X3 - Producto del almacén Beirut', 6000, 'unidad', 'products/pan-ajonjoli-x3.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'pan-arabe', 'Pan Arabe', 'Pan Arabe - Producto del almacén Beirut', 8000, 'unidad', 'products/pan-arabe.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'pan-con-zaatar', 'Pan Con Zaatar', 'Pan Con Zaatar - Producto del almacén Beirut', 7000, 'unidad', 'products/pan-con-zaatar.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'pan-integral', 'Pan Integral', 'Pan Integral - Producto del almacén Beirut', 7000, 'unidad', 'products/pan-integral.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'pan-mini', 'Pan Mini', 'Pan Mini - Producto del almacén Beirut', 7000, 'unidad', 'products/pan-mini.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-2', 'pan-tostado', 'Pan Tostado', 'Pan Tostado - Producto del almacén Beirut', 5000, 'unidad', 'products/pan-tostado.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-3', 'labne', 'Labne', 'Labne - Producto del almacén Beirut', 38000, 'unidad', 'products/labne.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-4', 'cafe-maatouk-450gr', 'Cafe Maatouk', 'Cafe Maatouk - Producto del almacén Beirut', 55000, '450GR', 'products/cafe-maatouk-450gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-4', 'cafe-maatuk-200gr', 'Cafe Maatuk', 'Cafe Maatuk - Producto del almacén Beirut', 30000, '200GR', 'products/cafe-maatuk-200gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-4', 'cafe-najjar-clasic', 'Cafe Najjar Clasic', 'Cafe Najjar Clasic - Producto del almacén Beirut', 50000, 'unidad', 'products/cafe-najjar-clasic.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-4', 'cafe-najjar-con-cardamomo', 'Cafe Najjar Con Cardamomo', 'Cafe Najjar Con Cardamomo - Producto del almacén Beirut', 27000, 'unidad', 'products/cafe-najjar-con-cardamomo.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-4', 'te-ceylon-400gr', 'Te Ceylon', 'Te Ceylon - Producto del almacén Beirut', 45000, '400GR', 'products/te-ceylon-400gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-4', 'te-ceylon-160', 'Te Ceylon 160', 'Te Ceylon 160 - Producto del almacén Beirut', 25000, 'unidad', 'products/te-ceylon-160.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-5', 'especias-7-pimienta-454gr', 'Especias 7 Pimienta', 'Especias 7 Pimienta - Producto del almacén Beirut', 70000, '454GR', 'products/especias-7-pimienta-454gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-5', 'especias-falafel-454gr', 'Especias Falafel', 'Especias Falafel - Producto del almacén Beirut', 70000, '454GR', 'products/especias-falafel-454gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-5', 'especias-kebbe454gr', 'Especias Kebbe454gr', 'Especias Kebbe454gr - Producto del almacén Beirut', 70000, 'unidad', 'products/especias-kebbe454gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-5', 'hierbabuena-seca-200gr', 'Hierbabuena Seca', 'Hierbabuena Seca - Producto del almacén Beirut', 55000, '200GR', 'products/hierbabuena-seca-200gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-5', 'hierbamate', 'Hierbamate', 'Hierbamate - Producto del almacén Beirut', 16000, 'unidad', 'products/hierbamate.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-5', 'hierbamate-2', 'Hierbamate', 'Hierbamate - Producto del almacén Beirut', 16000, 'unidad', 'products/hierbamate-2.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-6', 'bulgur-trigo-blanco-1', 'Bulgur Trigo Blanco 1', 'Bulgur Trigo Blanco 1 - Producto del almacén Beirut', 16000, 'unidad', 'products/bulgur-trigo-blanco-1.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-6', 'garbanzo-amarillo', 'Garbanzo Amarillo', 'Garbanzo Amarillo - Producto del almacén Beirut', 12000, 'unidad', 'products/garbanzo-amarillo.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-6', 'habas-lata-400gr', 'Habas Lata', 'Habas Lata - Producto del almacén Beirut', 7000, '400GR', 'products/habas-lata-400gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-6', 'lentejas-rojas', 'Lentejas Rojas', 'Lentejas Rojas - Producto del almacén Beirut', 22000, 'unidad', 'products/lentejas-rojas.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-6', 'semola-fina', 'Semola Fina', 'Semola Fina - Producto del almacén Beirut', 22000, 'unidad', 'products/semola-fina.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-6', 'semola-gruesa', 'Semola Gruesa', 'Semola Gruesa - Producto del almacén Beirut', 22000, 'unidad', 'products/semola-gruesa.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-6', 'tahine-con-garbanzo', 'Tahine Con Garbanzo', 'Tahine Con Garbanzo - Producto del almacén Beirut', 12000, 'unidad', 'products/tahine-con-garbanzo.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-6', 'trigo-entero', 'Trigo Entero', 'Trigo Entero - Producto del almacén Beirut', 15000, 'unidad', 'products/trigo-entero.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-170gr', 'Crunchy', 'Crunchy - Producto del almacén Beirut', 30000, '170GR', 'products/crunchy-170gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-bite-80gr', 'Crunchy Bite', 'Crunchy Bite - Producto del almacén Beirut', 15000, '80GR', 'products/crunchy-bite-80gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-bites-80gr', 'Crunchy Bites', 'Crunchy Bites - Producto del almacén Beirut', 15000, '80GR', 'products/crunchy-bites-80gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-bites-80gr-2', 'Crunchy Bites', 'Crunchy Bites - Producto del almacén Beirut', 15000, '80GR', 'products/crunchy-bites-80gr-2.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-lat-morada-170gr', 'Crunchy Lat Morada', 'Crunchy Lat Morada - Producto del almacén Beirut', 20000, '170GR', 'products/crunchy-lat-morada-170gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-lat-morada-340gr', 'Crunchy Lat Morada', 'Crunchy Lat Morada - Producto del almacén Beirut', 35000, '340GR', 'products/crunchy-lat-morada-340gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-lat-morada', 'Crunchy Lat Morada', 'Crunchy Lat Morada - Producto del almacén Beirut', 45000, 'unidad', 'products/crunchy-lat-morada.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-lat-roja-340gr', 'Crunchy Lat Roja', 'Crunchy Lat Roja - Producto del almacén Beirut', 60000, '340GR', 'products/crunchy-lat-roja-340gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-lat-verde-450gr', 'Crunchy Lat Verde', 'Crunchy Lat Verde - Producto del almacén Beirut', 55000, '450GR', 'products/crunchy-lat-verde-450gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-lata-200gr', 'Crunchy Lata', 'Crunchy Lata - Producto del almacén Beirut', 25000, '200GR', 'products/crunchy-lata-200gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-lt-verde-170gr', 'Crunchy Lt Verde', 'Crunchy Lt Verde - Producto del almacén Beirut', 25000, '170GR', 'products/crunchy-lt-verde-170gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-tarro-200gr', 'Crunchy Tarro', 'Crunchy Tarro - Producto del almacén Beirut', 25000, '200GR', 'products/crunchy-tarro-200gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-tarro-200gr-2', 'Crunchy Tarro', 'Crunchy Tarro - Producto del almacén Beirut', 25000, '200GR', 'products/crunchy-tarro-200gr-2.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'crunchy-verde-pinante', 'Crunchy Verde Pinante', 'Crunchy Verde Pinante - Producto del almacén Beirut', 55000, 'unidad', 'products/crunchy-verde-pinante.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-7', 'ctunchy-bites-80gr', 'Ctunchy Bites', 'Ctunchy Bites - Producto del almacén Beirut', 15000, '80GR', 'products/ctunchy-bites-80gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-8', 'baklawa-kilo', 'Baklawa', 'Baklawa - Producto del almacén Beirut', 180000, 'kilo', 'products/baklawa-kilo.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-8', 'baklawa-hojaldre', 'Baklawa Hojaldre', 'Baklawa Hojaldre - Producto del almacén Beirut', 15000, 'unidad', 'products/baklawa-hojaldre.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-8', 'bordon', 'Bordon', 'Bordon - Producto del almacén Beirut', 25000, 'unidad', 'products/bordon.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-8', 'falafel', 'Falafel', 'Falafel - Producto del almacén Beirut', 20000, 'unidad', 'products/falafel.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-9', 'berenjena-con-tahine', 'Berenjena Con Tahine', 'Berenjena Con Tahine - Producto del almacén Beirut', 12000, 'unidad', 'products/berenjena-con-tahine.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-9', 'sal-de-limon-libra', 'Sal De Limon', 'Sal De Limon - Producto del almacén Beirut', 20000, 'libra', 'products/sal-de-limon-libra.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-9', 'tahine-454gr', 'Tahine', 'Tahine - Producto del almacén Beirut', 25000, '454GR', 'products/tahine-454gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-9', 'tahine-907gr', 'Tahine', 'Tahine - Producto del almacén Beirut', 50000, '907GR', 'products/tahine-907gr.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-9', 'tahine-kilo', 'Tahine', 'Tahine - Producto del almacén Beirut', 50000, 'kilo', 'products/tahine-kilo.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

INSERT INTO public.products (category_id, slug, name, description, price, unit, image_url, featured, in_stock)
VALUES ('cat-9', 'tahine-libra', 'Tahine', 'Tahine - Producto del almacén Beirut', 25000, 'libra', 'products/tahine-libra.jpg', false, true)
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, unit = EXCLUDED.unit, image_url = EXCLUDED.image_url;

