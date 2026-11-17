create function public.create_appointment_payment()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.payments (
    psychologist_id,
    patient_id,
    appointment_id,
    amount_cents,
    due_date
  )
  select
    new.psychologist_id,
    new.patient_id,
    new.id,
    new.price_cents,
    public.payment_due_date(patient.payment_plan, patient.billing_day, new.starts_at)
  from public.patients as patient
  where patient.id = new.patient_id;
  return new;
end;
$$;

create trigger appointments_create_payment
  after insert on public.appointments
  for each row execute function public.create_appointment_payment();

create function public.sync_appointment_payment()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.payments
    set status = 'waived'
    where appointment_id = new.id
      and status = 'pending';
  end if;

  if new.starts_at is distinct from old.starts_at then
    update public.payments as payment
    set due_date = public.payment_due_date(
      patient.payment_plan,
      patient.billing_day,
      new.starts_at
    )
    from public.patients as patient
    where payment.appointment_id = new.id
      and payment.status = 'pending'
      and patient.id = new.patient_id;
  end if;

  return new;
end;
$$;

create trigger appointments_sync_payment
  after update of status, starts_at on public.appointments
  for each row execute function public.sync_appointment_payment();

create function public.complete_finished_appointments()
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.appointments
  set status = 'completed'
  where psychologist_id = (select auth.uid())
    and status in ('scheduled', 'confirmed')
    and ends_at <= now();
$$;

create function public.create_appointments(
  p_patient_id uuid,
  p_repeat public.session_repeat,
  p_series_starts_on date,
  p_series_ends_on date,
  p_sessions jsonb
)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_patient public.patients;
  v_price_cents integer;
  v_series_id uuid;
  v_created_count integer;
begin
  select * into v_patient
  from public.patients
  where id = p_patient_id
    and psychologist_id = (select auth.uid())
    and deleted_at is null;

  if not found then
    raise exception 'patient_not_found' using errcode = 'P0002';
  end if;

  select coalesce(v_patient.session_price_cents, settings.default_session_price_cents, 0)
  into v_price_cents
  from (select 1) as fallback
  left join public.psychologist_settings as settings
    on settings.psychologist_id = (select auth.uid());

  if p_repeat is not null and p_series_ends_on > p_series_starts_on then
    insert into public.appointment_series (
      psychologist_id,
      patient_id,
      repeat,
      starts_on,
      repeat_until
    )
    values (
      (select auth.uid()),
      p_patient_id,
      p_repeat,
      p_series_starts_on,
      p_series_ends_on
    )
    returning id into v_series_id;
  end if;

  insert into public.appointments (
    psychologist_id,
    patient_id,
    series_id,
    starts_at,
    ends_at,
    modality,
    status,
    price_cents
  )
  select
    (select auth.uid()),
    p_patient_id,
    v_series_id,
    (session ->> 'starts_at')::timestamptz,
    (session ->> 'ends_at')::timestamptz,
    v_patient.preferred_modality,
    'confirmed',
    v_price_cents
  from jsonb_array_elements(p_sessions) as session;

  get diagnostics v_created_count = row_count;
  return v_created_count;
end;
$$;

create function public.cancel_appointments(p_cancellations jsonb, p_reason text)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_cancelled_count integer;
begin
  update public.appointments as appointment
  set
    status = 'cancelled',
    cancelled_at = now(),
    cancelled_by = 'psychologist',
    cancellation_reason = p_reason,
    is_late_cancellation = cancellation.is_late
  from jsonb_to_recordset(p_cancellations) as cancellation(id uuid, is_late boolean)
  where appointment.id = cancellation.id
    and appointment.psychologist_id = (select auth.uid())
    and appointment.status in ('scheduled', 'confirmed');

  get diagnostics v_cancelled_count = row_count;
  return v_cancelled_count;
end;
$$;

revoke execute on function public.complete_finished_appointments() from public, anon;
grant execute on function public.complete_finished_appointments() to authenticated;

revoke execute on function public.create_appointments(uuid, public.session_repeat, date, date, jsonb) from public, anon;
grant execute on function public.create_appointments(uuid, public.session_repeat, date, date, jsonb) to authenticated;

revoke execute on function public.cancel_appointments(jsonb, text) from public, anon;
grant execute on function public.cancel_appointments(jsonb, text) to authenticated;
