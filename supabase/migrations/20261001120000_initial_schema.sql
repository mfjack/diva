create extension if not exists btree_gist with schema extensions;

create type public.user_role as enum ('psychologist', 'patient');

create type public.appointment_modality as enum ('in_person', 'online');

create type public.appointment_status as enum (
  'scheduled',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

create type public.cancellation_actor as enum ('patient', 'psychologist');

create type public.payment_status as enum ('pending', 'paid', 'waived', 'refunded');

create type public.payment_method as enum (
  'pix',
  'cash',
  'credit_card',
  'debit_card',
  'bank_transfer'
);

create type public.clinical_record_kind as enum (
  'session_note',
  'report',
  'certificate',
  'referral'
);

create type public.patient_status as enum ('active', 'paused', 'discharged');

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 1 and 120),
  phone text check (phone ~ '^\d{10,11}$'),
  role public.user_role not null default 'patient',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.is_psychologist()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.role = 'psychologist'
  );
$$;

create table public.psychologist_settings (
  psychologist_id uuid primary key references public.profiles (id) on delete cascade,
  professional_registration text not null
    check (char_length(professional_registration) between 3 and 30),
  bio text check (char_length(bio) <= 1000),
  session_duration_minutes integer not null
    check (session_duration_minutes between 15 and 240),
  default_session_price_cents integer not null
    check (default_session_price_cents >= 0),
  cancellation_notice_hours integer not null
    check (cancellation_notice_hours between 0 and 168),
  booking_window_days integer not null
    check (booking_window_days between 1 and 365),
  minimum_booking_notice_hours integer not null default 2
    check (minimum_booking_notice_hours between 0 and 168),
  pix_key text check (char_length(pix_key) <= 140),
  office_address text check (char_length(office_address) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger psychologist_settings_set_updated_at
  before update on public.psychologist_settings
  for each row execute function public.set_updated_at();

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete restrict,
  user_id uuid references public.profiles (id) on delete set null,
  full_name text not null check (char_length(full_name) between 1 and 120),
  email text,
  phone text check (phone ~ '^\d{10,11}$'),
  birth_date date,
  cpf text check (cpf ~ '^\d{11}$'),
  session_price_cents integer check (session_price_cents >= 0),
  status public.patient_status not null default 'active',
  emergency_contact_name text,
  emergency_contact_phone text check (emergency_contact_phone ~ '^\d{10,11}$'),
  health_insurance text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index patients_psychologist_id_idx on public.patients (psychologist_id)
  where deleted_at is null;

create unique index patients_psychologist_user_unique
  on public.patients (psychologist_id, user_id)
  where user_id is not null and deleted_at is null;

create trigger patients_set_updated_at
  before update on public.patients
  for each row execute function public.set_updated_at();

create table public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  modality public.appointment_modality,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index availability_rules_psychologist_id_idx
  on public.availability_rules (psychologist_id, weekday);

create trigger availability_rules_set_updated_at
  before update on public.availability_rules
  for each row execute function public.set_updated_at();

create table public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  reason text check (char_length(reason) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index availability_blocks_psychologist_period_idx
  on public.availability_blocks (psychologist_id, starts_at);

create trigger availability_blocks_set_updated_at
  before update on public.availability_blocks
  for each row execute function public.set_updated_at();

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete restrict,
  patient_id uuid not null references public.patients (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  modality public.appointment_modality not null,
  status public.appointment_status not null default 'scheduled',
  price_cents integer not null check (price_cents >= 0),
  meeting_url text,
  rescheduled_from_id uuid references public.appointments (id) on delete set null,
  cancelled_at timestamptz,
  cancelled_by public.cancellation_actor,
  cancellation_reason text check (char_length(cancellation_reason) <= 500),
  is_late_cancellation boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (
    (status = 'cancelled') = (
      cancelled_at is not null
      and cancelled_by is not null
      and cancellation_reason is not null
    )
  ),
  constraint appointments_no_overlap exclude using gist (
    psychologist_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status <> 'cancelled')
);

create index appointments_psychologist_starts_at_idx
  on public.appointments (psychologist_id, starts_at);

create index appointments_patient_starts_at_idx
  on public.appointments (patient_id, starts_at);

create trigger appointments_set_updated_at
  before update on public.appointments
  for each row execute function public.set_updated_at();

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete restrict,
  patient_id uuid not null references public.patients (id) on delete restrict,
  appointment_id uuid not null unique references public.appointments (id) on delete restrict,
  amount_cents integer not null check (amount_cents >= 0),
  status public.payment_status not null default 'pending',
  method public.payment_method,
  due_date date not null,
  paid_at timestamptz,
  gateway_charge_id text unique,
  receipt_number integer,
  notes text check (char_length(notes) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'paid') = (paid_at is not null))
);

create index payments_psychologist_status_due_idx
  on public.payments (psychologist_id, status, due_date);

create index payments_patient_idx on public.payments (patient_id);

create trigger payments_set_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

create table public.processed_webhook_events (
  event_id text primary key,
  provider text not null,
  processed_at timestamptz not null default now()
);

create table public.clinical_records (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete restrict,
  patient_id uuid not null references public.patients (id) on delete restrict,
  appointment_id uuid references public.appointments (id) on delete set null,
  kind public.clinical_record_kind not null,
  title text not null check (char_length(title) between 1 and 200),
  encrypted_content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index clinical_records_patient_idx
  on public.clinical_records (psychologist_id, patient_id)
  where deleted_at is null;

create trigger clinical_records_set_updated_at
  before update on public.clinical_records
  for each row execute function public.set_updated_at();

create table public.document_templates (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  kind public.clinical_record_kind not null,
  title text not null check (char_length(title) between 1 and 200),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index document_templates_psychologist_idx
  on public.document_templates (psychologist_id);

create trigger document_templates_set_updated_at
  before update on public.document_templates
  for each row execute function public.set_updated_at();

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);

create index audit_logs_actor_idx on public.audit_logs (actor_user_id, created_at);

alter table public.profiles enable row level security;
alter table public.psychologist_settings enable row level security;
alter table public.patients enable row level security;
alter table public.availability_rules enable row level security;
alter table public.availability_blocks enable row level security;
alter table public.appointments enable row level security;
alter table public.payments enable row level security;
alter table public.processed_webhook_events enable row level security;
alter table public.clinical_records enable row level security;
alter table public.document_templates enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles: read own"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: update own"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

revoke update on public.profiles from authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

create policy "psychologist_settings: read by authenticated"
  on public.psychologist_settings for select to authenticated
  using (true);

create policy "psychologist_settings: psychologist manages own"
  on public.psychologist_settings for all to authenticated
  using (psychologist_id = (select auth.uid()) and (select public.is_psychologist()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

create policy "patients: psychologist manages own"
  on public.patients for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

create policy "patients: patient reads own"
  on public.patients for select to authenticated
  using (user_id = (select auth.uid()) and deleted_at is null);

create policy "availability_rules: read by authenticated"
  on public.availability_rules for select to authenticated
  using (true);

create policy "availability_rules: psychologist manages own"
  on public.availability_rules for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

create policy "availability_blocks: psychologist manages own"
  on public.availability_blocks for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

create policy "appointments: psychologist manages own"
  on public.appointments for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

create policy "appointments: patient reads own"
  on public.appointments for select to authenticated
  using (
    exists (
      select 1 from public.patients p
      where p.id = patient_id
        and p.user_id = (select auth.uid())
        and p.deleted_at is null
    )
  );

create policy "payments: psychologist manages own"
  on public.payments for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

create policy "payments: patient reads own"
  on public.payments for select to authenticated
  using (
    exists (
      select 1 from public.patients p
      where p.id = patient_id
        and p.user_id = (select auth.uid())
        and p.deleted_at is null
    )
  );

create policy "clinical_records: psychologist manages own"
  on public.clinical_records for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

create policy "document_templates: psychologist manages own"
  on public.document_templates for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

create policy "audit_logs: insert own"
  on public.audit_logs for insert to authenticated
  with check (actor_user_id = (select auth.uid()));

create policy "audit_logs: psychologist reads own"
  on public.audit_logs for select to authenticated
  using (actor_user_id = (select auth.uid()) and (select public.is_psychologist()));
