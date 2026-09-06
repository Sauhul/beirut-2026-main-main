-- ============================================================
-- REFUERZO DE SEGURIDAD — pegar en SQL Editor y dar Run
-- (mismo procedimiento que hiciste con paso-storage.sql)
-- ============================================================

-- 1) CERRAR EL ACCESO DIRECTO A PEDIDOS ─────────────────────
-- Antes cualquiera podía insertar filas directamente en orders
-- y order_items saltándose las validaciones. Ya no: todo pedido
-- DEBE pasar por la función create_order, que valida los datos.

drop policy if exists "anon create orders" on public.orders;
drop policy if exists "anon create order_items" on public.order_items;

-- 2) FUNCIÓN CREATE_ORDER BLINDADA ──────────────────────────
-- Ahora los precios NO se aceptan del navegador: la base de datos
-- los toma de la tabla products. Aunque alguien manipule la página
-- o mande pedidos falsos con la llave pública, el total siempre lo
-- calcula el servidor con los precios reales.

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

  -- ── Crear el pedido (total en 0; se calcula solo abajo) ──
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

  -- ── Insertar cada línea con el precio REAL de la BD ──
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

  -- ── Total calculado por el servidor ──
  update orders
  set total = (select coalesce(sum(line_total), 0) from order_items where order_id = v_id)
  where id = v_id;

  return jsonb_build_object('id', v_id, 'order_number', v_number);
end;
$$;

revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;
