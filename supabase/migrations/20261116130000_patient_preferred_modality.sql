alter table public.patients
  add column preferred_modality public.appointment_modality not null
    default 'in_person';
