-- Read-only Wave integration. No live data is populated by this migration.
-- Run after clients/checklist schemas. Tokens are encrypted in the application.
begin;
create table if not exists public.wave_connection (
 singleton boolean primary key default true check(singleton), business_id text not null, business_name text not null check(business_name='Planning & Coordination LVD'),
 tokens text not null, connected_by text not null, synced_at timestamptz
);
create table if not exists public.wave_lock (singleton boolean primary key default true check(singleton), token uuid, expires_at timestamptz);
insert into public.wave_lock(singleton) values(true) on conflict do nothing;
create table if not exists public.wave_invoices (
 id text primary key,business_id text not null,payload jsonb not null,
 client_id uuid references public.clients(id),track text check(track in ('planning','design')),
 signed_on date,agreement_signed boolean not null default false,missing boolean not null default false,
 updated_at timestamptz not null default clock_timestamp(),synced_at timestamptz not null default clock_timestamp(),mapped_by text
);
create table if not exists public.wave_client_review (
 client_id uuid primary key references public.clients(id) on delete cascade, confirmed boolean not null default false, reviewed_by text, reviewed_at timestamptz
);
alter table public.wave_connection enable row level security;
alter table public.wave_lock enable row level security;
alter table public.wave_invoices enable row level security;
alter table public.wave_client_review enable row level security;
revoke all on public.wave_connection,public.wave_lock,public.wave_invoices,public.wave_client_review from anon,authenticated;
grant all on public.wave_connection,public.wave_lock,public.wave_invoices,public.wave_client_review to service_role;
create or replace function public.wave_acquire_lock() returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_token uuid:=gen_random_uuid();begin
 update public.wave_lock set token=v_token,expires_at=clock_timestamp()+interval '10 minutes' where singleton and (expires_at is null or expires_at<clock_timestamp());
 if not found then raise exception 'Wave sync is already running';end if;return v_token;end;$$;
create or replace function public.wave_release_lock(p_token uuid) returns void language sql security definer set search_path=public,pg_temp as $$
 update public.wave_lock set expires_at=null,token=null where token=p_token;$$;

create or replace function public.wave_reconcile_tasks(p_client uuid) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_review boolean;v_count integer;v_first boolean;v_second boolean;v_final boolean;v_task text;v_done boolean;
begin
 select confirmed into v_review from public.wave_client_review where client_id=p_client;
 select count(*),bool_and(agreement_signed and (payload->>'paid')::bigint>=round((payload->>'total')::numeric*.4)),
 bool_and((payload->>'paid')::bigint>=round((payload->>'total')::numeric*.4)+round((payload->>'total')::numeric*.3)),
 bool_and((payload->>'balance')::bigint=0) into v_count,v_first,v_second,v_final from public.wave_invoices
 where client_id=p_client and not missing and (payload->>'total')::bigint>0 and payload->>'currency'='USD' and payload->>'status' in ('SENT','VIEWED','UNPAID','PARTIAL','OVERDUE','PAID','OVERPAID');
 foreach v_task in array array['LVD-001','LVD-104','LVD-108'] loop
  v_done:=coalesce(v_review,false) and v_count>0 and coalesce(case v_task when 'LVD-001' then v_first when 'LVD-104' then v_second else v_final end,false);
  if v_done then
   insert into public.client_checklist_items(client_id,task_id,status,updated_by) values(p_client,v_task,'complete','Wave sync')
    on conflict(client_id,task_id) do update set status='complete',updated_by='Wave sync' where client_checklist_items.status<>'complete';
  else
   update public.client_checklist_items set status='waiting_client',updated_by='Wave sync' where client_id=p_client and task_id=v_task and updated_by='Wave sync' and status='complete';
  end if;
 end loop;
end;$$;
create or replace function public.wave_apply_snapshot(p_lock uuid,p_business text,p_invoices jsonb) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_row jsonb;v_client uuid;v_now timestamptz:=clock_timestamp();begin
 perform 1 from public.wave_lock where token=p_lock and expires_at>clock_timestamp() for update;if not found then raise exception 'Wave sync lease expired';end if;
 perform 1 from public.wave_connection where singleton and business_id=p_business;if not found then raise exception 'Wave business mismatch';end if;
 if jsonb_typeof(p_invoices) is distinct from 'array' then raise exception 'Incomplete Wave snapshot';end if;
 for v_row in select * from jsonb_array_elements(p_invoices) loop
  if (v_row->>'status') in ('SENT','VIEWED','UNPAID','PARTIAL','OVERDUE','PAID','OVERPAID') and not exists(select 1 from public.wave_invoices where id=v_row->>'id' and payload->>'customer_id'=v_row->>'customer_id' and payload->>'status' in ('SENT','VIEWED','UNPAID','PARTIAL','OVERDUE','PAID','OVERPAID')) then
   update public.wave_client_review set confirmed=false where client_id in (select client_id from public.wave_invoices where payload->>'customer_id'=v_row->>'customer_id');
  end if;
  update public.wave_client_review set confirmed=false where client_id in (select client_id from public.wave_invoices where id=v_row->>'id' and payload->>'customer_id' is distinct from v_row->>'customer_id');
  update public.wave_invoices set client_id=null,track=null,agreement_signed=false,signed_on=null where id=v_row->>'id' and payload->>'customer_id' is distinct from v_row->>'customer_id';
  insert into public.wave_invoices(id,business_id,payload,synced_at) values(v_row->>'id',p_business,v_row,v_now)
  on conflict(id) do update set payload=excluded.payload,missing=false,synced_at=v_now,updated_at=v_now
  where wave_invoices.business_id=p_business and (wave_invoices.payload->>'modified_at')::timestamptz<=(v_row->>'modified_at')::timestamptz;
 end loop;
 update public.wave_invoices set missing=true,synced_at=v_now where business_id=p_business and not exists(select 1 from jsonb_array_elements(p_invoices) j where j->>'id'=wave_invoices.id);
 update public.wave_connection set synced_at=v_now where singleton;
 for v_client in select client_id from public.wave_client_review loop perform public.wave_reconcile_tasks(v_client);end loop;
end;$$;
create or replace function public.wave_map_invoice(p_invoice text,p_client uuid,p_track text,p_signed date,p_agreement boolean,p_expected timestamptz,p_by text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_before uuid;begin
 perform 1 from public.wave_lock where singleton for update;
 perform 1 from public.clients where id=p_client for update;if not found then raise exception 'Client not found';end if;
 if p_track not in ('planning','design') or p_track is null then raise exception 'Choose a service track';end if;
 select client_id into v_before from public.wave_invoices where id=p_invoice for update;
 if not found then raise exception 'Invoice not found';end if;
 if exists(select 1 from public.wave_invoices where id=p_invoice and updated_at is distinct from p_expected) then raise exception 'Invoice changed; refresh before mapping';end if;
 -- Prevent a second copy of existing LVD expenses. Resolve the manual lines first.
 if exists(select 1 from public.client_budget_lines l where l.client_id=p_client and l.side=case p_track when 'planning' then 'lvd_planning' else 'lvd_design' end and l.status<>'canceled') then raise exception 'Resolve existing manual LVD Budget lines before mapping this track to Wave';end if;
 update public.wave_invoices set client_id=p_client,track=p_track,signed_on=p_signed,agreement_signed=p_agreement,updated_at=clock_timestamp(),mapped_by=p_by where id=p_invoice;
 insert into public.wave_client_review(client_id,confirmed) values(p_client,false) on conflict(client_id) do update set confirmed=false;
 perform public.wave_reconcile_tasks(p_client);
 if v_before is not null and v_before<>p_client then update public.wave_client_review set confirmed=false where client_id=v_before;perform public.wave_reconcile_tasks(v_before);end if;
end;$$;
create or replace function public.wave_confirm_event(p_client uuid,p_confirmed boolean,p_by text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 perform 1 from public.wave_lock where singleton for update;
 perform 1 from public.clients where id=p_client for update;if not found then raise exception 'Client not found';end if;
 if p_confirmed and exists(select 1 from public.wave_invoices pending where pending.client_id is null and not pending.missing and pending.payload->>'status' in ('SENT','VIEWED','UNPAID','PARTIAL','OVERDUE','PAID','OVERPAID') and pending.payload->>'customer_id' in (select mapped.payload->>'customer_id' from public.wave_invoices mapped where mapped.client_id=p_client)) then raise exception 'Map the remaining invoices for this Wave customer before confirming the event set';end if;
 insert into public.wave_client_review(client_id,confirmed,reviewed_by,reviewed_at) values(p_client,p_confirmed,p_by,clock_timestamp())
 on conflict(client_id) do update set confirmed=p_confirmed,reviewed_by=p_by,reviewed_at=clock_timestamp();
 perform public.wave_reconcile_tasks(p_client);
end;$$;
create or replace function public.wave_unmap_invoice(p_invoice text,p_expected timestamptz,p_by text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_client uuid;begin
 perform 1 from public.wave_lock where singleton for update;
 select client_id into v_client from public.wave_invoices where id=p_invoice and updated_at=p_expected for update;
 if not found then raise exception 'Invoice changed; refresh before clearing its mapping';end if;
 update public.wave_invoices set client_id=null,track=null,signed_on=null,agreement_signed=false,mapped_by=p_by,updated_at=clock_timestamp() where id=p_invoice;
 if v_client is not null then update public.wave_client_review set confirmed=false where client_id=v_client;perform public.wave_reconcile_tasks(v_client);end if;
end;$$;
revoke all on function public.wave_unmap_invoice(text,timestamptz,text) from public,anon,authenticated;
grant execute on function public.wave_unmap_invoice(text,timestamptz,text) to service_role;
create or replace function public.wave_guard_manual_budget() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if new.side in ('lvd_planning','lvd_design') and new.status<>'canceled' then
  perform 1 from public.clients where id=new.client_id for update;
  if exists(select 1 from public.wave_invoices where client_id=new.client_id and track=case new.side when 'lvd_planning' then 'planning' else 'design' end) then raise exception 'Wave controls LVD invoice lines for this track';end if;
 end if;return new;
end;$$;
drop trigger if exists wave_manual_budget_guard on public.client_budget_lines;
create trigger wave_manual_budget_guard before insert or update on public.client_budget_lines for each row execute function public.wave_guard_manual_budget();
revoke all on function public.wave_guard_manual_budget() from public,anon,authenticated;
revoke all on function public.wave_acquire_lock(),public.wave_release_lock(uuid),public.wave_reconcile_tasks(uuid),public.wave_apply_snapshot(uuid,text,jsonb),public.wave_map_invoice(text,uuid,text,date,boolean,timestamptz,text),public.wave_confirm_event(uuid,boolean,text) from public,anon,authenticated;
grant execute on function public.wave_acquire_lock(),public.wave_release_lock(uuid),public.wave_apply_snapshot(uuid,text,jsonb),public.wave_map_invoice(text,uuid,text,date,boolean,timestamptz,text),public.wave_confirm_event(uuid,boolean,text) to service_role;
notify pgrst,'reload schema';
commit;
