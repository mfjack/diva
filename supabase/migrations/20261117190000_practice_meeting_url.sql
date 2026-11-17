alter table public.psychologist_settings
  add column meeting_url text check (meeting_url ~ '^https://');
