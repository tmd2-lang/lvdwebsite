-- Soft delete for client images.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Removing an image no longer destroys it. The row is stamped with a time and
-- hidden everywhere; the file stays in storage until somebody purges it on
-- purpose. These are wedding photographs, so a misclick must be recoverable.

alter table public.client_images
  add column if not exists deleted_at timestamptz;

-- Every listing filters on this, so it earns an index.
create index if not exists client_images_deleted_at_idx
  on public.client_images (deleted_at);

comment on column public.client_images.deleted_at is
  'When the studio removed this image. Null means live. Set means hidden from every view but still recoverable, and the file is still in storage.';
