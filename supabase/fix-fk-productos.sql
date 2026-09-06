-- Corrige la llave foránea order_items.product_id para que al eliminar un
-- producto no se borre el historial de pedidos: el item queda con product_id
-- NULL y conserva el snapshot (product_name, unit_price).
--
-- Ejecutar en Supabase → SQL Editor.

alter table public.order_items
  drop constraint order_items_product_id_fkey;

alter table public.order_items
  add constraint order_items_product_id_fkey
  foreign key (product_id) references public.products(id)
  on delete set null;
