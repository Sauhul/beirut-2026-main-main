-- Mantiene el checkout público y limita el costo de crear pedidos repetidos.
begin;

create index if not exists orders_recent_customer_phone_idx on public.orders (
  (right(regexp_replace(customer_phone, '[^0-9]', '', 'g'), 10)),
  created_at desc
);

create or replace function public.create_order(p_order jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_order_id uuid;
  number bigint;
  order_total bigint;
  order_item jsonb;
  catalog_product public.products%rowtype;
  quantity integer;
  phone text;
  phone_key text;
  seen_products uuid[] := '{}';
  product_id uuid;
begin
  if jsonb_typeof(p_order) is distinct from 'object' or pg_column_size(p_order) > 16384 then
    raise exception 'Solicitud de pedido inválida';
  end if;

  if p_order->>'customer_name' is null or length(trim(p_order->>'customer_name')) not between 2 and 80
    or length(coalesce(p_order->>'customer_email', '')) > 254
    or length(coalesce(p_order->>'address', '')) > 300
    or length(coalesce(p_order->>'city', '')) > 100
    or length(coalesce(p_order->>'notes', '')) > 500 then
    raise exception 'Datos de contacto o entrega inválidos';
  end if;

  phone := trim(p_order->>'customer_phone');
  phone_key := regexp_replace(phone, '[^0-9]', '', 'g');
  if phone is null or phone !~ '^[0-9+() -]{7,15}$'
    or length(phone_key) not between 7 and 15 then
    raise exception 'Teléfono inválido';
  end if;
  phone_key := right(phone_key, 10);

  if coalesce(p_order->>'delivery_method', '') not in ('domicilio', 'recogida') then
    raise exception 'Método de entrega inválido';
  end if;
  if coalesce(p_order->>'payment_method', '') not in ('wompi', 'transferencia') then
    raise exception 'Método de pago inválido';
  end if;
  if p_order->>'delivery_method' = 'domicilio' and coalesce(trim(p_order->>'address'), '') = '' then
    raise exception 'La dirección es obligatoria para domicilio';
  end if;

  if jsonb_typeof(p_order->'items') is distinct from 'array' then
    raise exception 'Lista de productos inválida';
  end if;
  if jsonb_array_length(p_order->'items') not between 1 and 50 then
    raise exception 'Pedido sin productos o con demasiados productos';
  end if;

  for order_item in select value from jsonb_array_elements(p_order->'items')
  loop
    if jsonb_typeof(order_item) is distinct from 'object'
      or coalesce(order_item->>'product_id', '') !~* '^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$'
      or coalesce(order_item->>'quantity', '') !~ '^[1-9][0-9]?$' then
      raise exception 'Producto o cantidad inválida';
    end if;
    product_id := (order_item->>'product_id')::uuid;
    if product_id = any(seen_products) then
      raise exception 'El pedido contiene productos duplicados';
    end if;
    seen_products := array_append(seen_products, product_id);
  end loop;

  -- Serializa pedidos para el mismo teléfono aun si llegan al mismo tiempo.
  if not pg_try_advisory_xact_lock(hashtextextended(phone_key, 871493)) then
    raise exception using errcode = 'PT429', message = 'Ya se está procesando un pedido con este teléfono. Reintenta en unos segundos.';
  end if;

  if (
    select count(*) from (
      select 1
      from public.orders as recent
      where right(regexp_replace(recent.customer_phone, '[^0-9]', '', 'g'), 10) = phone_key
        and recent.created_at >= now() - interval '10 minutes'
      limit 5
    ) as recent_orders
  ) >= 5 then
    raise exception using errcode = 'PT429', message = 'Ya se registraron varios pedidos con este teléfono. Vuelve a intentarlo en unos minutos.';
  end if;

  insert into public.orders (
    customer_name, customer_phone, customer_email, delivery_method, address, city, notes,
    payment_method, payment_status, status, total
  ) values (
    trim(p_order->>'customer_name'), phone, nullif(trim(p_order->>'customer_email'), ''),
    p_order->>'delivery_method', nullif(trim(p_order->>'address'), ''),
    nullif(trim(p_order->>'city'), ''), nullif(trim(p_order->>'notes'), ''),
    p_order->>'payment_method', 'pendiente', 'pendiente', 0
  )
  returning id, order_number into new_order_id, number;

  for order_item in select value from jsonb_array_elements(p_order->'items')
  loop
    quantity := (order_item->>'quantity')::integer;
    select * into catalog_product
    from public.products as product
    where product.id = (order_item->>'product_id')::uuid and product.in_stock;

    if not found then
      raise exception 'Producto inválido o agotado en el pedido';
    end if;

    insert into public.order_items (order_id, product_id, product_name, unit_price, quantity, line_total)
    values (new_order_id, catalog_product.id, catalog_product.name, catalog_product.price, quantity,
      catalog_product.price * quantity);
  end loop;

  select sum(item.line_total) into order_total
  from public.order_items as item
  where item.order_id = new_order_id;

  update public.orders as saved set total = order_total where saved.id = new_order_id;
  return jsonb_build_object('id', new_order_id, 'order_number', number, 'total', order_total);
end;
$$;

-- La lectura pública del catálogo se conserva. Los datos de pedidos se acceden por la RPC.
revoke all on table public.orders, public.order_items, public.admin_emails from public, anon;
revoke insert, update, delete, truncate on table public.products, public.categories from public, anon;
revoke execute on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;

commit;
