# Publicar Beirut en Cloudflare Pages

## Proyecto existente en Cloudflare Workers

La URL `beirut-2026-main-main.saulu053.workers.dev` corresponde a un Worker.
Para publicar ahí, conecta el repositorio y la rama `main` en **Settings → Builds**.
Usa `npm run build` como comando de compilación y `npx wrangler deploy` como
comando de despliegue, desde la raíz del repositorio. `wrangler.jsonc` sirve
`dist` y permite abrir directamente las rutas de React. Configura las variables
públicas de Supabase y Wompi en **Build variables**.

## Proyecto en Cloudflare Pages

En **Workers & Pages → Create application → Pages → Connect to Git**, selecciona
`Sauhul/beirut-2026-main-main` y la rama de producción `main`.

| Ajuste | Valor |
| --- | --- |
| Framework preset | None |
| Root directory | Raíz del repositorio |
| Build command | `npm run build` |
| Build output directory | `dist` |
| `NODE_VERSION` | `22` |

En las variables de compilación de producción, configura `REACT_APP_SUPABASE_URL`,
`REACT_APP_SUPABASE_ANON_KEY` (clave pública de Supabase) y
`REACT_APP_WOMPI_PUBLIC_KEY` (clave pública de Wompi). Estos valores se incluyen en
el JavaScript del navegador. Las claves privadas deben permanecer en su backend.

## Si /admin muestra «Supabase no está configurado»

Usa la dirección que muestra el navegador para elegir el proyecto en **Workers & Pages**.

| Dirección | Dónde guardar las variables |
| --- | --- |
| `*.workers.dev` | Worker → **Settings → Builds → Build variables** |
| `*.pages.dev` | Pages → **Settings → Environment variables** → **Production** |

Guarda `REACT_APP_SUPABASE_URL` con la URL del proyecto Supabase y
`REACT_APP_SUPABASE_ANON_KEY` con su clave pública (`anon` o `sb_publishable_…`).
Ejecuta una compilación nueva en Cloudflare después de guardarlas. El navegador
recibe ambos valores del JavaScript generado durante la compilación.
Cuando termine el despliegue, abre `/admin` y comprueba que aparece el formulario de acceso.

Pages resuelve las rutas de React directamente mediante su soporte de aplicaciones de
página única. Netlify conserva su regla de rutas en `netlify.toml`.

## Validación antes de conectar el dominio

En la URL `.pages.dev`, abre `/tienda?categoria=accesorios` y una ficha de producto
directamente. Comprueba que cargan el catálogo de Supabase, las imágenes y el
video. Valida el carrito y el flujo de pedido con el entorno de pruebas de Wompi.

El correo de confirmación y de actualización de pedidos usa `/api/send-email`,
implementado como función de Vercel. Cloudflare Pages no ejecuta ese archivo. Para
conservar los correos al migrar, queda pendiente implementar un endpoint que
verifique el pedido y derive del servidor el destinatario y el mensaje. El endpoint
actual acepta destinatario y HTML desde el navegador. Hasta resolverlo, usa
`.pages.dev` para validar el sitio y conserva el alojamiento de producción actual.

[Integración de Git en Cloudflare Pages](https://developers.cloudflare.com/pages/get-started/git-integration/)
