-- Prerequisite: leads-schema.sql and lead-activity-schema.sql. Apply in Supabase SQL Editor.
begin;
create table if not exists public.calendly_webhook_events (
  delivery_key text primary key,
  received_at timestamptz not null default now(),
  raw_payload jsonb not null
);
create table if not exists public.lead_appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references public.leads(id) on delete set null,
  invitee_uri text not null unique,
  event_uri text not null,
  event_type_uri text not null,
  invitee_email text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null check (status in ('scheduled','canceled')),
  rescheduled boolean not null default false,
  old_invitee_uri text,
  new_invitee_uri text,
  outcome text check (outcome in ('completed','no_show')),
  match_method text check (match_method in ('lead_id','email','reschedule')),
  source_occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at >= starts_at)
);
create index if not exists lead_appointments_lead_time_idx on public.lead_appointments(lead_id, starts_at desc);
create index if not exists lead_appointments_old_invitee_idx on public.lead_appointments(old_invitee_uri);
alter table public.calendly_webhook_events enable row level security;
alter table public.lead_appointments enable row level security;
revoke all on public.calendly_webhook_events, public.lead_appointments from anon, authenticated;
grant select, insert, update, delete on public.calendly_webhook_events, public.lead_appointments to service_role;
alter table public.lead_activity drop constraint if exists lead_activity_kind_check;
alter table public.lead_activity add constraint lead_activity_kind_check check (kind in ('viewed','status_changed','note_added','appointment_scheduled','appointment_canceled','appointment_rescheduled'));

-- Appointment + receipt + audit are one transaction. Never acknowledge a partial write.
create or replace function public.sync_calendly_appointment(
 p_delivery_key text, p_raw jsonb, p_invitee_uri text, p_event_uri text,
 p_event_type_uri text, p_lead_id uuid, p_email text, p_starts_at timestamptz,
 p_ends_at timestamptz, p_occurred_at timestamptz, p_status text,
 p_rescheduled boolean, p_old_invitee_uri text, p_new_invitee_uri text
) returns jsonb language plpgsql set search_path = public as $$
declare
 matched uuid; method text; prior public.lead_appointments; saved public.lead_appointments;
 activity_kind text; changed boolean;
begin
 -- Low-volume consultation deliveries: serialize to handle reversed reschedule deliveries.
 perform pg_advisory_xact_lock(614890231);
 insert into public.calendly_webhook_events(delivery_key,raw_payload) values(p_delivery_key,p_raw) on conflict do nothing;
 if not found then return jsonb_build_object('duplicate',true); end if;
 select * into prior from public.lead_appointments where invitee_uri=p_invitee_uri;
 matched := prior.lead_id; method := prior.match_method;
 if matched is null and p_lead_id is not null then
   select id into matched from public.leads where id=p_lead_id and lower(trim(email))=p_email;
   if matched is not null then method := 'lead_id'; end if;
 end if;
 if matched is null and p_old_invitee_uri is not null then
   select lead_id into matched from public.lead_appointments where invitee_uri=p_old_invitee_uri and invitee_email=p_email;
   if matched is not null then method := 'reschedule'; end if;
 end if;
 if matched is null then
   select id into matched from public.leads where lower(trim(email))=p_email and created_at<=p_occurred_at order by created_at desc,id desc limit 1;
   if matched is not null then method := 'email'; end if;
 end if;
 insert into public.lead_appointments(lead_id,invitee_uri,event_uri,event_type_uri,invitee_email,starts_at,ends_at,status,rescheduled,old_invitee_uri,new_invitee_uri,match_method,source_occurred_at)
 values(matched,p_invitee_uri,p_event_uri,p_event_type_uri,p_email,p_starts_at,p_ends_at,p_status,p_rescheduled,p_old_invitee_uri,p_new_invitee_uri,method,p_occurred_at)
 on conflict (invitee_uri) do update set
   lead_id=coalesce(lead_appointments.lead_id,excluded.lead_id),
   match_method=coalesce(lead_appointments.match_method,excluded.match_method),
   -- A canceled invitee URI is terminal. A late create cannot resurrect it.
   status=case when lead_appointments.status='canceled' then 'canceled' else excluded.status end,
   rescheduled=lead_appointments.rescheduled or excluded.rescheduled,
   old_invitee_uri=coalesce(lead_appointments.old_invitee_uri,excluded.old_invitee_uri),
   new_invitee_uri=coalesce(lead_appointments.new_invitee_uri,excluded.new_invitee_uri),
   source_occurred_at=greatest(lead_appointments.source_occurred_at,excluded.source_occurred_at),updated_at=now()
 returning * into saved;
 -- A replacement may arrive first, then inherit the old booking's link later.
 if saved.lead_id is not null then
   update public.lead_appointments set lead_id=saved.lead_id,match_method='reschedule',updated_at=now()
   where lead_id is null and old_invitee_uri=saved.invitee_uri and invitee_email=saved.invitee_email;
 end if;
 changed := prior.id is null or prior.status is distinct from saved.status or prior.rescheduled is distinct from saved.rescheduled or prior.lead_id is distinct from saved.lead_id;
 if changed and saved.lead_id is not null then
   activity_kind := case when saved.status='canceled' and saved.rescheduled then 'appointment_rescheduled' when saved.status='canceled' then 'appointment_canceled' else 'appointment_scheduled' end;
   insert into public.lead_activity(lead_id,actor_id,actor_name,kind,detail,created_at)
   values(saved.lead_id,'calendly','Calendly',activity_kind,saved.starts_at::text,p_occurred_at);
 end if;
 return jsonb_build_object('linked',saved.lead_id is not null);
end;
$$;
revoke all on function public.sync_calendly_appointment(text,jsonb,text,text,text,uuid,text,timestamptz,timestamptz,timestamptz,text,boolean,text,text) from public,anon,authenticated;
grant execute on function public.sync_calendly_appointment(text,jsonb,text,text,text,uuid,text,timestamptz,timestamptz,timestamptz,text,boolean,text,text) to service_role;
commit;
notify pgrst, 'reload schema';
