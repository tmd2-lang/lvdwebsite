-- The studio's Wave business is named "Planning & Coordination LVD".
alter table public.wave_connection drop constraint if exists wave_connection_business_name_check;
alter table public.wave_connection add constraint wave_connection_business_name_check check (business_name = 'Planning & Coordination LVD');
