create unique index payments_psychologist_receipt_unique
  on public.payments (psychologist_id, receipt_number)
  where receipt_number is not null;

create function public.register_payment(
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
declare
  v_psychologist_id uuid := (select auth.uid());
begin
  perform pg_advisory_xact_lock(hashtextextended(v_psychologist_id::text, 0));

  update public.payments
  set
    status = 'paid',
    method = p_method,
    paid_at = p_paid_at,
    notes = nullif(trim(p_notes), ''),
    receipt_number = (
      select coalesce(max(receipt_number), 0) + 1
      from public.payments
      where psychologist_id = v_psychologist_id
    )
  where appointment_id = p_appointment_id
    and psychologist_id = v_psychologist_id
    and status = 'pending';

  if not found then
    raise exception 'payment_not_pending' using errcode = 'P0001';
  end if;
end;
$$;

create function public.undo_payment(p_appointment_id uuid)
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
    receipt_number = null,
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

revoke execute on function public.register_payment(uuid, public.payment_method, timestamptz, text) from public, anon;
grant execute on function public.register_payment(uuid, public.payment_method, timestamptz, text) to authenticated;

revoke execute on function public.undo_payment(uuid) from public, anon;
grant execute on function public.undo_payment(uuid) to authenticated;
