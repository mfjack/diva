create type public.expense_category as enum (
  'supervision',
  'education',
  'materials',
  'office',
  'software',
  'taxes',
  'other'
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  description text not null check (char_length(description) between 1 and 120),
  category public.expense_category not null,
  amount_cents integer not null check (amount_cents > 0),
  spent_on date not null,
  created_at timestamptz not null default now()
);

create index expenses_psychologist_spent_on_idx
  on public.expenses (psychologist_id, spent_on desc);

alter table public.expenses enable row level security;

create policy "expenses: psychologist manages own"
  on public.expenses for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));
