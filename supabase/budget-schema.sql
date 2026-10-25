-- The client budget: setup, budget lines, and the payment schedule.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Amounts are cents, like invoices, so totals stay exact.

create extension if not exists pgcrypto;

-- One row per celebration: the number the couple approved and how much of it
-- is held back as contingency. Contingency is a reserve, never a spend line.
create table if not exists public.client_budgets (
  client_id uuid primary key references public.clients(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  approved_cents bigint not null default 0,
  contingency_percent numeric(5,2) not null default 10,

  -- Per-couple target share for each category, e.g. {"Catering & Food": 30}.
  category_targets jsonb not null default '{}'::jsonb,

  updated_by text,

  constraint client_budgets_approved_check check (approved_cents >= 0),
  constraint client_budgets_contingency_check check (contingency_percent >= 0 and contingency_percent <= 50)
);

create table if not exists public.client_budget_lines (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  client_id uuid not null references public.clients(id) on delete cascade,

  category text not null,
  -- Who the money goes to: lvd_planning, lvd_design, external, client_direct.
  side text not null default 'external',
  vendor text not null,
  description text,
  status text not null default 'planned',

  estimated_cents bigint not null default 0,
  contracted_cents bigint not null default 0,
  -- Signed: a change can bring a line down as well as up.
  changes_cents bigint not null default 0,

  notes text,
  position integer not null default 0,
  updated_by text,

  constraint client_budget_lines_side_check check (side in ('lvd_planning', 'lvd_design', 'external', 'client_direct')),
  constraint client_budget_lines_status_check check (status in ('planned', 'quoted', 'contracted', 'partially_paid', 'paid', 'canceled')),
  constraint client_budget_lines_vendor_check check (char_length(trim(vendor)) > 0),
  constraint client_budget_lines_amounts_check check (estimated_cents >= 0 and contracted_cents >= 0)
);

create index if not exists client_budget_lines_client_id_idx on public.client_budget_lines (client_id);

create table if not exists public.client_budget_payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  client_id uuid not null references public.clients(id) on delete cascade,
  line_id uuid not null references public.client_budget_lines(id) on delete cascade,

  payment_type text not null default 'installment',
  payer text not null default 'client',
  due_on date,
  amount_cents bigint not null,
  paid_cents bigint not null default 0,
  paid_on date,

  -- Null means work the status out from the dates and balance.
  -- Disputed and waived can only be set by hand.
  manual_status text,

  notes text,
  updated_by text,

  constraint client_budget_payments_type_check check (payment_type in ('retainer', 'installment', 'final_balance', 'overtime', 'refund', 'other')),
  constraint client_budget_payments_payer_check check (payer in ('client', 'lvd', 'family')),
  constraint client_budget_payments_manual_check check (manual_status is null or manual_status in ('disputed', 'waived')),
  constraint client_budget_payments_amounts_check check (paid_cents >= 0)
);

create index if not exists client_budget_payments_client_id_idx on public.client_budget_payments (client_id);
create index if not exists client_budget_payments_line_id_idx on public.client_budget_payments (line_id);

alter table public.client_budgets enable row level security;
alter table public.client_budget_lines enable row level security;
alter table public.client_budget_payments enable row level security;

drop trigger if exists client_budgets_set_updated_at on public.client_budgets;
create trigger client_budgets_set_updated_at before update on public.client_budgets
for each row execute function public.set_updated_at();

drop trigger if exists client_budget_lines_set_updated_at on public.client_budget_lines;
create trigger client_budget_lines_set_updated_at before update on public.client_budget_lines
for each row execute function public.set_updated_at();

drop trigger if exists client_budget_payments_set_updated_at on public.client_budget_payments;
create trigger client_budget_payments_set_updated_at before update on public.client_budget_payments
for each row execute function public.set_updated_at();

comment on table public.client_budgets is 'Approved budget and contingency reserve for one celebration.';
comment on table public.client_budget_lines is 'One budget line per vendor or expense. Forecast = max(estimated, contracted) + changes.';
comment on table public.client_budget_payments is 'Payment schedule against a budget line. Status is worked out unless disputed or waived.';
