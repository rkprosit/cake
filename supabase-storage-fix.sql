-- ============================================================
-- Shweta's Sweet Atelier — FIX for "new row violates row-level security
-- policy" when uploading cake photos in the admin panel.
--
-- Run ONCE in: Supabase Dashboard → SQL Editor → New query → Run
-- Safe to re-run (drops & recreates each policy).
--
-- Why this is needed:
--   Uploading a file = INSERT into storage.objects, and the
--   Storage API also reads back the new row's metadata, so both
--   INSERT and SELECT rules must allow it. If any of those rules
--   is missing or stale, every upload fails with 403
--   "new row violates row-level security policy".
-- ============================================================

-- 1) Make sure the bucket exists and is public ---------------
insert into storage.buckets (id, name, public)
values ('cake-images', 'cake-images', true)
on conflict (id) do update set public = true;

-- 2) Read: everyone can view/list photos in this bucket -------
--    (also required so an upload can return its own metadata;
--     without it uploads fail even when INSERT is allowed)
drop policy if exists "public can read cake images" on storage.objects;
create policy "public can read cake images"
  on storage.objects for select
  using (bucket_id = 'cake-images');

-- 3) Insert: signed-in admin can upload -----------------------
drop policy if exists "admin can upload cake images" on storage.objects;
create policy "admin can upload cake images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'cake-images');

-- 4) Update: signed-in admin can replace a photo --------------
drop policy if exists "admin can update cake images" on storage.objects;
create policy "admin can update cake images"
  on storage.objects for update to authenticated
  using (bucket_id = 'cake-images')
  with check (bucket_id = 'cake-images');

-- 5) Delete: signed-in admin can remove a photo ---------------
drop policy if exists "admin can delete cake images" on storage.objects;
create policy "admin can delete cake images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'cake-images');
