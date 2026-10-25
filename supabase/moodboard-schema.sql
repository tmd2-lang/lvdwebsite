-- Versioned moodboard review. Run after clients/images/checklist schemas.
-- Repeatable; existing images are not automatically submitted or approved.
begin;
create table if not exists public.client_moodboard_versions (
 id uuid primary key default gen_random_uuid(),
 client_id uuid not null references public.clients(id) on delete cascade,
 version integer not null check(version>0),
 title text not null,
 design jsonb not null,
 images jsonb not null,
 change_summary text not null,
 created_at timestamptz not null default clock_timestamp(),
 created_by text not null,
 unique(client_id,version)
);
create table if not exists public.client_moodboard_approvals (
 id uuid primary key default gen_random_uuid(),
 revision_id uuid not null references public.client_moodboard_versions(id) on delete cascade,
 user_id uuid not null references auth.users(id),
 approved_name text not null,
 approved_at timestamptz not null default clock_timestamp(),
 unique(revision_id,user_id)
);
create table if not exists public.client_moodboard_production (
 client_id uuid primary key references public.clients(id) on delete cascade,
 note text not null default '',
 updated_at timestamptz not null default clock_timestamp(),
 updated_by text not null
);
alter table public.client_moodboard_versions enable row level security;
alter table public.client_moodboard_approvals enable row level security;
alter table public.client_moodboard_production enable row level security;
revoke all on public.client_moodboard_versions,public.client_moodboard_approvals,public.client_moodboard_production from anon,authenticated;
grant all on public.client_moodboard_versions,public.client_moodboard_approvals,public.client_moodboard_production to service_role;

create or replace function public.publish_client_moodboard(p_client uuid,p_expected uuid,p_title text,p_design jsonb,p_images uuid[],p_summary text,p_by text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare v_current public.client_moodboard_versions%rowtype;v_id uuid;v_images jsonb;
begin
 perform 1 from public.clients where id=p_client for update;
 if not found then raise exception 'Client not found'; end if;
 select * into v_current from public.client_moodboard_versions where client_id=p_client order by version desc limit 1;
 if v_current.id is distinct from p_expected then raise exception using errcode='40001',message='Moodboard changed. Refresh before submitting.';end if;
 if coalesce(length(trim(p_title)),0) not between 1 and 160 or coalesce(length(trim(p_summary)),0) not between 1 and 2000 then raise exception 'Title and change summary required';end if;
 if jsonb_typeof(p_design) is distinct from 'object' or not(p_design ?& array['palette','furniture','florals','price'])
  or exists(select 1 from jsonb_each(p_design) e where e.key not in ('palette','furniture','florals','price') or jsonb_typeof(e.value)<>'string' or length(e.value#>>'{}')>4000) then raise exception 'Invalid design details';end if;
 if coalesce(cardinality(p_images),0) not between 1 and 40 then raise exception 'Choose 1 to 40 Design images';end if;
 -- Lock selected rows until the snapshot is recorded; hidden/foreign/removed images cannot slip in.
 perform 1 from public.client_images where id=any(p_images) order by id for share;
 select jsonb_agg(jsonb_build_object('id',i.id,'name',i.name,'storage_path',i.storage_path) order by array_position(p_images,i.id)) into v_images
 from public.client_images i where i.id=any(p_images) and i.client_id=p_client and i.album='Design' and i.visible_to_client and i.deleted_at is null;
 if coalesce(jsonb_array_length(v_images),0)<>cardinality(p_images) then raise exception 'Choose visible Design images from this client only';end if;
 insert into public.client_moodboard_versions(client_id,version,title,design,images,change_summary,created_by)
 values(p_client,coalesce(v_current.version,0)+1,trim(p_title),p_design,v_images,trim(p_summary),p_by) returning id into v_id;
 insert into public.client_checklist_items(client_id,task_id,status,updated_by) values(p_client,'LVD-101','waiting_client',p_by)
 on conflict(client_id,task_id) do update set status='waiting_client',updated_by=p_by;
 return v_id;
end;$$;

create or replace function public.approve_client_moodboard(p_client uuid,p_revision uuid,p_user uuid,p_name text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare v_current uuid;
begin
 perform 1 from public.clients where id=p_client for update;
 if not found then raise exception 'Client not found';end if;
 if not exists(select 1 from public.client_users where client_id=p_client and user_id=p_user and relationship in ('client','partner')) then raise exception 'Only either partner can approve';end if;
 select id into v_current from public.client_moodboard_versions where client_id=p_client order by version desc limit 1;
 if v_current is null or v_current is distinct from p_revision then raise exception using errcode='40001',message='A newer moodboard is available. Refresh and review it first.';end if;
 if coalesce(length(trim(p_name)),0) not between 1 and 320 then raise exception 'Approver name required';end if;
 insert into public.client_moodboard_approvals(revision_id,user_id,approved_name) values(p_revision,p_user,p_name) on conflict(revision_id,user_id) do nothing;
 insert into public.client_checklist_items(client_id,task_id,status,updated_by) values(p_client,'LVD-101','complete',p_name)
 on conflict(client_id,task_id) do update set status='complete',updated_by=p_name;
end;$$;
-- Preserve signed-off images even when the library later removes them.
create or replace function public.protect_moodboard_image() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
 if exists(select 1 from public.client_moodboard_versions v,jsonb_array_elements(v.images) i where i->>'id'=old.id::text) then
  if tg_op='DELETE' then raise exception 'This image is retained in moodboard history. Use Remove instead.';end if;
  if new.storage_path is distinct from old.storage_path then raise exception 'Moodboard image contents are retained. Upload a new image instead.';end if;
 end if;
 if tg_op='DELETE' then return old;end if;return new;
end;$$;
drop trigger if exists client_images_moodboard_history on public.client_images;
create trigger client_images_moodboard_history before update or delete on public.client_images for each row execute function public.protect_moodboard_image();
revoke all on function public.protect_moodboard_image() from public,anon,authenticated;
revoke all on function public.publish_client_moodboard(uuid,uuid,text,jsonb,uuid[],text,text) from public,anon,authenticated;
revoke all on function public.approve_client_moodboard(uuid,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.publish_client_moodboard(uuid,uuid,text,jsonb,uuid[],text,text) to service_role;
grant execute on function public.approve_client_moodboard(uuid,uuid,uuid,text) to service_role;
notify pgrst,'reload schema';
commit;
