-- Ad attribution on leads: which ad (or tagged link) each inquiry came from.
-- Safe to run more than once.

alter table public.leads
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists meta_campaign_id text,
  add column if not exists meta_adset_id text,
  add column if not exists meta_ad_id text,
  add column if not exists landing_page text,
  add column if not exists first_touch_at timestamptz,
  add column if not exists attribution jsonb not null default '{}'::jsonb;

create index if not exists leads_meta_ad_id_idx on public.leads (meta_ad_id);
create index if not exists leads_utm_source_idx on public.leads (utm_source);

comment on column public.leads.meta_ad_id is 'Meta ad ID from the first tagged visit (utm_content). Join key for per-ad reporting.';
comment on column public.leads.attribution is 'First and last tagged visit (landing page, time, utm/click IDs) plus _fbc, _fbp and GA4 client ID.';

-- Backfill older leads from the tags saved in their referrer URL.
-- first_touch_at stays empty: the original landing time was never recorded.
with tagged as (
  select
    id,
    substring(referrer from '^https?://[^/?#]+(/[^?#]*)') as page,
    substring(referrer from '[?&]utm_source=([^&#]+)') as source,
    substring(referrer from '[?&]utm_medium=([^&#]+)') as medium,
    substring(referrer from '[?&]utm_campaign=([^&#]+)') as campaign,
    substring(referrer from '[?&]utm_id=([^&#]+)') as utm_id,
    substring(referrer from '[?&]utm_term=([^&#]+)') as term,
    substring(referrer from '[?&]utm_content=([^&#]+)') as content
  from public.leads
  where referrer ~ '[?&]utm_' and utm_source is null
)
update public.leads l set
  utm_source = t.source,
  utm_medium = t.medium,
  utm_campaign = t.campaign,
  landing_page = t.page,
  meta_campaign_id = case when lower(t.source) in ('fb', 'ig', 'facebook', 'instagram', 'meta', 'an', 'msg', 'threads')
    then coalesce(substring(t.utm_id from '^\d{5,30}$'), substring(t.campaign from '^\d{5,30}$')) end,
  meta_adset_id = case when lower(t.source) in ('fb', 'ig', 'facebook', 'instagram', 'meta', 'an', 'msg', 'threads')
    then substring(t.term from '^\d{5,30}$') end,
  meta_ad_id = case when lower(t.source) in ('fb', 'ig', 'facebook', 'instagram', 'meta', 'an', 'msg', 'threads')
    then substring(t.content from '^\d{5,30}$') end,
  attribution = jsonb_build_object('backfilled_from', 'referrer')
from tagged t
where l.id = t.id;

-- Make PostgREST see the new columns immediately.
notify pgrst, 'reload schema';
