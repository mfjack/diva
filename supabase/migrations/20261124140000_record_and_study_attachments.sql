alter table public.study_notes
  alter column kind drop default,
  alter column kind type text using (
    case kind::text
      when 'note' then 'Anotação'
      when 'reflection' then 'Reflexão'
      when 'reading' then 'Leitura'
      when 'supervision' then 'Supervisão'
      when 'course' then 'Curso/aula'
      else kind::text
    end
  ),
  alter column kind set default 'Anotação',
  add constraint study_notes_kind_length check (char_length(kind) between 1 and 40);

drop type public.study_note_kind;

create index study_notes_psychologist_kind_idx
  on public.study_notes (psychologist_id, kind)
  where deleted_at is null;

create table public.clinical_record_attachments (
  id uuid primary key default gen_random_uuid(),
  record_id uuid not null references public.clinical_records (id) on delete cascade,
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 120),
  content_type text not null check (
    content_type in ('application/pdf', 'image/png', 'image/jpeg', 'image/webp')
  ),
  size_bytes integer not null check (size_bytes between 1 and 5242880),
  created_at timestamptz not null default now()
);

create index clinical_record_attachments_record_idx
  on public.clinical_record_attachments (record_id);

alter table public.clinical_record_attachments enable row level security;

create policy "clinical_record_attachments: psychologist manages own"
  on public.clinical_record_attachments for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

create table public.study_note_attachments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.study_notes (id) on delete cascade,
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 120),
  content_type text not null check (
    content_type in ('application/pdf', 'image/png', 'image/jpeg', 'image/webp')
  ),
  size_bytes integer not null check (size_bytes between 1 and 5242880),
  created_at timestamptz not null default now()
);

create index study_note_attachments_note_idx
  on public.study_note_attachments (note_id);

alter table public.study_note_attachments enable row level security;

create policy "study_note_attachments: psychologist manages own"
  on public.study_note_attachments for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'clinical-record-attachments',
    'clinical-record-attachments',
    false,
    5243904,
    array['application/octet-stream']
  ),
  (
    'study-note-attachments',
    'study-note-attachments',
    false,
    5242880,
    array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
  )
on conflict (id) do nothing;

create policy "clinical record attachments: owner reads"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'clinical-record-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "clinical record attachments: owner uploads"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'clinical-record-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "clinical record attachments: owner deletes"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'clinical-record-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "study note attachments: owner reads"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'study-note-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "study note attachments: owner uploads"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'study-note-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "study note attachments: owner deletes"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'study-note-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
