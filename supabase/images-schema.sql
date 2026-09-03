-- Client images: inspiration boards, design references, event galleries.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- Before this works you also need a PRIVATE storage bucket named
-- "client-images" (Storage -> New bucket -> uncheck "Public bucket").
-- Images are never served from a public address: the site checks who is
-- asking and then hands back a link that expires in minutes.

create extension if not exists pgcrypto;

create table if not exists public.client_images (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  client_id uuid not null references public.clients(id) on delete cascade,

  name text not null,
  album text not null default 'Inspiration',
  note text,

  -- Where the file sits in storage. Never a public address.
  storage_path text not null,
  content_type text,
  size_bytes bigint not null default 0,

  -- Kept so the grid can reserve the right space before the image arrives.
  width integer,
  height integer,

  -- Whether the couple can see it. Lets the studio stage a board privately
  -- and reveal the whole thing at once.
  visible_to_client boolean not null default true,

  uploaded_by text,

  constraint client_images_album_check check (
    album in ('Inspiration', 'Design', 'Gallery')
  ),
  unique (storage_path)
);

create index if not exists client_images_client_id_idx on public.client_images (client_id);
create index if not exists client_images_created_at_idx on public.client_images (created_at desc);

alter table public.client_images enable row level security;

comment on table public.client_images is 'Images belonging to one celebration. The file itself lives in the private client-images bucket.';
comment on column public.client_images.storage_path is 'Path inside the private bucket. Not a URL and not publicly reachable.';
comment on column public.client_images.visible_to_client is 'False hides the image from the couple while the studio is still building the board.';
