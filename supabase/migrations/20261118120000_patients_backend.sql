create function public.payment_due_date(
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
    when p_payment_plan = 'monthly' then make_date(
      extract(year from session_day)::integer,
      extract(month from session_day)::integer,
      p_billing_day
    )
    else session_day
  end
  from (
    select (p_starts_at at time zone 'America/Sao_Paulo')::date as session_day
  ) as session;
$$;

create function public.sync_patient_payment_due_dates()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.payments as payment
  set due_date = public.payment_due_date(
    new.payment_plan,
    new.billing_day,
    appointment.starts_at
  )
  from public.appointments as appointment
  where appointment.id = payment.appointment_id
    and payment.patient_id = new.id
    and payment.status = 'pending';
  return new;
end;
$$;

create trigger patients_sync_payment_due_dates
  after update of payment_plan, billing_day on public.patients
  for each row
  when (
    old.payment_plan is distinct from new.payment_plan
    or old.billing_day is distinct from new.billing_day
  )
  execute function public.sync_patient_payment_due_dates();

create view public.patient_summaries
with (security_invoker = true)
as
select
  patient.id,
  patient.psychologist_id,
  patient.full_name,
  patient.email,
  patient.phone,
  patient.birth_date,
  patient.cpf,
  patient.status,
  patient.session_price_cents,
  patient.preferred_modality,
  patient.payment_plan,
  patient.billing_day,
  patient.health_insurance,
  patient.emergency_contact_name,
  patient.emergency_contact_phone,
  patient.notes,
  patient.created_at,
  (
    select min(appointment.starts_at)
    from public.appointments as appointment
    where appointment.patient_id = patient.id
      and appointment.status in ('scheduled', 'confirmed')
      and appointment.starts_at > now()
  ) as next_appointment_at,
  (
    select count(*)
    from public.appointments as appointment
    where appointment.patient_id = patient.id
      and appointment.status = 'completed'
  ) as completed_session_count,
  (
    select coalesce(sum(payment.amount_cents), 0)
    from public.payments as payment
    where payment.patient_id = patient.id
      and payment.status = 'pending'
      and payment.due_date <= (now() at time zone 'America/Sao_Paulo')::date
  ) as pending_amount_cents
from public.patients as patient
where patient.deleted_at is null;

create function public.delete_patient(p_patient_id uuid, p_reason text)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.patients
  set deleted_at = now()
  where id = p_patient_id
    and psychologist_id = (select auth.uid())
    and deleted_at is null;

  if not found then
    raise exception 'patient_not_found' using errcode = 'P0002';
  end if;

  update public.appointments
  set
    status = 'cancelled',
    cancelled_at = now(),
    cancelled_by = 'psychologist',
    cancellation_reason = p_reason,
    is_late_cancellation = false
  where patient_id = p_patient_id
    and psychologist_id = (select auth.uid())
    and status in ('scheduled', 'confirmed')
    and starts_at > now();
end;
$$;

revoke execute on function public.delete_patient(uuid, text) from public, anon;
grant execute on function public.delete_patient(uuid, text) to authenticated;
