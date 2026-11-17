alter type public.expense_recurrence add value 'installments';

alter table public.expenses
  add column installment_count smallint check (installment_count between 2 and 48),
  add column notes text check (char_length(notes) <= 500);

create table public.expense_attachments (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses (id) on delete cascade,
  psychologist_id uuid not null references public.profiles (id) on delete cascade,
  storage_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 120),
  content_type text not null check (
    content_type in ('application/pdf', 'image/png', 'image/jpeg', 'image/webp')
  ),
  size_bytes integer not null check (size_bytes between 1 and 5242880),
  created_at timestamptz not null default now()
);

create index expense_attachments_expense_idx
  on public.expense_attachments (expense_id);

alter table public.expense_attachments enable row level security;

create policy "expense_attachments: psychologist manages own"
  on public.expense_attachments for all to authenticated
  using (psychologist_id = (select auth.uid()))
  with check (psychologist_id = (select auth.uid()) and (select public.is_psychologist()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'expense-attachments',
  'expense-attachments',
  false,
  5242880,
  array['application/pdf', 'image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do nothing;

create policy "expense attachments: owner reads"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'expense-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "expense attachments: owner uploads"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'expense-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "expense attachments: owner deletes"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'expense-attachments'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
