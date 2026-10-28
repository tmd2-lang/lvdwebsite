-- Marketing dashboard data: one row per ad per platform, imported from the
-- platform's own CSV export (Reddit first). Re-importing a CSV replaces the
-- numbers for the same ad and keeps the link tag. Safe to run more than once.
begin;
create table if not exists public.ad_platform_stats (
  platform text not null check (platform in ('reddit', 'meta', 'google', 'pinterest')),
  campaign text not null check (char_length(campaign) between 1 and 300),
  ad_group text not null default '' check (char_length(ad_group) <= 300),
  ad_name text not null check (char_length(ad_name) between 1 and 300),
  period_start date not null,
  period_end date not null,
  spend numeric(12, 2) not null check (spend >= 0 and spend <= 10000000),
  impressions integer not null check (impressions >= 0),
  clicks integer not null check (clicks >= 0),
  -- The utm_content tag on this ad's link. Blank means "guess it from the ad name".
  utm_content text check (utm_content is null or char_length(utm_content) <= 200),
  imported_at timestamptz not null default now(),
  primary key (platform, campaign, ad_group, ad_name),
  check (period_end >= period_start)
);
alter table public.ad_platform_stats enable row level security;
revoke all on public.ad_platform_stats from anon, authenticated;
grant select, insert, update, delete on public.ad_platform_stats to service_role;
comment on table public.ad_platform_stats is 'Ad delivery numbers per ad, imported from platform CSV exports on the Marketing > Uploads tab.';
commit;
notify pgrst, 'reload schema';
