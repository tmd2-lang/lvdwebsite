create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source text not null,
  status text not null default 'new',
  name text,
  email text,
  phone text,
  celebration_type text,
  event_date date,
  date_undecided boolean not null default false,
  venue text,
  guest_count text,
  services text[] not null default '{}',
  vision text,
  investment text,
  referral_source text,
  quiz_score integer,
  quiz_result_tier text,
  payload jsonb not null default '{}'::jsonb,
  user_agent text,
  referrer text,
  ip_hash text,
  constraint leads_source_check check (
    source in ('inquire', 'consultation', 'reserve', 'style_quiz', 'admin', 'imported')
  ),
  constraint leads_status_check check (
    status in ('new', 'reviewing', 'contacted', 'qualified', 'booked', 'archived', 'spam')
  )
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_source_idx on public.leads (source);
create index if not exists leads_email_idx on public.leads (lower(email));

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  author_name text,
  body text not null
);

create index if not exists lead_notes_lead_id_idx on public.lead_notes (lead_id);
create index if not exists lead_notes_created_at_idx on public.lead_notes (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;

create trigger leads_set_updated_at
before update on public.leads
for each row
execute function public.set_updated_at();

alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;

comment on table public.leads is 'Public website lead submissions from inquiry, consultation, reserve, and quiz forms.';
comment on column public.leads.payload is 'Original form payload for fields that do not need first-class columns yet.';
