create type public.payment_plan as enum ('per_session', 'prepaid', 'monthly');

alter table public.patients
  add column payment_plan public.payment_plan not null default 'per_session',
  add column billing_day smallint check (billing_day between 1 and 28),
  add constraint patients_monthly_billing_day check (
    (payment_plan = 'monthly') = (billing_day is not null)
  );
