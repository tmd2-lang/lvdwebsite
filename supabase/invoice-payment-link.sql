-- Payment happens outside the site: Irene creates the invoice in Wave (or
-- whatever the studio bills through) and pastes the payment link here. The
-- portal shows a Pay button that opens it.
-- Run once in the Supabase SQL editor. Safe to re-run.

alter table public.invoices
  add column if not exists payment_url text;

comment on column public.invoices.payment_url is 'External payment page for this invoice, e.g. a Wave invoice link. Null means no online payment offered yet.';
