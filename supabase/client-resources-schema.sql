-- Build 9: run in the Supabase SQL editor after documents/checklist schemas.
-- Repeatable. No existing clients, documents, or checklist rows are backfilled.
-- New clients automatically receive standard document references. Existing
-- clients get an explicit "Add standard documents" button in their workspace.
begin;

alter table public.documents add column if not exists standard_key text;
alter table public.documents alter column storage_path drop not null;
alter table public.documents drop constraint if exists documents_source_check;
alter table public.documents add constraint documents_source_check check (
  (standard_key is null and storage_path is not null)
  or (standard_key is not null and standard_key in ('welcome_packet', 'planning_guide') and storage_path is null)
);
create unique index if not exists documents_client_standard_key_idx
  on public.documents(client_id, standard_key);

create or replace function public.attach_client_standard_documents(p_client_id uuid, p_by text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare v_planning text;
begin
  select planning_package into v_planning from public.clients where id = p_client_id for update;
  if not found then raise exception 'Client not found'; end if;
  insert into public.documents(client_id, name, category, standard_key, storage_path, content_type, note, uploaded_by)
  values (p_client_id, 'Client Welcome & Onboarding Packet', 'Planning', 'welcome_packet', null,
    'application/pdf', 'Your welcome packet and next steps.', p_by)
  on conflict (client_id, standard_key) do nothing;
  if v_planning is not null then
    insert into public.documents(client_id, name, category, standard_key, storage_path, content_type, note, uploaded_by)
    values (p_client_id, 'Planning Investment Guide', 'Planning', 'planning_guide', null,
      'text/html', 'The studio planning guide, available online.', p_by)
    on conflict (client_id, standard_key) do nothing;
  end if;
  -- Soft-removed standards are intentionally not restored by repeat calls.
end;
$$;
revoke all on function public.attach_client_standard_documents(uuid, text) from public, anon, authenticated;
grant execute on function public.attach_client_standard_documents(uuid, text) to service_role;

create or replace function public.new_client_standard_documents()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  perform public.attach_client_standard_documents(new.id, 'LVD Studio (automatic)');
  return new;
end;
$$;
revoke all on function public.new_client_standard_documents() from public, anon, authenticated;
drop trigger if exists clients_attach_standard_documents on public.clients;
create trigger clients_attach_standard_documents after insert on public.clients
  for each row execute function public.new_client_standard_documents();

-- Separate from clients: the couple's portal reads clients with select=*, so
-- this studio-only gallery address must not become a column on that table.
create table if not exists public.client_post_event (
  client_id uuid primary key references public.clients(id) on delete cascade,
  photographer_gallery_url text,
  updated_at timestamptz not null default now(),
  updated_by text,
  -- Track only the status change made by this feature, so clearing a link
  -- cannot overwrite a subsequent manual checklist edit.
  task_previous_status text,
  task_created_by_gallery boolean not null default false,
  task_completed_at timestamptz,
  constraint client_post_event_gallery_url_check check (
    photographer_gallery_url is null or
    (char_length(photographer_gallery_url) <= 2048 and photographer_gallery_url ~ '^https://[^[:space:]]+$')
  )
);
alter table public.client_post_event enable row level security;
revoke all on public.client_post_event from anon, authenticated;
grant all on public.client_post_event to service_role;

create or replace function public.save_client_photographer_gallery(p_client_id uuid, p_url text, p_by text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_url text := nullif(trim(p_url), '');
  v_saved public.client_post_event%rowtype;
  v_task public.client_checklist_items%rowtype;
  v_created uuid;
  v_completed_at timestamptz;
begin
  perform 1 from public.clients where id = p_client_id for update;
  if not found then raise exception 'Client not found'; end if;
  if v_url is not null and (char_length(v_url) > 2048 or v_url !~ '^https://[^[:space:]]+$') then
    raise exception 'Use a valid HTTPS gallery link';
  end if;
  insert into public.client_post_event(client_id) values(p_client_id) on conflict do nothing;
  select * into v_saved from public.client_post_event where client_id = p_client_id for update;

  if v_url is not null then
    -- Create only the one task, preserving any existing owner/date/notes.
    insert into public.client_checklist_items(client_id, task_id)
      values(p_client_id, 'LVD-116') on conflict (client_id, task_id) do nothing returning id into v_created;
    select * into v_task from public.client_checklist_items
      where client_id = p_client_id and task_id = 'LVD-116' for update;
    if v_task.status <> 'complete' then
      update public.client_checklist_items set status = 'complete', updated_by = p_by
        where id = v_task.id returning updated_at into v_completed_at;
      update public.client_post_event set task_previous_status = v_task.status,
        task_created_by_gallery = (v_created is not null), task_completed_at = v_completed_at
        where client_id = p_client_id;
    end if;
  elsif v_saved.task_completed_at is not null then
    select * into v_task from public.client_checklist_items
      where client_id = p_client_id and task_id = 'LVD-116' for update;
    if found and v_task.status = 'complete' and v_task.updated_at = v_saved.task_completed_at then
      if v_saved.task_created_by_gallery then
        delete from public.client_checklist_items where id = v_task.id;
      else
        update public.client_checklist_items set status = v_saved.task_previous_status, updated_by = p_by
          where id = v_task.id;
      end if;
    end if;
    update public.client_post_event set task_previous_status = null, task_created_by_gallery = false,
      task_completed_at = null where client_id = p_client_id;
  end if;
  update public.client_post_event set photographer_gallery_url = v_url,
    updated_at = clock_timestamp(), updated_by = p_by where client_id = p_client_id;
end;
$$;
revoke all on function public.save_client_photographer_gallery(uuid, text, text) from public, anon, authenticated;
grant execute on function public.save_client_photographer_gallery(uuid, text, text) to service_role;

comment on table public.client_post_event is 'Studio-only gallery source for post-event portfolio work. Never automatically publishes images.';
comment on column public.documents.standard_key is 'Fixed studio resource served by the authenticated document route; no private storage object.';
notify pgrst, 'reload schema';
commit;
