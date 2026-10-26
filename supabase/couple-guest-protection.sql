-- Couples can no longer remove guests or households the studio entered.
-- Run once in the Supabase SQL editor, BEFORE deploying the matching code.
-- Safe to re-run.

begin;

alter table public.client_guest_records
  add column if not exists added_by_couple boolean not null default false;

comment on column public.client_guest_records.added_by_couple is
  'True when the couple added this record in their portal. Couples may remove only these.';

-- Guests the couple added before this column existed were labeled
-- "Entered by Couple". (That label also appears on studio guests whose RSVP the
-- couple changed; those become removable by the couple, as they were before.)
update public.client_guest_records set added_by_couple = true
  where kind = 'guest' and not added_by_couple and data->>'source' = 'Entered by Couple';

create or replace function public.mutate_couple_guest(
  p_client_id uuid, p_record_id uuid, p_kind text, p_action text,
  p_patch jsonb, p_expected timestamptz, p_by text
) returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_before public.client_guest_records%rowtype;
  v_after public.client_guest_records%rowtype;
  v_settings public.client_guest_settings%rowtype;
  v_data jsonb; v_allowed text[]; v_key text; v_event record;
  v_exceptions jsonb := '[]'::jsonb; v_name text; v_field text;
  v_before_data jsonb; v_after_data jsonb; v_all jsonb;
begin
  if p_kind not in ('guest','household') or p_action not in ('save','delete') then raise exception 'Invalid guest operation'; end if;
  if p_kind is null or p_action is null or jsonb_typeof(p_patch) is distinct from 'object' then raise exception 'Invalid guest details'; end if;
  if not exists(select 1 from public.clients where id=p_client_id) then raise exception 'Client not found'; end if;
  v_allowed := case when p_kind='guest' then array[
    'first','last','household_id','side','type','vip','relationship','email','mobile',
    'invitation','rsvp','plus_allowed','plus_name','meal','dietary','severe','allergen',
    'accessibility','mobility','sensory','service_animal','highchair','arrival','flight',
    'departure','hotel','property','room','transport','route','gift_received','thank_you','events'
  ] else array['name','contact','email','mobile','address','city','state','postal','country','invitation'] end;
  for v_key in select jsonb_object_keys(p_patch) loop
    if not(v_key=any(v_allowed)) then raise exception 'Studio field cannot be changed'; end if;
  end loop;
  insert into public.client_guest_settings(client_id) values(p_client_id) on conflict do nothing;
  select * into v_settings from public.client_guest_settings where client_id=p_client_id for update;
  if p_record_id is not null then
    select * into v_before from public.client_guest_records where id=p_record_id and client_id=p_client_id and kind=p_kind for update;
    if not found then raise exception 'Guest record not found'; end if;
    if p_expected is null or v_before.updated_at <> p_expected then raise exception using errcode='40001', message='Guest record changed'; end if;
  elsif p_action='delete' then raise exception 'Guest record required'; end if;

  if p_action='save' then
    v_data := coalesce(v_before.data, case when p_kind='guest' then '{"rsvp":"Invited","events":{},"source":"Entered by Couple"}'::jsonb else '{}'::jsonb end) || p_patch;
    if p_kind='guest' then
      if coalesce(trim(v_data->>'first'),'')='' then raise exception 'First name required'; end if;
      if coalesce(v_data->>'household_id','')<>'' and not exists(
        select 1 from public.client_guest_records where client_id=p_client_id and kind='household' and id=(v_data->>'household_id')::uuid
      ) then raise exception 'Household not found'; end if;
      if p_patch ? 'events' then
        if jsonb_typeof(p_patch->'events') is distinct from 'object' then raise exception 'Invalid events'; end if;
        for v_event in select * from jsonb_each(p_patch->'events') loop
          if not(v_settings.events ? v_event.key) or jsonb_typeof(v_event.value)<>'boolean' then raise exception 'Invalid event'; end if;
        end loop;
      end if;
      if p_record_id is null or (v_before.data->>'rsvp') is distinct from (v_data->>'rsvp') then
        v_data := v_data || jsonb_build_object('source','Entered by Couple','rsvp_date',((now() at time zone 'America/New_York')::date)::text);
      end if;
    elsif coalesce(trim(v_data->>'name'),'')='' then raise exception 'Household name required'; end if;
    if p_record_id is null then
      insert into public.client_guest_records(client_id,kind,data,updated_by,added_by_couple) values(p_client_id,p_kind,v_data,p_by,true) returning * into v_after;
    else
      update public.client_guest_records set data=v_data,updated_by=p_by where id=p_record_id and client_id=p_client_id returning * into v_after;
    end if;
  else
    -- Couples remove only what they added. Studio entries stay with the studio.
    if not v_before.added_by_couple then raise exception using errcode='42501', message='Studio guest record'; end if;
    if p_kind='household' then
      update public.client_guest_records set data=jsonb_set(data,'{household_id}','""'::jsonb),updated_by=p_by
        where client_id=p_client_id and kind='guest' and data->>'household_id'=p_record_id::text;
    end if;
    delete from public.client_guest_records where id=p_record_id and client_id=p_client_id;
  end if;

  v_before_data := v_before.data; v_after_data := v_after.data;
  if v_settings.counts_locked and p_kind='guest' and (coalesce(v_before_data->>'rsvp','')='Attending' or coalesce(v_after_data->>'rsvp','')='Attending') then
    v_name := trim(coalesce(v_after_data->>'first',v_before_data->>'first','') || ' ' || coalesce(v_after_data->>'last',v_before_data->>'last',''));
    if v_before_data is null or v_after_data is null then
      v_exceptions := jsonb_build_array(jsonb_build_object('at',clock_timestamp(),'by',p_by,'guest',v_name,'field','guest',
        'from',case when v_before_data is null then 'not on the list' else 'attending' end,
        'to',case when v_after_data is null then 'removed' else 'added, attending' end));
    else
      foreach v_field in array array['rsvp','meal','table_id','severe','allergen','dietary','highchair'] loop
        if (v_before_data->v_field) is distinct from (v_after_data->v_field) then
          v_exceptions := v_exceptions || jsonb_build_array(jsonb_build_object('at',clock_timestamp(),'by',p_by,'guest',v_name,'field',v_field,
            'from',coalesce(v_before_data->>v_field,'blank'),'to',coalesce(v_after_data->>v_field,'blank')));
        end if;
      end loop;
    end if;
    if jsonb_array_length(v_exceptions)>0 then
      v_all := v_settings.exceptions || v_exceptions;
      select coalesce(jsonb_agg(value order by ordinality),'[]'::jsonb) into v_all from jsonb_array_elements(v_all) with ordinality
        where ordinality > greatest(jsonb_array_length(v_all)-500,0);
      update public.client_guest_settings set exceptions=v_all,updated_by=p_by where client_id=p_client_id;
    end if;
  end if;
  return case when p_action='delete' then null else to_jsonb(v_after) end;
end;
$$;
revoke all on function public.mutate_couple_guest(uuid,uuid,text,text,jsonb,timestamptz,text) from public, anon, authenticated;
grant execute on function public.mutate_couple_guest(uuid,uuid,text,text,jsonb,timestamptz,text) to service_role;
notify pgrst, 'reload schema';
commit;
