create type public.expense_recurrence as enum ('once', 'weekly', 'monthly');

alter table public.expenses rename column spent_on to starts_on;

alter index public.expenses_psychologist_spent_on_idx
  rename to expenses_psychologist_starts_on_idx;

alter table public.expenses
  add column recurrence public.expense_recurrence not null default 'once',
  add column ends_on date,
  add constraint expenses_ends_after_start
    check (ends_on is null or ends_on >= starts_on);
