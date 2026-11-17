create type public.session_repeat as enum ('weekly', 'biweekly');

create table public.appointment_series (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  patient_id uuid not null references public.patients (id) on delete restrict,
  repeat public.session_repeat not null,
  starts_on date not null,
  repeat_until date not null,
  created_at timestamptz not null default now(),
  check (repeat_until > starts_on),
  check (repeat_until <= starts_on + 183)
);

create index appointment_series_psychologist_idx
  on public.appointment_series (psychologist_id, starts_on desc);

alter table public.appointment_series enable row level security;

create policy "appointment_series: psychologist manages own"
  on public.appointment_series for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

alter table public.appointments
  add column series_id uuid references public.appointment_series (id) on delete set null;

create index appointments_series_starts_at_idx
  on public.appointments (series_id, starts_at)
  where series_id is not null;
