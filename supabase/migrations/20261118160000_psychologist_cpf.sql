alter table public.psychologist_settings
  add column cpf text check (cpf ~ '^\d{11}$');
