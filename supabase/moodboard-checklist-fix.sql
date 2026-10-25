-- Correct only the checklist task in the already-installed moodboard functions.
-- Does not change client records, images, versions or approvals.
begin;
do $fix$
begin
  execute replace(pg_get_functiondef('public.publish_client_moodboard(uuid,uuid,text,jsonb,uuid[],text,text)'::regprocedure), 'LVD-102', 'LVD-101');
  execute replace(pg_get_functiondef('public.approve_client_moodboard(uuid,uuid,uuid,text)'::regprocedure), 'LVD-102', 'LVD-101');
end;
$fix$;
notify pgrst, 'reload schema';
commit;
