alter table public.profiles
  add column terms_version text,
  add column terms_accepted_at timestamptz;

create function public.accept_terms(p_version text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set
    terms_version = p_version,
    terms_accepted_at = now()
  where id = (select auth.uid());
$$;

revoke execute on function public.accept_terms(text) from public, anon;
grant execute on function public.accept_terms(text) to authenticated;
