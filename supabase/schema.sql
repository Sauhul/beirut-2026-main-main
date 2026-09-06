-- ============================================================
-- BEIRUT — Esquema inicial de base de datos (Supabase / Postgres)
-- Pegar completo en: Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ── Tablas ────────────────────────────────────────────────────

create table if not exists public.categories (
  id          text primary key,
  slug        text not null unique,
  name        text not null,
  description text,
  sort_order  int  not null default 0
);

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  category_id text references public.categories(id),
  slug        text not null unique,
  name        text not null,
  description text not null default '',
  price       int  not null check (price > 0),
  unit        text not null default 'unidad',
  image_url   text,
  featured    boolean not null default false,
  in_stock    boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    bigint generated always as identity,
  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text,
  delivery_method text not null check (delivery_method in ('domicilio', 'recogida')),
  address         text,
  city            text,
  notes           text,
  payment_method  text not null check (payment_method in ('wompi', 'transferencia')),
  payment_status  text not null default 'pendiente',
  status          text not null default 'pendiente',
  total           bigint not null check (total >= 0),
  created_at      timestamptz not null default now()
);

alter sequence public.orders_order_number_seq restart with 1001;

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  product_id   uuid references public.products(id),
  product_name text not null,
  unit_price   int  not null,
  quantity     int  not null check (quantity between 1 and 99),
  line_total   bigint not null
);

-- ── Índices ──────────────────────────────────────────────────

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- ── Row Level Security ───────────────────────────────────────
-- Catálogo: lectura pública.
-- Pedidos: nadie inserta directo; SOLO vía la función create_order,
-- que valida los datos y calcula los precios del lado del servidor.

alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select using (true);

drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select using (true);

-- ── Función para crear pedidos ───────────────────────────────
-- Los anónimos NO pueden leer ni escribir directo en orders/order_items.
-- Solo pueden llamar a esta función (SECURITY DEFINER), que valida los datos,
-- toma los precios REALES de la tabla products (nunca del navegador),
-- calcula el total en el servidor y devuelve { id, order_number }.

create or replace function public.create_order(p_order jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_number bigint;
  v_item jsonb;
  v_product public.products%rowtype;
  v_qty int;
begin
  -- ── Validaciones del cliente ──
  if p_order->>'customer_name' is null or length(trim(p_order->>'customer_name')) not between 2 and 80 then
    raise exception 'Nombre inválido';
  end if;
  if p_order->>'customer_phone' is null
     or p_order->>'customer_phone' !~ '^[0-9+()\s-]{7,15}$' then
    raise exception 'Teléfono inválido';
  end if;
  if coalesce(p_order->>'delivery_method','') not in ('domicilio','recogida') then
    raise exception 'Método de entrega inválido';
  end if;
  if coalesce(p_order->>'payment_method','') not in ('wompi','transferencia') then
    raise exception 'Método de pago inválido';
  end if;
  if p_order->>'delivery_method' = 'domicilio'
     and coalesce(trim(p_order->>'address'),'') = '' then
    raise exception 'La dirección es obligatoria para domicilio';
  end if;

  -- ── Validaciones del carrito ──
  if jsonb_array_length(coalesce(p_order->'items','[]'::jsonb)) not between 1 and 50 then
    raise exception 'Pedido sin productos o con demasiados productos';
  end if;

  insert into orders (
    customer_name, customer_phone, customer_email,
    delivery_method, address, city, notes,
    payment_method, payment_status, status, total
  ) values (
    trim(p_order->>'customer_name'),
    trim(p_order->>'customer_phone'),
    nullif(trim(p_order->>'customer_email'), ''),
    p_order->>'delivery_method',
    nullif(left(trim(coalesce(p_order->>'address','')), 300), ''),
    nullif(left(trim(coalesce(p_order->>'city','')), 80), ''),
    nullif(left(trim(coalesce(p_order->>'notes','')), 500), ''),
    p_order->>'payment_method',
    'pendiente', 'pendiente',
    0
  )
  returning id, order_number into v_id, v_number;

  -- ── Cada línea toma el precio real de products ──
  for v_item in select * from jsonb_array_elements(p_order->'items')
  loop
    v_qty := least(greatest(coalesce((v_item->>'quantity')::int, 0), 1), 99);

    select * into v_product
    from products
    where id = nullif(v_item->>'product_id','')::uuid
      and in_stock;

    if not found then
      raise exception 'Producto inválido o agotado en el pedido';
    end if;

    insert into order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
    values (
      v_id,
      v_product.id,
      v_product.name,
      v_product.price,
      v_qty,
      v_product.price * v_qty
    );
  end loop;

  update orders
  set total = (select coalesce(sum(line_total), 0) from order_items where order_id = v_id)
  where id = v_id;

  return jsonb_build_object('id', v_id, 'order_number', v_number);
end;
$$;

revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;

-- ── Datos iniciales (mismo catálogo que src/data/catalog.ts) ──

insert into public.categories (id, slug, name, description, sort_order) values
  ('cat-1', 'abarrotes', 'Abarrotes', 'Productos básicos del hogar', 1),
  ('cat-2', 'lacteos',   'Lácteos',   'Leches y quesos',             2),
  ('cat-3', 'panaderia', 'Panadería', 'Pan y repostería',            3)
on conflict (id) do nothing;

insert into public.products (id, category_id, slug, name, description, price, unit, image_url, featured, in_stock) values
  ('11111111-1111-1111-1111-111111111111', 'cat-1', 'arroz-basmati', 'Arroz Basmati', 'Arroz aromático de grano largo, ideal para acompañar platos libaneses.', 8500, '500g',   null, true,  true),
  ('22222222-2222-2222-2222-222222222222', 'cat-2', 'queso-feta',    'Queso Feta',    'Queso blanco salado tradicional del Medio Oriente.',                    12000, '250g',   null, true,  true),
  ('33333333-3333-3333-3333-333333333333', 'cat-3', 'pan-pita',      'Pan Pita',      'Pan plano suave, perfecto para hummus y shawarma.',                      3500, 'unidad', null, false, true),
  ('44444444-4444-4444-4444-444444444444', 'cat-2', 'hummus',        'Hummus',        'Crema de garbanzo con tahini, aceite de oliva y limón.',                 9500, '200g',   null, true,  true)
on conflict (id) do nothing;

-- ── Administración ───────────────────────────────────────────
-- El admin se autentica con Supabase Auth (usuario creado desde el Dashboard).
-- La tabla admin_emails define qué correos tienen permisos (solo editable
-- por service_role/postgres, no vía API pública).

create table if not exists public.admin_emails (
  email text primary key
);
alter table public.admin_emails enable row level security;

create or replace function public.is_current_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from admin_emails
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "admins manage products" on public.products;
create policy "admins manage products" on public.products
  for all to authenticated
  using (public.is_current_admin())
  with check (public.is_current_admin());

drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories
  for all to authenticated
  using (public.is_current_admin())
  with check (public.is_current_admin());

drop policy if exists "admins read orders" on public.orders;
create policy "admins read orders" on public.orders
  for select to authenticated
  using (public.is_current_admin());

drop policy if exists "admins update orders" on public.orders;
create policy "admins update orders" on public.orders
  for update to authenticated
  using (public.is_current_admin())
  with check (public.is_current_admin());

drop policy if exists "admins read order_items" on public.order_items;
create policy "admins read order_items" on public.order_items
  for select to authenticated
  using (public.is_current_admin());

insert into public.admin_emails (email) values ('hola@beirutmarket.co')
on conflict (email) do nothing;

-- ── Storage: imágenes de productos ───────────────────────────
-- Bucket público "product-images". Lectura pública; escritura solo admins.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "admins upload product images" on storage.objects;
create policy "admins upload product images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_current_admin());

drop policy if exists "admins update product images" on storage.objects;
create policy "admins update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_current_admin());

drop policy if exists "admins delete product images" on storage.objects;
create policy "admins delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_current_admin());
