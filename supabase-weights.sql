-- ============================================================
-- Sweet Crumbs Bakery — Custom weights & prices per cake
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- 1) Add a "weights" column to the cakes table -------------------
-- Each cake stores its own list of sizes, e.g.:
--   [{"w":"500g","price":549,"off":null},
--    {"w":"1kg","price":1049,"off":10},
--    {"w":"2kg","price":1899,"off":null}]
-- "off" is an optional manual discount shown as "10% OFF".
alter table public.cakes
  add column if not exists weights jsonb;

-- 2) Give every existing cake the default 500g + 1kg options -----
-- (500g = current base price, 1kg = base × 1.85 rounded to ₹50,
--  exactly like the old auto-calculated behaviour; any old
--  strike-through MRP becomes an equivalent % OFF discount)
update public.cakes
set weights = jsonb_build_array(
  jsonb_build_object(
    'w', '500g',
    'price', base,
    'off', case when mrp is not null and mrp > base
                then round((mrp - base)::numeric / mrp * 100) end
  ),
  jsonb_build_object(
    'w', '1kg',
    'price', round(round(base * 1.85 / 50) * 50),
    'off', case
             when mrp is not null
                  and round(round(mrp * 1.85 / 50) * 50)
                    > round(round(base * 1.85 / 50) * 50)
             then round(
                    (round(round(mrp * 1.85 / 50) * 50)
                     - round(round(base * 1.85 / 50) * 50))::numeric
                    / round(round(mrp * 1.85 / 50) * 50) * 100)
           end
  )
)
where weights is null;
