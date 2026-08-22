-- ============================================================
-- Sweet Crumbs — hardening pass (run ONCE in Supabase SQL Editor)
-- Adds database-level validation so bad data can never be
-- written through any client, even a compromised one.
-- Safe to re-run (drops & recreates each constraint).
-- ============================================================

alter table public.cakes drop constraint if exists cakes_base_check;
alter table public.cakes add constraint cakes_base_check
  check (base between 99 and 100000);

alter table public.cakes drop constraint if exists cakes_mrp_check;
alter table public.cakes add constraint cakes_mrp_check
  check (mrp is null or mrp > base);

alter table public.cakes drop constraint if exists cakes_rating_check;
alter table public.cakes add constraint cakes_rating_check
  check (rating between 1 and 5);

alter table public.cakes drop constraint if exists cakes_reviews_check;
alter table public.cakes add constraint cakes_reviews_check
  check (reviews between 0 and 1000000);

alter table public.cakes drop constraint if exists cakes_name_check;
alter table public.cakes add constraint cakes_name_check
  check (char_length(btrim(name)) between 2 and 80);

alter table public.cakes drop constraint if exists cats_allowed_check;
alter table public.cakes add constraint cats_allowed_check
  check (cats <@ array['bestseller','eggless','photo','theme','kids','heart']::text[]);

alter table public.cakes drop constraint if exists badge_allowed_check;
alter table public.cakes add constraint badge_allowed_check
  check (badge is null or badge in ('Bestseller','Eggless','New Arrival','Theme','Personalised'));
