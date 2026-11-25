create or replace function public.cancel_appointments(
  p_cancellations jsonb,
  p_reason text,
  p_cancelled_by public.cancellation_actor default 'psychologist'
)
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
    cancelled_by = p_cancelled_by,
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

revoke execute on function public.cancel_appointments(jsonb, text, public.cancellation_actor) from public, anon;
grant execute on function public.cancel_appointments(jsonb, text, public.cancellation_actor) to authenticated;
