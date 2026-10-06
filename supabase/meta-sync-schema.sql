-- Step 7: Meta spend import + Conversions API log. Safe to run more than once.
-- Prerequisite: ad-spend-schema.sql.
begin;

-- 7a: spend rows can now come from Meta's API, which also supplies the ad's current name.
alter table public.ad_spend
  add column if not exists ad_name text,
  add column if not exists source text not null default 'manual';
alter table public.ad_spend drop constraint if exists ad_spend_source_check;
alter table public.ad_spend add constraint ad_spend_source_check check (source in ('manual', 'meta'));
alter table public.ad_spend add column if not exists spend_since date;

-- 7b: every event sent to Meta's Conversions API, so we can see what Meta was told.
create table if not exists public.meta_capi_events (
  event_id text primary key,
  lead_id uuid references public.leads(id) on delete set null,
  event_name text not null,
  value numeric(12, 2),
  sent_at timestamptz not null default now(),
  ok boolean not null,
  response jsonb
);
create index if not exists meta_capi_events_lead_idx on public.meta_capi_events (lead_id);
alter table public.meta_capi_events enable row level security;
revoke all on public.meta_capi_events from anon, authenticated;
grant select, insert, update, delete on public.meta_capi_events to service_role;

commit;
notify pgrst, 'reload schema';
