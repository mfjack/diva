drop index public.payments_psychologist_receipt_unique;

create or replace function public.register_payment(
  p_appointment_id uuid,
  p_method public.payment_method,
  p_paid_at timestamptz,
  p_notes text
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.payments
  set
    status = 'paid',
    method = p_method,
    paid_at = p_paid_at,
    notes = nullif(trim(p_notes), '')
  where appointment_id = p_appointment_id
    and psychologist_id = (select auth.uid())
    and status = 'pending';

  if not found then
    raise exception 'payment_not_pending' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function public.undo_payment(p_appointment_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.payments as payment
  set
    status = 'pending',
    method = null,
    paid_at = null,
    notes = null,
    due_date = public.payment_due_date(
      patient.payment_plan,
      patient.billing_day,
      appointment.starts_at
    )
  from public.appointments as appointment
  join public.patients as patient on patient.id = appointment.patient_id
  where payment.appointment_id = p_appointment_id
    and appointment.id = payment.appointment_id
    and payment.psychologist_id = (select auth.uid())
    and payment.status = 'paid';

  if not found then
    raise exception 'payment_not_paid' using errcode = 'P0001';
  end if;
end;
$$;

update public.payments set receipt_number = null where receipt_number is not null;
