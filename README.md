# Beirut: Flavors of Heritage

Quiero que construyas un sitio web e-commerce (MVP) para Beirut, un minimarket de productos árabes/libaneses en Colombia, propiedad de una familia libanesa. El sitio debe transmitir herencia mediterránea, calidez artesanal y frescura, no una estética genérica de tienda online.

1. Identidad de marca (obligatorio seguir esto)

Nombre: Beirut

Logotipo: cedro del Líbano estilizado (isotipo) arriba, caligrafía árabe (بيروت) en el centro, palabra "Beirut" en tipografía script/manuscrita abajo. Composición vertical, no la alteres.

Color institucional: Verde `#2E9642` (RGB 46/150/66, CMYK 80/10/100/5) como color dominante de marca.

Fondos: blanco puro o gris muy claro como base principal; kraft marrón claro / textura madera clara como fondo alternativo para secciones "artesanales" o de empaque.

Tipografía del logo/acentos: script caligráfico, cálido, manuscrito (usar para el logo y titulares emocionales, tipo "Sacramento", "Pacifico" o similar en Google Fonts).

Tipografía de soporte (textos, precios, UI): sans-serif limpia — Montserrat, Helvetica o Arial.

No usar fondos fotográficos recargados o con bajo contraste detrás del logo. No deformar el logo. No cambiar el verde institucional.

2. Tono visual deseado

Diseño moderno 2026, minimalista pero cálido — piensa en marcas mediterráneas premium (aceite de oliva artesanal, especias, panadería libanesa) mezcladas con e-commerce actual (tarjetas de producto grandes, mucho aire en blanco, microanimaciones sutiles al hacer scroll/hover, tipografía grande y confiada). Debe sentirse hecho por un estudio de diseño profesional, no una plantilla genérica. Nada de ruido visual, nada de stock genérico de "tienda online".

Paleta secundaria sugerida para acompañar el verde: crema/hueso, dorado tenue (detalles), terracota suave — evocando especias, aceitunas, cedro y Mediterráneo, sin caer en clichés (nada de patrones árabes recargados tipo alfombra).

3. Estructura del sitio (páginas/secciones)

Home

Hero con el logo, frase emocional en tipografía script ("Sabores del Líbano, en tu mesa") + CTA "Ver productos"

Categorías destacadas (especias, aceitunas, quesos, dulces árabes, té/café, conservas)

Productos destacados / más vendidos (grid de cards)

Sección "Nuestra historia" — origen libanés de los dueños, herencia del cedro

Banner de confianza (envíos, pago seguro, atención por WhatsApp)

Footer con contacto, redes, horario

Catálogo / Tienda

Grid de productos con filtro por categoría

Ficha de producto: foto, descripción, precio, selector de cantidad, botón "Agregar al carrito"

Carrito

Resumen de productos, cantidades editables, subtotal, botón "Finalizar compra"

Checkout

Datos del cliente (nombre, teléfono, dirección/entrega o recogida)

Pasarela de pago integrada

Al confirmar, el pedido debe:

Guardarse en la base de datos (tabla orders + order_items)

Enviarse automáticamente como mensaje formateado a WhatsApp Business del negocio (número configurable), con detalle del pedido, cliente y total

Nosotros / Nuestra historia

Historia de la familia libanesa, el significado del cedro y la marca

Contacto

Dirección, mapa, WhatsApp directo, redes sociales

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/993e8571-8e7b-4448-9eb1-b2c0b6c8e1ce).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
