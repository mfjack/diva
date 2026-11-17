update public.patients
  set payment_plan = 'per_session'
  where payment_plan = 'prepaid';

alter table public.patients
  drop constraint patients_monthly_billing_day,
  alter column payment_plan drop default;

alter type public.payment_plan rename to payment_plan_old;

create type public.payment_plan as enum ('per_session', 'monthly');

alter table public.patients
  alter column payment_plan type public.payment_plan
    using payment_plan::text::public.payment_plan,
  alter column payment_plan set default 'per_session',
  add constraint patients_monthly_billing_day check (
    (payment_plan = 'monthly') = (billing_day is not null)
  );

drop type public.payment_plan_old;
