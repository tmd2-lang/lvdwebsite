-- A name to go with each invited email address.
-- Run once in the Supabase SQL editor. Safe to re-run.
--
-- This is the name the studio typed when inviting them. Once the person signs
-- in and sets their own name, that one wins: the list should show what people
-- call themselves, not what we guessed.

alter table public.client_users
  add column if not exists invited_name text;

comment on column public.client_users.invited_name is
  'Name the studio typed on the invitation. A name the person sets themselves takes precedence.';
