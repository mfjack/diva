create table public.expense_payments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  due_on date not null,
  paid_on date not null,
  created_at timestamptz not null default now(),
  unique (expense_id, due_on)
);

create index expense_payments_psychologist_due_on_idx
  on public.expense_payments (psychologist_id, due_on desc);

alter table public.expense_payments enable row level security;

create policy "expense_payments: psychologist manages own"
  on public.expense_payments for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));
