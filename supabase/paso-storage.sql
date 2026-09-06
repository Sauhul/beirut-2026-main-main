-- ============================================================
-- PASO ÚNICO PARA ACTIVAR LA SUBIDA DE IMÁGENES
-- 1. Abre https://supabase.com/dashboard y entra a tu proyecto
-- 2. Menú lateral izquierdo → icono TERMINAL "SQL Editor"
-- 3. Botón "+ New query" (o "New snippet")
-- 4. Pega TODO este texto en el cuadro grande
-- 5. Botón "Run" (o Ctrl+Enter). Debe decir "Success. No rows returned"
-- ============================================================

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
