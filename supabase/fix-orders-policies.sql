-- ============================================================
-- MIGRACIÓN: Fix status CHECK + DELETE admin + aceptar 'test'
-- Pegar en: Dashboard → SQL Editor → New query → Run
-- ============================================================

-- 0) ACTUALIZAR CHECK CONSTRAINT de status para permitir todos los estados
-- ─────────────────────────────────────────────────────────────
-- Primero eliminamos el constraint anterior que solo permitía valores limitados
alter table public.orders drop constraint if exists orders_status_check;

-- Recreamos el constraint con TODOS los estados que usamos
alter table public.orders add constraint orders_status_check
  check (status in ('pendiente', 'preparando', 'despachado', 'cancelado'));

-- También actualizamos el constraint de payment_method para aceptar 'test'
alter table public.orders drop constraint if exists orders_payment_method_check;
alter table public.orders add constraint orders_payment_method_check
  check (payment_method in ('wompi', 'transferencia', 'test'));

-- 1) Policy de DELETE para orders (solo admins autenticados)
-- ─────────────────────────────────────────────────────────────
drop policy if exists "admins delete orders" on public.orders;
create policy "admins delete orders" on public.orders
  for delete to authenticated
  using (public.is_current_admin());

-- 2) Policy de DELETE para order_items (solo admins autenticados)
-- ─────────────────────────────────────────────────────────────
drop policy if exists "admins delete order_items" on public.order_items;
create policy "admins delete order_items" on public.order_items
  for delete to authenticated
  using (public.is_current_admin());

-- 3) Policy de INSERT para order_items (solo admins autenticados)
-- Para poder recrear items si se necesita en el futuro
-- ─────────────────────────────────────────────────────────────
drop policy if exists "admins insert order_items" on public.order_items;
create policy "admins insert order_items" on public.order_items
  for insert to authenticated
  with check (public.is_current_admin());

-- 4) Actualizar create_order para aceptar 'test' como método de pago válido
-- ─────────────────────────────────────────────────────────────
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
  -- Validaciones del cliente
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
  if coalesce(p_order->>'payment_method','') not in ('wompi','transferencia','test') then
    raise exception 'Método de pago inválido';
  end if;
  if p_order->>'delivery_method' = 'domicilio'
     and coalesce(trim(p_order->>'address'),'') = '' then
    raise exception 'La dirección es obligatoria para domicilio';
  end if;

  -- Validaciones del carrito
  if jsonb_array_length(coalesce(p_order->'items','[]'::jsonb)) not between 1 and 50 then
    raise exception 'Pedido sin productos o con demasiados productos';
  end if;

  -- Crear el pedido
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

  -- Insertar cada línea con el precio REAL de la BD
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

  -- Total calculado por el servidor
  update orders
  set total = (select coalesce(sum(line_total), 0) from order_items where order_id = v_id)
  where id = v_id;

  return jsonb_build_object('id', v_id, 'order_number', v_number);
end;
$$;

revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;

-- 5) Policy de UPDATE para order_items (solo admins autenticados)
-- ─────────────────────────────────────────────────────────────
drop policy if exists "admins update order_items" on public.order_items;
create policy "admins update order_items" on public.order_items
  for update to authenticated
  using (public.is_current_admin())
  with check (public.is_current_admin());
