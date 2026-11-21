-- Precios de Beirut en pesos colombianos enteros (COP).
-- Los importes históricos provienen del álbum y las correcciones documentadas de Beirut.
-- Las estimaciones se basan en presentaciones comparables de comercios colombianos.
-- Referencias: https://beirutmarket.co/tienda/ y https://delikatessenlibanes.com/tienda/
-- Vajilla: https://cristalerialamejor.com.co/collections/set-s-de-te-y-cafe
-- Si un producto se editó desde la auditoría, cancela el lote para conservar esa edición.
begin;

create temporary table reviewed_catalog_prices (
  id uuid primary key,
  slug text not null unique,
  audited_price integer not null,
  price_cop integer not null check (price_cop > 0)
) on commit drop;

-- Importes documentados por el almacén.
insert into reviewed_catalog_prices (id, slug, audited_price, price_cop) values
    ('4dcb2f37-d2a5-4ba6-a955-024cdcb52fcd', 'albaricoque-seco', 25, 25000),
    ('6776073a-28bb-482c-b271-cd91e6b1095b', 'almendra-media-l', 20, 20000),
    ('da6edcbd-f73b-41b0-a19e-dfadb7866ca8', 'baklawa-hojaldre', 15, 15000),
    ('b34c6b05-1da9-488f-84bb-bef4faef7ddb', 'baklawa-kilo', 180, 180000),
    ('ed250832-e0e5-42a6-a7b2-e42f0486dd66', 'berenjena-con-tahine', 12, 12000),
    ('c753a703-5a67-469b-982f-4f6809b2c7d5', 'bordon', 25, 25000),
    ('10b8fc4d-0ed4-41e8-bf9e-021d3ed21185', 'bulgur-trigo-blanco-1', 16, 16000),
    ('45d74857-7d7f-4ff3-b2f0-a388b35d3f1f', 'cafe-maatouk-450gr', 55, 55000),
    ('ab81ebb5-397f-4c56-b589-12a856994667', 'cafe-maatuk-200gr', 30, 30000),
    ('e142e369-2fb5-4a3d-a263-06dd09d97b09', 'cafe-najjar-clasic', 50, 50000),
    ('5f9d5135-ab37-4e0c-a8f9-9f75246881d9', 'cafe-najjar-con-cardamomo', 27, 27000),
    ('0c8645e8-4af2-40c3-aeeb-44ba1dc53689', 'castania-azul-lat', 50, 50000),
    ('edd42e0b-410b-4271-9731-6c2d22648748', 'castania-sin-sal', 75, 75000),
    ('b8643979-ff34-4883-bafe-bea94ac8e642', 'castania-verde-lat', 65, 65000),
    ('ceebbb5c-e0a1-442e-89b4-c4e084b9da75', 'chanclis', 38000, 38000),
    ('77409396-d7fb-4267-9dae-7d0797fa2eb2', 'crunchy-170gr', 30, 30000),
    ('adaea87d-71a4-4af8-947b-948dd5b90579', 'crunchy-bite-80gr', 15, 15000),
    ('8fb29f50-62fc-4ab2-966c-b0ca7fa88d56', 'crunchy-bites-80gr', 15, 15000),
    ('d350f3f7-b036-4d0f-9797-d3503ba49159', 'crunchy-lat-morada', 45, 45000),
    ('f1c9acb5-56e3-453f-80e3-0b28478da4b9', 'crunchy-lat-morada-170gr', 20, 20000),
    ('ce7c3ad2-d139-41ba-a8f7-7d26f5c53267', 'crunchy-lat-morada-340gr', 35, 35000),
    ('9e909cd6-6db1-4d2e-856d-204243328a7f', 'crunchy-lat-roja-340gr', 60, 60000),
    ('ed3c4016-7ac0-4b55-b7bc-846d84e63f70', 'crunchy-lat-verde-450gr', 55, 55000),
    ('2f31015c-55ff-4d92-a896-34ef798abf52', 'crunchy-lata-200gr', 25, 25000),
    ('4a3047c7-4c39-4128-9b8f-4590429ceeab', 'crunchy-lt-verde-170gr', 25, 25000),
    ('f7d18255-2391-429a-8cab-bf4456182a87', 'crunchy-tarro-200gr', 25, 25000),
    ('5e755e41-eb90-4279-8bde-07e3fd27f32b', 'crunchy-verde-pinante', 55, 55000),
    ('3a454c49-d976-4e79-ac57-b1580008699d', 'ctunchy-bites-80gr', 15, 15000),
    ('12fdce69-1e89-49ab-baa9-a63253e33240', 'datil-libra', 45, 45000),
    ('1082a906-a2f1-4006-917e-001c6817c914', 'datil-relleno', 100, 100000),
    ('bf4c29ab-d060-4e11-b63b-6b0ff4b4a070', 'datiles-kilo', 90, 90000),
    ('a9a8c78f-c0a7-43f4-83c7-e4eeb05606cf', 'empanada-carne', 29, 29000),
    ('73145d7d-98b2-463e-8131-f1ba564d004b', 'empanada-carne-con-labneh', 29, 29000),
    ('9b1337d1-04c0-44f2-8d38-14526f8e6147', 'empanada-de-arish', 22, 22000),
    ('cea4c7ed-e69a-47e1-8a7c-dc35a5d65394', 'empanada-de-espinaca', 24, 24000),
    ('8acfac81-64ca-4e84-9469-f623efcacb19', 'empanada-de-pollo', 22, 22000),
    ('bbd9199a-89cf-42c0-bcdd-15f735d01250', 'empanada-papa-y-carne', 29, 29000),
    ('a2870c32-77e1-4e71-b535-a6b607c08694', 'especias-7-pimienta-454gr', 84253, 70000),
    ('fc5f040f-6772-47b4-bad4-c1c041f53a29', 'especias-falafel-454gr', 70, 70000),
    ('a79d7791-b19a-4e35-9879-bf79a06ac755', 'especias-kebbe454gr', 70, 70000),
    ('2dacf8be-7863-4311-8a38-551edc4cd90b', 'falafel', 20, 20000),
    ('58f21d81-fccc-4e8a-94ab-4c22a09eb477', 'garbanzo-amarillo', 12, 12000),
    ('d064f98f-0d85-4e02-8af6-5e08502a980c', 'ghraybeh', 14, 14000),
    ('7cbac9c7-2843-4d52-9f7f-fafb35a82257', 'habas-lata-400gr', 7, 7000),
    ('e3cc798d-28fa-4329-808c-c651ac2486d1', 'hierbabuena-seca-200gr', 55, 55000),
    ('9a202742-5592-422c-a5e6-ccf512e4ca78', 'hierbamate', 16, 16000),
    ('7cafadcc-d9be-43b9-bfb9-4e6986ed7b05', 'higos-secos-125gr', 17, 17000),
    ('fdb221e5-cbf9-4f74-8b56-4d2e36340e00', 'labne', 38, 38000),
    ('8342f2b9-15f5-4eff-807d-381a6768d28b', 'lentejas-rojas', 22, 22000),
    ('5917d644-5aa5-49d3-ae52-5fc314581d2d', 'manguera', 30, 30000),
    ('5199f5ae-8bb6-4d40-9059-6f317665c888', 'nuez-250', 30, 30000),
    ('a0b85331-f55a-4e74-b1f1-ad28b97879c8', 'pan-ajonjoli-x3', 6, 6000),
    ('cf4d28bb-5dfe-49b0-b178-f02a9fb613dc', 'pan-arabe', 8, 8000),
    ('e2ad3fd4-ab05-417a-ad57-2ce61fc048f2', 'pan-con-zaatar', 7, 7000),
    ('b5d2b6a8-e706-4c4d-8c18-62623057d320', 'pan-integral', 7, 7000),
    ('5a3272eb-97a0-49b6-99f8-dca23e94ad53', 'pan-mini', 7, 7000),
    ('b869d144-61e1-4a16-be22-3b6b0cfc65da', 'pan-tostado', 5, 5000),
    ('c1b795d8-0326-4d68-a05d-c9a166ead298', 'pi-ones', 85, 85000),
    ('74d098dd-7c04-4ea6-a9e1-0b8400a33056', 'sal-de-limon-lb', 20, 20000),
    ('b5d24ee7-0cff-49e9-a5c6-168a343cea6a', 'semola-fina', 22, 22000),
    ('06ba4552-f7f6-4577-8b7c-30980c73db68', 'semola-gruesa', 22, 22000),
    ('1df2b2b1-1a79-4912-97a3-704060a3539f', 'tahine-454gr', 25, 25000),
    ('c3754eb7-8051-4548-8c2c-946d82a9efbc', 'tahine-907gr', 50, 50000),
    ('d217d235-cde9-489a-9977-cf8c5a5435b1', 'tahine-con-garbanzo', 12, 12000),
    ('fd33e113-92a8-4a52-b43b-77571074a25b', 'tahine-kilo', 50, 50000),
    ('68d8b94c-527d-4979-9b44-b87cbccbe055', 'tahine-libra', 25, 25000),
    ('a18f13ea-1601-4edb-884c-8adc5f7eb617', 'te-ceylon-160', 25, 25000),
    ('23e525c2-3b20-4688-9b4a-a2c7a9f3f0f8', 'te-ceylon-400gr', 45, 45000),
    ('e0c91015-95fd-4d96-9c6b-5ce5d05597dd', 'trigo-entero', 15, 15000),
    ('53695003-c715-4214-9c6c-e3712c3e15fb', 'zaatar-500gr', 45, 45000),
    ('64f5366d-4775-4fe6-8ba0-912cc969635c', 'zwan-caene-850', 55, 55000),
    ('d89d0990-4f67-474e-92ed-b1a4720b8762', 'zwan-carne-340', 30, 30000),
    ('390838d8-3908-4260-b416-f371ff55af4e', 'zwan-pollo', 30, 30000),
    ('d5ad10f4-a840-4b98-b686-f33d3292dce9', 'zwan-pollo-850gr', 55, 55000);

-- Estimaciones por producto basadas en precios minoristas comparables.
insert into reviewed_catalog_prices (id, slug, audited_price, price_cop) values
    ('ce313787-8f51-4891-9ddd-219648232ebc', 'aceite-oliva-3litros', 32123, 240000),
    ('a161102a-c66b-4407-96fc-9f1e4d021b78', 'aceite-oliva-koura', 74918, 60000),
    ('2f9b3302-6b56-42c4-84ed-9702b1d317b0', 'aceitunas-verdes-encurtidas', 103143, 25000),
    ('aead6ad9-2037-4b63-8970-086e22ad8b97', 'agua-azahar', 75391, 18000),
    ('87e0bf7e-579e-453d-957a-ce5b3774f588', 'agua-azahar-grande', 146620, 40000),
    ('2bb9f36a-255e-48b8-af48-097c9a437857', 'agua-rosas-300ml', 25278, 17000),
    ('d25c867d-dbb4-4da0-842f-591a68056749', 'agua-rosas-750ml', 76906, 38000),
    ('c894c5fb-ab11-43e4-90d6-807589398e00', 'altramuces-secos', 67802, 22000),
    ('97296dd5-376f-44bf-8018-15d3db3112f6', 'anatolia-moda-cezve-cafetera-turca-de-cobre-pulido', 45975, 145000),
    ('643f1c57-4f61-44e7-b3c9-6b0be87901c1', 'arak-touma', 145037, 145000),
    ('77540d69-c66d-4c4e-8221-03586e7eb6a4', 'azahar-agua-260ml', 84926, 15000),
    ('4d5e9570-d5bf-4047-92ff-989b38d8f9c9', 'bandeja-de-vidrio-circular-con-espiral-dorado', 66339, 65000),
    ('e898bf26-a317-402c-9aa4-e5645229dcfc', 'brioni-cezve-cafetera-turca-de-granito-azul', 49742, 85000),
    ('5751ac63-2dee-4856-ae3f-66b63205bb36', 'brioni-cezve-cafetera-turca-de-granito-gris-y-negro', 110154, 85000),
    ('0ae06357-2e20-4982-a844-c212b17c5760', 'brioni-cezve-cafetera-turca-de-granito-negro', 56613, 85000),
    ('343ce08c-01fc-480c-8dca-13caeb168242', 'castania-nuts', 17141, 22000),
    ('29fe70f9-916d-4533-9461-3fa95c7eff64', 'cezve-cafetera-turca-de-hierro-fundido-negro', 26009, 95000),
    ('d5642543-6900-45c1-8aaa-10fe9d73f7b7', 'cezve-cafetera-turca-esmaltada-marr-n-con-motivos-blancos', 136199, 75000),
    ('41755cc6-172f-46bd-b658-26e1a998c8b9', 'cezve-cafetera-turca-esmaltada-roja-con-motivos-blancos', 143403, 75000),
    ('7cd5a5cd-ed5d-42e4-ad14-45d1fadb6d35', 'crunchy-mix', 86728, 70000),
    ('dfaebe66-ff59-4a2f-af15-e70aa95cea65', 'crunchy-sesame', 87466, 55000),
    ('2a01c8c9-4f66-4926-9763-997572991474', 'escencia-chocolate-menta', 129391, 18000),
    ('3bd0c915-0755-4d7b-81e8-c31b986aa18f', 'escencia-coco-bluebberry', 115772, 18000),
    ('edae577f-56f4-42f4-bb37-55215146f680', 'etera-cl-sica-de-acero-inoxidable-pulido', 47402, 95000),
    ('15cc3817-a8ff-471b-809c-7aa7d6515432', 'galletas-mamoul', 68907, 16000),
    ('9630a4dc-9e1a-4229-8a98-fd0ff5de90ae', 'halva-con-pistacho-al-nakhil', 63704, 42000),
    ('271c5182-a401-4cd3-a10c-194bf9b40430', 'halva-original-al-nakhil', 11729, 35000),
    ('53121d1b-27f1-402e-9022-cff2d489b7dd', 'halva-original-al-nakhill-grande', 137395, 62000),
    ('e8ef19d7-b3dc-43fd-8102-a09e0dfd6c3e', 'halva-original-sin-az-car', 54625, 42000),
    ('5914c669-c03a-4667-82a7-ddce12bdafcd', 'hummus-en-lata', 135102, 12000),
    ('404dd8d0-0c5a-4af9-ba97-14134bbebc4b', 'jabon-oliva-y-te-verde', 63841, 32000),
    ('d4c5df17-9ff5-4a59-be7b-1453fcd9f418', 'juego-de-caf-porcelana-blanco-puro-con-filo-dorado', 136214, 135000),
    ('ff43175e-cf98-448b-89ff-0031933bb52a', 'juego-de-caf-porcelana-espiral-ptica-gold', 92335, 155000),
    ('83e61cea-30ab-402c-bffc-46437409671a', 'juego-de-caf-porcelana-labrada-crema', 58027, 125000),
    ('c17bb20f-2a43-4cb8-823e-c19f7e224606', 'juego-de-caf-porcelana-labrada-gris', 90212, 125000),
    ('cc85db7a-2215-468d-9da6-99d304cdf52f', 'juego-de-caf-porcelana-mandala-tnico-y-oro', 21069, 155000),
    ('1c0eb8c8-d656-428b-8c13-650c50f0bbb2', 'juego-de-caf-porcelana-mosaico-geom-trico-gold', 42551, 155000),
    ('1cff772d-d9af-4c3c-ba4e-9c1ad5d42563', 'juego-de-caf-porcelana-multicolor', 1, 145000),
    ('40bff6f2-d8b0-4b6d-89b0-f264c88ee11d', 'juego-de-caf-porcelana-rbol-de-oro', 74638, 145000),
    ('4c1dab8e-a139-481f-aac8-3df6322addf1', 'juego-de-caf-porcelana-relieve-p-talo-blanco', 101842, 135000),
    ('87e7e248-d0ed-49f8-b276-f71c2f22285a', 'mani-confitado-con-miel', 103127, 25000),
    ('e8914ce9-5ee0-444d-87ed-0cd6f6774807', 'melaza-granada', 64835, 25000),
    ('97be4c3a-2b76-4f94-8fe8-962e89702e46', 'melaza-granada-500ml', 141546, 39000),
    ('21d0decb-d48a-4440-9ca6-99685960a301', 'melaza-granada-al-kasser', 131571, 30000),
    ('7eb73838-809a-4678-85e6-d8cbc07b7ab7', 'melaza-granadina', 62804, 28000),
    ('a73cffdd-182c-4cdf-90b0-c6f33c8f2c2d', 'mermelada-albaricoque-light', 144842, 35000),
    ('6da442ce-91fe-4e91-8ca0-e4e77c78ee4b', 'molde-kibbeh', 101700, 45000),
    ('839946d7-00a2-475e-a466-2dd208e0f723', 'molde-maamoul-alargado', 47198, 27000),
    ('efb33bee-f2ee-4b1b-bb09-99ba096230ed', 'molde-maamoul-peque-o', 89301, 24000),
    ('e0e7e40a-0e81-45e3-8532-af9f0aadef7e', 'molde-para-maaoul', 20831, 30000),
    ('1a10d36b-6fff-4f2a-b885-02b621988658', 'mug-ceramica-dorado', 40322, 35000),
    ('942b4f3e-7614-462b-ba21-96e252578d59', 'organizador-cucharas-dorado', 125626, 45000),
    ('e1f46bda-78a9-4159-98a1-0c58a688a597', 'organizador-de-cucharas-plateado', 61010, 42000),
    ('22bc7d67-b125-4ad3-87b6-1a5be10487dc', 'pepinos-silvestres-1000g', 35913, 38000),
    ('1fbaff3c-6edc-41d2-a29a-861a3f834ddb', 'procesador-alimentos', 17306, 65000),
    ('e56bc06c-858e-49f0-a3be-17a00784fc94', 'queso-puck', 109126, 45000),
    ('0085d85e-b42d-465c-97bf-ccfb4eb8b78a', 'remolacha-encutida', 58268, 20000),
    ('9032cae5-68f4-48d2-8b81-9a695c5c062f', 'set-brochetas-barbacoa', 12187, 28000),
    ('377f3258-45d8-4892-b4a7-c1d4959ddbe7', 'set-de-cafe-arbol-de-la-vida', 110793, 150000),
    ('76161b36-3790-45e8-a212-a8dd752a7304', 'set-de-cafe-blanco-base-anillos-dorados', 137954, 145000),
    ('9f67f4ec-c59c-461f-a08b-4874a92e4dc5', 'set-de-cafe-blanco-base-anillos-plateado', 89529, 145000),
    ('1a4bf3ff-79eb-40d9-a3e6-3b6ec20ef37d', 'set-de-cafe-hojas-de-oro', 142326, 155000),
    ('9292890e-8c2b-4cf4-9a30-a873ece051e7', 'set-de-cafe-tazas-blancas-base-de-anillos-dorados', 67197, 155000),
    ('bc513d01-5e4d-48c6-9591-b1e55e817ea8', 'set-de-tazada-negro-mate', 75406, 125000),
    ('347a327b-b973-46ad-b76b-00bca13b3367', 'sirope-albaricoque', 67858, 25000),
    ('585309c9-a9e5-4fb7-9e04-383a19624568', 'sirope-almendra', 84458, 32000),
    ('3750f4f9-c206-48da-8bf0-639da648c717', 'sirope-granadina', 49190, 25000),
    ('5a409c23-f6a7-477a-b6c1-5d24ddb76524', 'sirope-jallab', 81150, 35000),
    ('f62e549a-2ff8-4681-8bdc-a9ecbaf8f132', 'sirope-mora', 125069, 25000),
    ('9778ec5f-3b4c-4038-b23a-ad92eae67f57', 'surtido-de-dulces-rabes', 149486, 150000),
    ('38c662d6-53c3-4328-9d42-ad5e4cd49610', 'tabaco-dos-manzanas', 14621, 45000),
    ('212e1906-9813-4722-a0f9-3c9988cb395a', 'te-rawvi', 106997, 34000),
    ('c7349b86-cd97-4b78-80d2-5279633c1888', 'tetera-de-vidrio-borosilicato-labrado-con-detalles-dorados', 35335, 95000),
    ('0ae7cafe-e89d-438f-893b-419d2063c574', 'tinte-henna-roja', 95410, 27000),
    ('da46121f-ce7f-4bb7-8157-40a3f5b66d50', 'turron-de-ajonjoli', 45146, 25000),
    ('a68c79e3-bf99-4944-9862-830b00a821ef', 'vinagre-manzana', 21558, 25000),
    ('47d372b6-b51f-4baa-a781-6634cd896e8b', 'vinagre-manzana-casero', 36010, 28000),
    ('41fa467b-d293-453f-8b8c-65b089c4d36f', 'vinagre-uva', 84868, 25000);

lock table public.products in share row exclusive mode;

do $$
declare
  conflicts text;
begin
  select string_agg(reviewed.slug, ', ' order by reviewed.slug)
  into conflicts
  from reviewed_catalog_prices as reviewed
  left join public.products as product
    on product.id = reviewed.id and product.slug = reviewed.slug
  where product.id is null or product.price not in (reviewed.audited_price, reviewed.price_cop);

  if conflicts is not null then
    raise exception 'Precios o productos modificados después de la auditoría: %', conflicts;
  end if;
end $$;

update public.products as product
set price = reviewed.price_cop
from reviewed_catalog_prices as reviewed
where product.id = reviewed.id
  and product.slug = reviewed.slug
  and product.price = reviewed.audited_price
  and product.price <> reviewed.price_cop;

select count(*) as productos_verificados, min(product.price) as precio_minimo_cop,
  max(product.price) as precio_maximo_cop
from public.products as product
join reviewed_catalog_prices as reviewed using (id, slug)
where product.price = reviewed.price_cop;

commit;
