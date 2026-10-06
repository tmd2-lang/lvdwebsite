-- Step 6: ad spend per Meta ad, typed in by the marketing account for now.
-- Later replaced by a daily Meta API import. Safe to run more than once.
begin;
create table if not exists public.ad_spend (
  meta_ad_id text primary key check (meta_ad_id ~ '^\d{5,30}$'),
  spend numeric(12, 2) not null check (spend >= 0 and spend <= 10000000),
  updated_at timestamptz not null default now(),
  updated_by text
);
alter table public.ad_spend enable row level security;
revoke all on public.ad_spend from anon, authenticated;
grant select, insert, update, delete on public.ad_spend to service_role;
comment on table public.ad_spend is 'Spend per Meta ad since lead tracking began (Aug 13, 2026), entered on the Ad report page.';
commit;
notify pgrst, 'reload schema';
