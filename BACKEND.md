# Beirut – Arquitectura del Backend y Guía de Mantenimiento

Documento para desarrolladores. Explica cómo está organizado el backend, qué hace cada parte, y cómo hacer cambios comunes sin romper nada.

---

## Índice

1. [Stack tecnológico](#stack-tecnológico)
2. [Estructura de carpetas](#estructura-de-carpetas)
3. [Base de datos](#base-de-datos)
4. [Flujo completo de un pedido](#flujo-completo-de-un-pedido)
5. [Panel de administración](#panel-de-administración)
6. [Pasarela de pago Wompi](#pasarela-de-pago-wompi)
7. [Notificaciones WhatsApp Business](#notificaciones-whatsapp-business)
8. [Variables de entorno](#variables-de-entorno)
9. [Cómo hacer cambios comunes](#cómo-hacer-cambios-comunes)
10. [Despliegue](#despliegue)

---

## Stack tecnológico

| Capa                | Tecnología                         | Para qué se usa                             |
| ------------------- | ---------------------------------- | ------------------------------------------- |
| Frontend            | React 19 + Vite                    | Páginas del sitio                           |
| Router/SSR          | TanStack Start                     | Renderizado en servidor, rutas API          |
| Base de datos       | Supabase (PostgreSQL)              | Productos, pedidos, imágenes                |
| Autenticación admin | Token secreto (ADMIN_SECRET_TOKEN) | Proteger el panel /admin                    |
| Pagos               | Wompi                              | Cobros con tarjeta/PSE/Nequi en Colombia    |
| Notificaciones      | WhatsApp Business API (Meta)       | Alertas de nuevos pedidos                   |
| Edge Functions      | Supabase Edge Functions (Deno)     | Lógica del lado servidor sin exponer claves |

---

## Estructura de carpetas

```
src/
├── routes/                  # Páginas y rutas de la app
│   ├── __root.tsx           # Layout principal (Header, Footer, Cart)
│   ├── index.tsx            # Home
│   ├── tienda.tsx           # Catálogo
│   ├── checkout.tsx         # Finalizar compra + selección de pago
│   ├── pedido-confirmado.tsx# Confirmación de pedido
│   ├── api.wompi-webhook.ts # Endpoint POST que Wompi llama al confirmar pago
│   └── admin/
│       ├── index.tsx        # Dashboard con métricas
│       ├── pedidos.tsx      # Listado y gestión de pedidos
│       ├── pedidos.$id.tsx  # Detalle de un pedido
│       └── productos.tsx    # Gestión de catálogo
│
├── lib/
│   ├── orders.functions.ts  # Crear pedido (server fn)
│   ├── catalog.functions.ts # Leer productos y categorías (server fn)
│   ├── admin.functions.ts   # CRUD admin productos + pedidos (server fn)
│   ├── wompi.functions.ts   # Integración Wompi (server fn + webhook handler)
│   ├── cart.tsx             # Estado del carrito (React Context)
│   ├── whatsapp.ts          # Construir mensaje de WhatsApp
│   └── format.ts            # Formatear precios COP
│
├── integrations/supabase/
│   ├── client.ts            # Cliente público (navegador)
│   ├── client.server.ts     # Cliente admin con service role (solo servidor)
│   └── types.ts             # Tipos TypeScript generados del schema DB
│
├── config/
│   └── site.ts              # Datos del negocio (teléfono, dirección, redes)
│
supabase/
├── migrations/
│   └── 20240001_beirut_schema.sql  # Migración completa de la DB
└── functions/
    └── notify-order-whatsapp/
        └── index.ts         # Edge Function: enviar notificación WhatsApp
```

---

## Base de datos

El schema está en `supabase/migrations/20240001_beirut_schema.sql`.

### Tablas

#### `categories`

Categorías del catálogo (Especias, Aceitunas, etc.).

| Columna     | Tipo    | Descripción          |
| ----------- | ------- | -------------------- |
| id          | uuid    | PK                   |
| name        | text    | Nombre visible       |
| slug        | text    | URL amigable (único) |
| description | text    | Descripción corta    |
| sort_order  | integer | Orden en el menú     |

#### `products`

Catálogo de productos.

| Columna     | Tipo    | Descripción                                |
| ----------- | ------- | ------------------------------------------ |
| id          | uuid    | PK                                         |
| name        | text    | Nombre del producto                        |
| slug        | text    | URL amigable                               |
| description | text    | Descripción larga                          |
| price       | numeric | Precio en COP                              |
| unit        | text    | Unidad (kg, unidad, 250g…)                 |
| category_id | uuid    | FK → categories                            |
| image_url   | text    | URL de imagen (Supabase Storage o externa) |
| stock       | integer | Unidades disponibles                       |
| in_stock    | boolean | Visible y disponible para compra           |
| featured    | boolean | Aparece en la portada                      |

#### `orders`

Pedidos recibidos.

| Columna           | Tipo    | Descripción                                                         |
| ----------------- | ------- | ------------------------------------------------------------------- |
| id                | uuid    | PK                                                                  |
| order_number      | bigint  | Número legible (autoincremental)                                    |
| customer_name     | text    | Nombre del cliente                                                  |
| customer_phone    | text    | Teléfono / WhatsApp                                                 |
| customer_email    | text    | Correo (opcional)                                                   |
| delivery_method   | text    | `domicilio` o `recogida`                                            |
| address / city    | text    | Dirección de entrega                                                |
| payment_method    | text    | `contraentrega`, `transferencia`, `datafono`, `wompi`               |
| payment_reference | text    | Referencia de Wompi (para correlacionar webhook)                    |
| payment_status    | text    | `pendiente`, `aprobado`, `rechazado`, `error`                       |
| status            | text    | `pendiente` → `confirmado` → `preparando` → `enviado` → `entregado` |
| subtotal / total  | numeric | Montos en COP                                                       |

#### `order_items`

Líneas de cada pedido (productos comprados).

| Columna      | Tipo    | Descripción                                         |
| ------------ | ------- | --------------------------------------------------- |
| order_id     | uuid    | FK → orders                                         |
| product_id   | uuid    | FK → products (nullable, si se elimina el producto) |
| product_name | text    | Nombre snapshot al momento de la compra             |
| unit_price   | numeric | Precio al momento de la compra                      |
| quantity     | integer | Cantidad                                            |
| line_total   | numeric | quantity × unit_price                               |

### Row Level Security (RLS)

- **categories / products**: lectura pública, escritura solo vía service role.
- **orders / order_items**: cualquiera puede insertar (el cliente crea su pedido), pero solo el service role puede leer (panel admin / Edge Functions).

> Los precios siempre se resuelven en el servidor (`orders.functions.ts`), nunca se confía en los valores que envía el navegador.

### Cómo ejecutar la migración

1. Abre el SQL Editor en el dashboard de Supabase.
2. Pega el contenido de `supabase/migrations/20240001_beirut_schema.sql`.
3. Haz clic en **Run**.

---

## Flujo completo de un pedido

### Pago offline (contra entrega / transferencia / datáfono)

```
Cliente llena el formulario de checkout
  → createOrder (server fn) valida datos y crea el pedido en Supabase
  → Se abre WhatsApp con el resumen del pedido para el negocio
  → Cliente ve la página /pedido-confirmado
```

### Pago online con Wompi

```
Cliente llena el formulario → selecciona "Pago en línea"
  → createOrder crea el pedido con status "pendiente" y payment_method "wompi"
  → createWompiTransaction genera la firma de integridad y guarda payment_reference
  → El navegador redirige a checkout.wompi.co
  → El cliente paga (tarjeta / PSE / Nequi)
  → Wompi llama POST /api/wompi-webhook con el resultado
  → handleWompiWebhook verifica la firma y actualiza el pedido en Supabase
  → Si el pago fue aprobado: llama a la Edge Function notify-order-whatsapp
  → Edge Function envía el detalle del pedido al WhatsApp Business del negocio
  → Wompi redirige al cliente a /pedido-confirmado
```

---

## Panel de administración

Accede en `/admin`. Protegido por el `ADMIN_SECRET_TOKEN` del `.env`.

### Rutas disponibles

| Ruta                 | Descripción                                                                       |
| -------------------- | --------------------------------------------------------------------------------- |
| `/admin`             | Dashboard con métricas (pedidos hoy, pendientes, ingresos, productos activos)     |
| `/admin/pedidos`     | Listado paginado de pedidos con filtro por estado. Cambiar estado desde la tabla. |
| `/admin/pedidos/:id` | Detalle completo de un pedido + cambio de estado                                  |
| `/admin/productos`   | CRUD completo de productos (crear, editar, eliminar, subir imagen)                |

### Seguridad del admin

El token se guarda en `sessionStorage` del navegador (se limpia al cerrar la pestaña). En el servidor, cada `adminXxx` function verifica que el token coincida con `ADMIN_SECRET_TOKEN`.

**Para producción**: reemplazar el token por autenticación real con Supabase Auth. Crear un usuario admin en Supabase, verificar su rol en las server functions, y eliminar el `ADMIN_SECRET_TOKEN`.

---

## Pasarela de pago Wompi

Wompi es la pasarela oficial recomendada para Colombia. Soporta:

- Tarjetas Visa / Mastercard
- PSE (débito bancario)
- Nequi
- Efecty

### Configuración inicial

1. Crea una cuenta en [dashboard.wompi.co](https://dashboard.wompi.co).
2. Obtén las llaves API en **Configuración → Llaves API**.
3. Configura el webhook en **Configuración → Webhooks**:
   - URL: `https://tu-dominio.com/api/wompi-webhook`
   - Guarda el **Events Secret** → va en `WOMPI_EVENTS_SECRET`.
4. Agrega todas las variables al `.env` (ver sección Variables de entorno).

### Archivos relevantes

- `src/lib/wompi.functions.ts` – lógica de crear transacción y procesar webhook.
- `src/routes/api.wompi-webhook.ts` – endpoint que Wompi llama.
- `src/routes/checkout.tsx` – formulario de checkout con selección de método de pago.

### Pruebas (sandbox)

Para pruebas, cambia `WOMPI_API` en `wompi.functions.ts` a `https://sandbox.wompi.co/v1` y usa las llaves de prueba del dashboard.

---

## Notificaciones WhatsApp Business

Al confirmar un pago con Wompi, se envía automáticamente el detalle del pedido al WhatsApp Business del negocio.

### Requisitos

1. Cuenta en [Meta for Developers](https://developers.facebook.com).
2. Crear una app de tipo **Business**.
3. Agregar el producto **WhatsApp**.
4. Registrar un número de teléfono del negocio.
5. Generar un **token de acceso permanente**.
6. Anotar el **Phone Number ID** del número registrado.

### Configurar secrets en Supabase

En el dashboard de Supabase → **Edge Functions → Secrets**, agrega:

```
SUPABASE_URL=https://jxbnbfmsevsaoobtzjow.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
WHATSAPP_BUSINESS_TOKEN=tu-token-de-acceso-permanente
WHATSAPP_BUSINESS_PHONE_ID=tu-phone-number-id
WHATSAPP_BUSINESS_RECIPIENT=573001234567
```

### Desplegar la Edge Function

```bash
# Instalar Supabase CLI si no lo tienes
npm install -g supabase

# Iniciar sesión
supabase login

# Desplegar
supabase functions deploy notify-order-whatsapp --project-ref jxbnbfmsevsaoobtzjow
```

### Archivo relevante

- `supabase/functions/notify-order-whatsapp/index.ts`

---

## Variables de entorno

Todas están documentadas en el archivo `.env`. Resumen:

| Variable                      | Dónde obtenerla                       | Quién la usa                     |
| ----------------------------- | ------------------------------------- | -------------------------------- |
| `SUPABASE_URL`                | Supabase → Project Settings → API     | Servidor + cliente               |
| `SUPABASE_PUBLISHABLE_KEY`    | Supabase → Project Settings → API     | Cliente (navegador)              |
| `SUPABASE_SERVICE_ROLE_KEY`   | Supabase → Project Settings → API     | Solo servidor (admin)            |
| `ADMIN_SECRET_TOKEN`          | Lo inventas tú (openssl rand -hex 32) | Panel /admin                     |
| `WOMPI_PUBLIC_KEY`            | dashboard.wompi.co                    | Checkout (cliente)               |
| `WOMPI_PRIVATE_KEY`           | dashboard.wompi.co                    | Servidor                         |
| `WOMPI_EVENTS_SECRET`         | dashboard.wompi.co → Webhooks         | Verificar webhooks               |
| `WOMPI_REDIRECT_URL`          | URL de tu dominio                     | Wompi redirige aquí              |
| `WHATSAPP_BUSINESS_TOKEN`     | Meta Developers                       | Edge Function (Supabase Secrets) |
| `WHATSAPP_BUSINESS_PHONE_ID`  | Meta Developers                       | Edge Function (Supabase Secrets) |
| `WHATSAPP_BUSINESS_RECIPIENT` | Número del negocio                    | Edge Function (Supabase Secrets) |

> **NUNCA** subas el `.env` con valores reales a GitHub. Está en el `.gitignore`.

---

## Cómo hacer cambios comunes

### Agregar un producto nuevo

Opción A (panel admin): Entra a `/admin/productos` → clic en **Nuevo producto**.

Opción B (SQL directo):

```sql
INSERT INTO products (name, slug, description, price, unit, category_id, in_stock)
VALUES ('Za''atar Premium', 'zaatar-premium', 'Mezcla de tomillo silvestre...', 35000, '250g',
        '00000000-0000-0000-0000-000000000001', true);
```

### Cambiar el estado de un pedido

Desde el panel `/admin/pedidos`, usa el selector de estado en la fila del pedido.

### Cambiar el número de WhatsApp del negocio

Edita `src/config/site.ts`:

```ts
whatsappNumber: "573001234567",  // formato internacional sin +
```

### Cambiar los precios

Solo desde el panel de admin o directamente en la DB. Los precios se resuelven en el servidor, el cliente nunca puede manipularlos.

### Agregar una nueva categoría

```sql
INSERT INTO categories (name, slug, description, sort_order)
VALUES ('Cereales', 'cereales', 'Cereales y legumbres', 7);
```

---

## Despliegue

El proyecto usa TanStack Start con Nitro como servidor. Para desplegar:

### Opción recomendada: Vercel o Netlify

1. Conecta el repositorio.
2. Agrega todas las variables de entorno en el panel de la plataforma.
3. Configura el webhook de Wompi con la URL de producción.
4. Despliega la Edge Function de Supabase (ver sección arriba).

### Variables a agregar en la plataforma de despliegue

Todas las del `.env` excepto las de WhatsApp (esas van en Supabase Secrets).
