# Publicar Beirut en Cloudflare Pages

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
