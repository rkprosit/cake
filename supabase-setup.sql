-- ============================================================
-- Shweta's Sweet Atelier — Supabase setup
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1) Cakes table -------------------------------------------------
create table if not exists public.cakes (
  id         bigint generated always as identity primary key,
  name       text not null,
  img        text not null,
  base       int  not null,                -- price for 500g in ₹
  mrp        int,                          -- optional strike-through price
  rating     numeric(2,1) not null default 4.8,
  reviews    int not null default 0,
  cats       text[] not null default '{}', -- bestseller/eggless/photo/theme/kids/heart
  badge      text,                         -- Bestseller/Eggless/New Arrival/Theme/Personalised
  available  boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.cakes enable row level security;

drop policy if exists "public can read cakes" on public.cakes;
create policy "public can read cakes"
  on public.cakes for select using (true);

drop policy if exists "admin can insert cakes" on public.cakes;
create policy "admin can insert cakes"
  on public.cakes for insert to authenticated with check (true);

drop policy if exists "admin can update cakes" on public.cakes;
create policy "admin can update cakes"
  on public.cakes for update to authenticated using (true);

drop policy if exists "admin can delete cakes" on public.cakes;
create policy "admin can delete cakes"
  on public.cakes for delete to authenticated using (true);

-- 2) Image storage bucket (public read, admin write) --------------
insert into storage.buckets (id, name, public)
values ('cake-images', 'cake-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public can read cake images" on storage.objects;
create policy "public can read cake images"
  on storage.objects for select using (bucket_id = 'cake-images');

drop policy if exists "admin can upload cake images" on storage.objects;
create policy "admin can upload cake images"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'cake-images');

drop policy if exists "admin can delete cake images" on storage.objects;
create policy "admin can delete cake images"
  on storage.objects for delete to authenticated
  using (bucket_id = 'cake-images');

-- 3) Seed your current 21 cakes -----------------------------------
insert into public.cakes (name, img, base, mrp, rating, reviews, cats, badge, sort_order) values
  ('Rosette Birthday Cake',        'images/cake01.jpeg', 549,  null, 4.9, 193, '{bestseller}',           'Bestseller',   0),
  ('Classic Black Forest Cake',    'images/cake02.jpeg', 599,  null, 4.9, 250, '{eggless}',              'Eggless',     10),
  ('Chocolate Truffle Drip Cake',  'images/cake03.jpeg', 649,  749,  4.9,  62, '{}',                     null,          20),
  ('Delightful Butterscotch Cake', 'images/cake04.jpeg', 549,  null, 4.8, 305, '{bestseller}',           'Bestseller',  30),
  ('Rich Red Velvet Cake',         'images/cake05.jpeg', 699,  null, 4.9, 524, '{}',                     null,          40),
  ('Belgian Chocolate Truffle',    'images/cake06.jpeg', 749,  899,  4.9,  88, '{}',                     null,          50),
  ('Rasmalai Cream Cake',          'images/cake07.jpeg', 749,  null, 4.8,  43, '{eggless}',              'New Arrival', 60),
  ('Alphonso Mango Cream Cake',    'images/cake08.jpeg', 799,  null, 4.7,  31, '{eggless}',              'Eggless',     70),
  ('Pineapple Cream Cake',         'images/cake09.jpeg', 549,  null, 4.8, 156, '{eggless}',              'Eggless',     80),
  ('Oreo Chocolate Cake',          'images/cake10.jpeg', 699,  null, 4.9,  97, '{}',                     null,          90),
  ('KitKat Crunch Cake',           'images/cake11.jpeg', 749,  849,  4.8,  27, '{}',                     null,         100),
  ('Strawberry Cream Cake',        'images/cake12.jpeg', 599,  null, 4.7, 210, '{eggless}',              'Eggless',    110),
  ('Unicorn Theme Cake',           'images/cake13.jpeg', 1249, 1449, 4.8,  64, '{theme,kids}',           'Theme',      120),
  ('Dinosaur Theme Cake',          'images/cake14.jpeg', 1199, null, 4.9,  38, '{theme,kids}',           'New Arrival',130),
  ('Barbie Doll Cake',             'images/cake15.jpeg', 1499, 1699, 4.7,  52, '{theme,kids}',           null,         140),
  ('Spiderman Theme Cake',         'images/cake16.jpeg', 1349, null, 4.8,  29, '{theme,kids}',           null,         150),
  ('Personalised Photo Cake',      'images/cake17.jpeg', 689,  null, 4.9, 374, '{photo,bestseller}',     'Personalised',160),
  ('Heart-Shaped Red Velvet',      'images/cake18.jpeg', 899,  null, 4.8,  76, '{heart}',                null,         170),
  ('Rose Designer Cake',           'images/cake19.jpeg', 799,  null, 4.9, 171, '{bestseller}',           'Bestseller', 180),
  ('Black Forest Heart Cake',      'images/cake20.jpeg', 749,  849,  4.7,  44, '{heart}',                null,         190),
  ('Butterscotch Photo Cake',      'images/cake21.jpeg', 749,  null, 4.8,  19, '{photo,eggless}',        'Eggless',    200);
