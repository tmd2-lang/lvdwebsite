-- Apply once in Supabase SQL Editor before releasing inquiry activity tracking.
-- Existing leads are not backfilled as unread: their earlier view history is unknown.
begin;
create table if not exists public.lead_tracking_settings (
  id integer primary key check (id = 1),
  started_at timestamptz not null default now()
);
insert into public.lead_tracking_settings (id) values (1) on conflict do nothing;
create table if not exists public.lead_activity (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  actor_id text not null,
  actor_name text not null,
  kind text not null check (kind in ('viewed', 'status_changed', 'note_added')),
  detail text
);
create index if not exists lead_activity_lead_time_idx on public.lead_activity (lead_id, created_at desc);
alter table public.lead_tracking_settings enable row level security;
alter table public.lead_activity enable row level security;
revoke all on public.lead_activity, public.lead_tracking_settings from anon, authenticated;
grant select, insert, update, delete on public.lead_activity, public.lead_tracking_settings to service_role;

-- Only the server service role may call this function. Mutation + audit are atomic.
create or replace function public.apply_lead_activity(
  p_lead_id uuid, p_actor_id text, p_actor_name text, p_kind text, p_detail text default null
) returns jsonb language plpgsql set search_path = public as $$
declare
  event public.lead_activity;
  lead_row public.leads;
  note_row public.lead_notes;
begin
  select * into lead_row from public.leads where id = p_lead_id for update;
  if not found then raise exception 'Inquiry not found'; end if;
  if p_kind = 'status_changed' then
    if p_detail = lead_row.status then return jsonb_build_object('lead', to_jsonb(lead_row), 'activity', null); end if;
    update public.leads set status = p_detail where id = p_lead_id returning * into lead_row;
  elsif p_kind = 'note_added' then
    if p_detail is null or length(trim(p_detail)) = 0 or length(p_detail) > 4000 then raise exception 'Invalid note'; end if;
    insert into public.lead_notes (lead_id, author_name, body) values (p_lead_id, p_actor_name, trim(p_detail)) returning * into note_row;
  elsif p_kind <> 'viewed' then
    raise exception 'Invalid activity';
  end if;
  insert into public.lead_activity (lead_id, actor_id, actor_name, kind, detail)
    values (p_lead_id, p_actor_id, p_actor_name, p_kind,
      case when p_kind = 'status_changed' then p_detail else null end) returning * into event;
  return jsonb_build_object('lead', jsonb_build_object('id', lead_row.id, 'status', lead_row.status, 'updated_at', lead_row.updated_at), 'note', to_jsonb(note_row), 'activity', to_jsonb(event));
end;
$$;
revoke all on function public.apply_lead_activity(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.apply_lead_activity(uuid, text, text, text, text) to service_role;
commit;
