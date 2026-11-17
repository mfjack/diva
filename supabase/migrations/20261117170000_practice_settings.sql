alter table public.psychologist_settings
  alter column professional_registration drop not null;

revoke update on public.profiles from authenticated;
grant update (full_name, phone, updated_at) on public.profiles to authenticated;

drop policy "psychologist_settings: read by authenticated" on public.psychologist_settings;
drop policy "availability_rules: read by authenticated" on public.availability_rules;

create function public.replace_availability_rules(p_rules jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select public.is_psychologist()) then
    raise exception 'not_psychologist' using errcode = '42501';
  end if;

  delete from public.availability_rules
  where psychologist_id = (select auth.uid());

  insert into public.availability_rules (
    psychologist_id,
    weekday,
    start_time,
    end_time,
    modality
  )
  select
    (select auth.uid()),
    (rule ->> 'weekday')::smallint,
    (rule ->> 'start_time')::time,
    (rule ->> 'end_time')::time,
    nullif(rule ->> 'modality', '')::public.appointment_modality
  from jsonb_array_elements(p_rules) as rule;
end;
$$;

revoke execute on function public.replace_availability_rules(jsonb) from public, anon;
grant execute on function public.replace_availability_rules(jsonb) to authenticated;
