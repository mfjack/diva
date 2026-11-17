drop function public.create_appointments(uuid, public.session_repeat, date, date, jsonb);

create function public.create_appointments(
  p_patient_id uuid,
  p_sessions jsonb,
  p_repeat public.session_repeat default null,
  p_series_starts_on date default null,
  p_series_ends_on date default null
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

revoke execute on function public.create_appointments(uuid, jsonb, public.session_repeat, date, date) from public, anon;
grant execute on function public.create_appointments(uuid, jsonb, public.session_repeat, date, date) to authenticated;
