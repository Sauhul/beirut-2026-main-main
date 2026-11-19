# Arquitectura y mantenimiento de Beirut

Beirut es una tienda de productos libaneses en Barranquilla. La aplicación usa React con Rsbuild, React Router para las rutas del navegador y TanStack Query para consultar el catálogo. Supabase aporta PostgreSQL, Auth, Storage y Edge Functions.

## Mapa del repositorio

| Ruta | Responsabilidad |
| --- | --- |
| `src/app/` | Rutas, proveedores globales y manejo de errores |
| `src/pages/` | Pantallas de tienda, producto, carrito, checkout, confirmación, contacto y administración |
| `src/domain/` | Catálogo, carrito, pedidos, pagos, notificaciones y nombrado de imágenes |
| `src/data/` | Cliente Supabase y catálogo de respaldo |
| `src/components/`, `src/hooks/`, `src/shared/` | Componentes y utilidades compartidos |
| `src/config/site.ts` | Datos del negocio que muestra la tienda |
| `api/` | Funciones de servidor para Vercel |
| `supabase/` | Esquema SQL, ajustes históricos y código de Edge Functions |
| `scripts/` | Herramientas manuales para operaciones de catálogo e imágenes |

## Flujos de la tienda

- **Catálogo.** `src/domain/catalog/service.ts` consulta las categorías y los productos de Supabase. El respaldo está en `src/data/catalog-fallback.ts` y usa recursos de `public/products/`.
- **Carrito.** `src/domain/cart/` comparte cantidades y subtotales entre la tienda y el checkout mediante React Context.
- **Pedidos.** `src/domain/orders/order-service.ts` solicita la creación del pedido mediante la RPC `create_order`. El SQL de `supabase/schema.sql` calcula el total persistido a partir de los precios de la base. El checkout requiere que Supabase confirme la creación del pedido. Si la RPC falla, conserva el carrito y muestra un error.
- **Pagos.** El checkout abre el widget de Wompi con la llave pública. El repositorio carece de un webhook de conciliación de pagos. La interfaz también ofrece transferencia. El éxito devuelto por el widget requiere verificación antes de preparar el pedido.
- **Correos.** El checkout y el administrador envían solicitudes a `/api/send-email`. El handler de Vercel usa Resend. El código de las Edge Functions de correo y WhatsApp está en `supabase/functions/` y su uso fuera de este repositorio depende del despliegue.
- **Administración.** `/admin` permite gestionar productos y pedidos. Usa inicio de sesión con Supabase Auth. Las políticas del esquema consultan `admin_emails` mediante `is_current_admin()`. El nombrado de imágenes desde el panel llama a la Edge Function `generate-image-name`.

## Configuración y despliegue

Copia `.env.example` a `.env` para desarrollo local. Las variables públicas del frontend son `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_ANON_KEY` y `REACT_APP_WOMPI_PUBLIC_KEY`. Configura `RESEND_API_KEY` en el entorno de servidor que ejecuta `api/send-email.ts`.

`npm run build` genera `dist/`. Las configuraciones de Netlify y Vercel incluyen reglas para servir rutas del navegador. El endpoint de correo usa el contrato de Vercel y requiere un runtime que lo ejecute.

Para una base nueva, revisa `supabase/schema.sql`. En una base existente, compara primero el esquema y las políticas desplegadas con los scripts SQL del repositorio. Los scripts históricos de corrección y carga tienen propósitos distintos y pueden cambiar datos o permisos.

Las carpetas `public/products-fixed/` y `public/products-hq/` son insumos o salidas de herramientas manuales de imágenes. Algunos scripts de `scripts/` escriben en Supabase, sustituyen URLs o eliminan objetos de Storage. Revisa el proyecto y el bucket de destino antes de ejecutarlos.


### Comprobar la conexión

En el panel del proyecto de Supabase copia la URL y una clave pública (`sb_publishable_…` o la clave `anon` anterior). Guarda los valores en `.env` como `REACT_APP_SUPABASE_URL` y `REACT_APP_SUPABASE_ANON_KEY`. Ejecuta `npm run db:check` desde la raíz. La prueba hace una lectura de `categories` y `products`, informa cuántas filas ve la clave pública y no escribe datos.

Para probar pedidos, usa un proyecto de pruebas con el esquema, la RPC `create_order` y productos cargados. Verifica el pedido en el panel de administración. Si publicas la app, configura las mismas variables públicas en el proveedor de despliegue y recompila.
