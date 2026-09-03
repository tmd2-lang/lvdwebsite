-- Soft delete for client documents.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Same reasoning as images: contracts and signed proposals are worse to lose
-- than photographs. Removing a document hides it everywhere and leaves the
-- file in storage until somebody deletes it on purpose.

alter table public.documents
  add column if not exists deleted_at timestamptz;

create index if not exists documents_deleted_at_idx
  on public.documents (deleted_at);

comment on column public.documents.deleted_at is
  'When the studio removed this document. Null means live. Set means hidden from every view but still recoverable, and the file is still in storage.';
