create or replace function public.payment_due_date(
  p_payment_plan public.payment_plan,
  p_billing_day smallint,
  p_starts_at timestamptz
)
returns date
language sql
stable
set search_path = ''
as $$
  select case
    when p_payment_plan = 'monthly_before' then make_date(
      extract(year from session_day)::integer,
      extract(month from session_day)::integer,
      p_billing_day
    )
    when p_payment_plan = 'monthly_after' then make_date(
      extract(year from next_month)::integer,
      extract(month from next_month)::integer,
      p_billing_day
    )
    else session_day
  end
  from (
    select
      (p_starts_at at time zone 'America/Sao_Paulo')::date as session_day,
      ((p_starts_at at time zone 'America/Sao_Paulo')::date + interval '1 month')::date as next_month
  ) as session;
$$;

alter table public.patients
  drop constraint patients_monthly_billing_day,
  add constraint patients_monthly_billing_day check (
    (payment_plan in ('monthly_before', 'monthly_after')) = (billing_day is not null)
  );
