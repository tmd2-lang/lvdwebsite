-- Invoices and their line items.
-- Run once in the Supabase SQL editor. Safe to re-run.

create extension if not exists pgcrypto;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  client_id uuid not null references public.clients(id) on delete cascade,

  -- Human-facing reference, e.g. LVD-1028
  reference text not null,
  name text not null,
  category text,
  phase text,

  issued_on date not null default current_date,
  due_on date,

  status text not null default 'draft',
  notes text,

  constraint invoices_status_check check (
    status in ('draft', 'sent', 'paid', 'void')
  ),
  unique (reference)
);

create index if not exists invoices_client_id_idx on public.invoices (client_id);
create index if not exists invoices_status_idx on public.invoices (status);
create index if not exists invoices_due_on_idx on public.invoices (due_on);

-- One row per payable line. Amounts are stored in cents so that totals are
-- exact: 0.1 + 0.2 in floating point is not 0.3, and this is money.
create table if not exists public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  invoice_id uuid not null references public.invoices(id) on delete cascade,

  name text not null,
  detail text,
  amount_cents bigint not null,
  position integer not null default 0,

  paid boolean not null default false,
  paid_at timestamptz,

  constraint invoice_items_amount_check check (amount_cents >= 0)
);

create index if not exists invoice_items_invoice_id_idx on public.invoice_items (invoice_id);

drop trigger if exists invoices_set_updated_at on public.invoices;

create trigger invoices_set_updated_at
before update on public.invoices
for each row
execute function public.set_updated_at();

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

comment on table public.invoices is 'One invoice for one celebration.';
comment on table public.invoice_items is 'Payable lines. A client may pay these individually.';
comment on column public.invoice_items.amount_cents is 'Cents, not dollars. Integers so totals stay exact.';
