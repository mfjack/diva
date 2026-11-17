create type public.study_note_kind as enum (
  'note',
  'reflection',
  'reading',
  'supervision',
  'course'
);

create table public.study_notes (
  id uuid primary key default gen_random_uuid(),
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default '' check (char_length(title) <= 160),
  kind public.study_note_kind not null default 'note',
  content jsonb not null default '{"type": "doc", "content": []}'::jsonb,
  plain_text text not null default '',
  tags text[] not null default '{}' check (cardinality(tags) <= 10),
  source_title text check (char_length(source_title) <= 200),
  source_author text check (char_length(source_author) <= 160),
  source_url text check (source_url ~ '^https?://'),
  is_pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index study_notes_psychologist_updated_idx
  on public.study_notes (psychologist_id, is_pinned desc, updated_at desc)
  where deleted_at is null;

create index study_notes_tags_idx
  on public.study_notes using gin (tags);

alter table public.study_notes enable row level security;

create policy "study_notes: psychologist manages own"
  on public.study_notes for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));
