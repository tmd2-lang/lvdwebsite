-- Step 4: sales outcomes after the consultation. Safe to run more than once.
-- Prerequisites: leads-schema.sql, lead-activity-schema.sql, lead-appointments-schema.sql.
begin;

alter table public.leads
  add column if not exists consult_outcome text,
  add column if not exists consult_outcome_at timestamptz,
  add column if not exists fit text,
  add column if not exists fit_at timestamptz,
  add column if not exists proposal_amount numeric(12, 2),
  add column if not exists proposal_sent_at timestamptz,
  add column if not exists sales_outcome text,
  add column if not exists booked_amount numeric(12, 2),
  add column if not exists sales_outcome_at timestamptz,
  add column if not exists lost_reason text,
  add column if not exists lost_note text;

alter table public.leads drop constraint if exists leads_consult_outcome_check;
alter table public.leads add constraint leads_consult_outcome_check check (consult_outcome in ('completed', 'no_show'));
alter table public.leads drop constraint if exists leads_fit_check;
alter table public.leads add constraint leads_fit_check check (fit in ('good_fit', 'not_fit'));
alter table public.leads drop constraint if exists leads_sales_outcome_check;
alter table public.leads add constraint leads_sales_outcome_check check (sales_outcome in ('booked', 'lost'));
alter table public.leads drop constraint if exists leads_lost_reason_check;
alter table public.leads add constraint leads_lost_reason_check check (lost_reason in
  ('budget', 'no_response', 'went_elsewhere', 'date_unavailable', 'wrong_service', 'other'));

alter table public.lead_activity drop constraint if exists lead_activity_kind_check;
alter table public.lead_activity add constraint lead_activity_kind_check check (kind in (
  'viewed', 'status_changed', 'note_added',
  'appointment_scheduled', 'appointment_canceled', 'appointment_rescheduled', 'sales_update'));

-- One click = one atomic change + one activity row. Status follows forward only,
-- so existing cards and filters keep working; undo never moves status back.
create or replace function public.apply_sales_update(
  p_lead_id uuid, p_actor_id text, p_actor_name text, p_action text,
  p_amount numeric default null, p_reason text default null, p_note text default null
) returns jsonb language plpgsql set search_path = public as $$
declare
  lead_row public.leads;
  event public.lead_activity;
  next_status text;
  summary text;
begin
  select * into lead_row from public.leads where id = p_lead_id for update;
  if not found then raise exception 'Inquiry not found'; end if;
  next_status := lead_row.status;

  if p_action in ('consult_completed', 'consult_no_show') then
    update public.leads set consult_outcome = case when p_action = 'consult_completed' then 'completed' else 'no_show' end,
      consult_outcome_at = now() where id = p_lead_id;
    if p_action = 'consult_completed' and lead_row.status in ('new', 'reviewing') then next_status := 'contacted'; end if;
    summary := case when p_action = 'consult_completed' then 'Consult completed' else 'Consult no-show' end;
  elsif p_action = 'consult_clear' then
    update public.leads set consult_outcome = null, consult_outcome_at = null where id = p_lead_id;
    summary := 'Undid consult outcome';
  elsif p_action in ('fit_good', 'fit_not') then
    update public.leads set fit = case when p_action = 'fit_good' then 'good_fit' else 'not_fit' end, fit_at = now() where id = p_lead_id;
    if lead_row.status <> 'booked' then next_status := case when p_action = 'fit_good' then 'qualified' else 'spam' end; end if;
    summary := case when p_action = 'fit_good' then 'Good fit' else 'Not a fit' end;
  elsif p_action = 'fit_clear' then
    update public.leads set fit = null, fit_at = null where id = p_lead_id;
    summary := 'Undid fit';
  elsif p_action = 'proposal_sent' then
    if p_amount is null or p_amount <= 0 or p_amount > 10000000 then raise exception 'Enter the proposal amount'; end if;
    update public.leads set proposal_amount = round(p_amount, 2), proposal_sent_at = now() where id = p_lead_id;
    summary := 'Proposal sent · $' || to_char(round(p_amount, 2), 'FM999,999,990.00');
  elsif p_action = 'proposal_clear' then
    update public.leads set proposal_amount = null, proposal_sent_at = null where id = p_lead_id;
    summary := 'Undid proposal';
  elsif p_action = 'booked' then
    if p_amount is null or p_amount <= 0 or p_amount > 10000000 then raise exception 'Enter the booked amount'; end if;
    update public.leads set sales_outcome = 'booked', booked_amount = round(p_amount, 2), lost_reason = null, lost_note = null,
      sales_outcome_at = now() where id = p_lead_id;
    next_status := 'booked';
    summary := 'Booked · $' || to_char(round(p_amount, 2), 'FM999,999,990.00');
  elsif p_action = 'lost' then
    if p_reason is null or p_reason not in ('budget', 'no_response', 'went_elsewhere', 'date_unavailable', 'wrong_service', 'other') then
      raise exception 'Choose a reason';
    end if;
    update public.leads set sales_outcome = 'lost', booked_amount = null, lost_reason = p_reason,
      lost_note = nullif(left(trim(coalesce(p_note, '')), 500), ''), sales_outcome_at = now() where id = p_lead_id;
    next_status := 'archived';
    summary := 'Lost · ' || case p_reason when 'budget' then 'Budget' when 'no_response' then 'No response'
      when 'went_elsewhere' then 'Went with someone else' when 'date_unavailable' then 'Date unavailable'
      when 'wrong_service' then 'Wanted a different service' else 'Other' end;
  elsif p_action = 'outcome_clear' then
    update public.leads set sales_outcome = null, booked_amount = null, lost_reason = null, lost_note = null,
      sales_outcome_at = null where id = p_lead_id;
    summary := 'Undid booked/lost';
  else
    raise exception 'Invalid sales action';
  end if;

  if next_status <> lead_row.status then
    update public.leads set status = next_status where id = p_lead_id;
  end if;
  insert into public.lead_activity (lead_id, actor_id, actor_name, kind, detail)
    values (p_lead_id, p_actor_id, p_actor_name, 'sales_update', summary) returning * into event;
  select * into lead_row from public.leads where id = p_lead_id;
  return jsonb_build_object('lead', jsonb_build_object(
    'id', lead_row.id, 'status', lead_row.status, 'updated_at', lead_row.updated_at,
    'consult_outcome', lead_row.consult_outcome, 'consult_outcome_at', lead_row.consult_outcome_at,
    'fit', lead_row.fit, 'fit_at', lead_row.fit_at,
    'proposal_amount', lead_row.proposal_amount, 'proposal_sent_at', lead_row.proposal_sent_at,
    'sales_outcome', lead_row.sales_outcome, 'booked_amount', lead_row.booked_amount,
    'sales_outcome_at', lead_row.sales_outcome_at, 'lost_reason', lead_row.lost_reason, 'lost_note', lead_row.lost_note
  ), 'activity', to_jsonb(event));
end;
$$;
revoke all on function public.apply_sales_update(uuid, text, text, text, numeric, text, text) from public, anon, authenticated;
grant execute on function public.apply_sales_update(uuid, text, text, text, numeric, text, text) to service_role;
commit;
notify pgrst, 'reload schema';
