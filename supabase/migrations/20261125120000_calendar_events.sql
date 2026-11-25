create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  series_id uuid,
  title text not null check (char_length(title) between 1 and 120),
  notes text check (char_length(notes) <= 500),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index calendar_events_psychologist_starts_at_idx
  on public.calendar_events (psychologist_id, starts_at);

create index calendar_events_series_starts_at_idx
  on public.calendar_events (series_id, starts_at)
  where series_id is not null;

create trigger calendar_events_set_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

alter table public.calendar_events enable row level security;

create policy "calendar_events: psychologist manages own"
  on public.calendar_events for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));
