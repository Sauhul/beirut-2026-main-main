-- Primera tanda de nombres verificados con las fotos del catálogo.
-- Los nombres y las fotos anteriores protegen ediciones posteriores.
update public.products as product
set name = reviewed.new_name
from (
  values
    ('aceite-oliva-3litros', 'ACEITE DE OLIVA 3 LITROS', 'ACEITE_OLIVA_3LITROS.jpg', 'Aceite de oliva Koura (3 L)'),
    ('aceite-oliva-koura', 'ACEITE OLIVA KOURA', 'ACEITE_OLIVA_KOURA.jpg', 'Aceite de oliva Koura en botella'),
    ('aceitunas-verdes-encurtidas', 'ACEITUNAS VERDES ENCURTIDAS', 'ACEITUNAS_VERDES_ENCURTIDAS.jpg', 'Aceitunas verdes encurtidas Beirut'),
    ('agua-azahar', 'AGUA AZAHAR', 'AGUA_AZAHAR.jpg', 'Agua de azahar'),
    ('agua-rosas-300ml', 'AGUA ROSAS 300ML', 'AGUA_ROSAS_300ML.jpg', 'Agua de rosas (300 ml)'),
    ('agua-rosas-750ml', 'AGUA ROSAS 750ML', 'AGUA_rosas_750ml.jpg', 'Agua de rosas (750 ml)'),
    ('albaricoque-seco', 'ALBARICOQUE SECO', 'ALBARICOQUE%20SECO%20(25.000)%20.jpg', 'Albaricoques secos Beirut'),
    ('altramuces-secos', 'ALTRAMUCES SECOS', 'ALTRAMUCES%20SECOS.jpg', 'Altramuces secos Gardenia'),
    ('azahar-agua-260ml', 'AZAHAR AGUA 260ML', 'AZAHAR_AGUA_260ML.jpg', 'Agua de azahar (260 ml)'),
    ('berenjena-con-tahine', 'BERENJENA CON TAHINE', 'BERENJENA%20CON%20TAHINE(12.000).jpg', 'Crema de berenjena con tahini Chtoura Garden'),
    ('bordon', 'BORDON', 'BORDON%20(25.000).jpg', 'Carne de res en conserva Target (corned beef)'),
    ('bulgur-trigo-blanco-1', 'BULGUR TRIGO BLANCO 1', 'BULGUR%20TRIGO%20BLANCO%201%20(16.000)%20.jpg', 'Bulgur de trigo blanco Vea n.º 1'),
    ('cafe-maatouk-450gr', 'CAFE MAATOUK 450GR', 'CAFE%20MAATOUK%20450GR%20%20(55.000).jpg', 'Café Maatouk (450 g)'),
    ('cafe-najjar-clasic', 'CAFE NAJJAR CLASIC', 'CAFE%20NAJJAR%20CLASIC(50.000).jpg', 'Café Najjar clásico'),
    ('cafe-najjar-con-cardamomo', 'CAFE NAJJAR CON CARDAMOMO', 'CAFE%20NAJJAR%20CON%20CARDAMOMO(27.000).jpg', 'Café Najjar con cardamomo'),
    ('castania-azul-lat', 'CASTANIA AZUL LAT', 'CASTANIA%20AZUL%20LAT%20(50.000).jpg', 'Mezcla de frutos secos Castania en lata azul'),
    ('castania-sin-sal', 'CASTANIA SIN SAL', 'CASTANIA%20SIN%20SAL(75.000).jpg', 'Mezcla de frutos secos Castania sin sal'),
    ('castania-verde-lat', 'CASTANIA VERDE LAT', 'CASTANIA%20VERDE%20LAT(65.000).jpg', 'Mezcla de frutos secos Castania en lata verde'),
    ('crunchy-lat-morada', 'CRUNCHY LAT MORADA', 'CRUNCHY%20LAT%20MORADA(45.000).jpg', 'Mezcla de frutos secos Crunchy Extra'),
    ('crunchy-lat-verde-450gr', 'CRUNCHY LAT VERDE 450GR', 'CRUNCHY%20LAT%20VERDE%20450GR%20(55.000)%20.jpg', 'Mezcla de frutos secos Crunchy Supreme (450 g)')
) as reviewed(slug, previous_name, image_filename, new_name)
where product.slug = reviewed.slug
  and product.name = reviewed.previous_name
  and regexp_replace(split_part(product.image_url, '?', 1), '^.*/', '') = reviewed.image_filename
returning product.slug, product.name;
