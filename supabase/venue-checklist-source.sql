-- Lets the venue checklist landing page (/venue-checklist) save signups as leads.
-- Adds 'venue_checklist' to the allowed lead sources. Safe to run more than once.

alter table public.leads drop constraint if exists leads_source_check;
alter table public.leads add constraint leads_source_check check (
  source in ('inquire', 'consultation', 'reserve', 'style_quiz', 'venue_checklist', 'admin', 'imported')
);
