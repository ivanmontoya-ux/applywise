-- ApplyWise initial Supabase schema
-- Run this in Supabase SQL editor or with `supabase db push`.

create extension if not exists pgcrypto;
create extension if not exists citext;

create type public.application_status as enum (
  'Saved',
  'Applied',
  'Interview',
  'Assessment',
  'Offer',
  'Rejected',
  'Withdrawn'
);

create type public.deadline_type as enum (
  'date',
  'rolling',
  'unknown'
);

create type public.work_model as enum (
  'remote',
  'hybrid',
  'onsite',
  'unknown'
);

create type public.job_source as enum (
  'seed',
  'adzuna',
  'manual',
  'imported'
);

create type public.document_type as enum (
  'cv',
  'cover_letter',
  'template',
  'job_specific_cv',
  'other'
);

create type public.document_readiness as enum (
  'missing',
  'partial',
  'complete'
);

create type public.reminder_type as enum (
  'deadline',
  'follow_up',
  'interview_prep',
  'missing_documents',
  'weekly_application_goal'
);

create type public.reminder_status as enum (
  'open',
  'completed',
  'dismissed'
);

create type public.ai_artifact_type as enum (
  'job_requirements',
  'cv_fit_analysis',
  'cv_suggestions',
  'cover_letter',
  'interview_prep',
  'next_step'
);

create type public.review_status as enum (
  'pending',
  'approved',
  'rejected',
  'saved'
);

create type public.waitlist_status as enum (
  'new',
  'contacted',
  'invited',
  'converted',
  'unsubscribed'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique,
  full_name text,
  city text,
  country text,
  graduation_date date,
  target_roles text[] not null default '{}',
  target_industries text[] not null default '{}',
  target_locations text[] not null default '{}',
  preferred_work_model public.work_model not null default 'unknown',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  full_name text,
  location text,
  target_role text,
  strongest_need text,
  source text not null default 'website',
  status public.waitlist_status not null default 'new',
  consent_at timestamptz not null default now(),
  invited_at timestamptz,
  converted_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  title text not null,
  company text not null,
  company_logo text,
  location text,
  city text,
  country text,
  work_model public.work_model not null default 'unknown',
  industry text,
  sector text,
  grand_category text,
  sub_type text,
  experience_level text,
  salary_min numeric(12, 2),
  salary_max numeric(12, 2),
  salary_currency char(3),
  description text,
  source_url text,
  source public.job_source not null default 'seed',
  date_posted timestamptz,
  deadline_type public.deadline_type not null default 'unknown',
  deadline_date date,
  expires_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_salary_range_check check (
    salary_min is null
    or salary_max is null
    or salary_min <= salary_max
  ),
  constraint jobs_deadline_date_check check (
    deadline_type <> 'date'
    or deadline_date is not null
  )
);

create unique index jobs_source_external_id_idx
  on public.jobs (source, external_id)
  where external_id is not null;

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid references public.jobs(id) on delete set null,
  title text not null,
  company text not null,
  location text,
  source_url text,
  industry text,
  sector text,
  work_model public.work_model not null default 'unknown',
  status public.application_status not null default 'Saved',
  date_saved timestamptz not null default now(),
  date_applied timestamptz,
  deadline_type public.deadline_type not null default 'unknown',
  deadline_date date,
  next_action text,
  next_action_due_at timestamptz,
  document_readiness public.document_readiness not null default 'missing',
  notes text,
  is_manual boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_deadline_date_check check (
    deadline_type <> 'date'
    or deadline_date is not null
  )
);

create unique index applications_user_job_unique_idx
  on public.applications (user_id, job_id)
  where job_id is not null;

create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  type public.reminder_type not null,
  title text not null,
  notes text,
  due_at timestamptz,
  status public.reminder_status not null default 'open',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminders_completed_status_check check (
    status <> 'completed'
    or completed_at is not null
  )
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  type public.document_type not null,
  title text not null,
  content_text text,
  storage_path text,
  file_name text,
  mime_type text,
  version integer not null default 1,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint documents_version_positive_check check (version > 0),
  constraint documents_content_or_file_check check (
    content_text is not null
    or storage_path is not null
  )
);

create table public.ai_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  type public.ai_artifact_type not null,
  title text,
  input_snapshot jsonb not null default '{}'::jsonb,
  output jsonb not null default '{}'::jsonb,
  review_status public.review_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.document_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid references public.applications(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  ai_artifact_id uuid references public.ai_artifacts(id) on delete set null,
  section_label text,
  original_text text,
  suggested_text text not null,
  rationale text,
  evidence_note text,
  review_status public.review_status not null default 'pending',
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.application_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  event_type text not null,
  title text not null,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  target_applications integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weekly_goals_target_nonnegative_check check (target_applications >= 0),
  constraint weekly_goals_user_week_unique unique (user_id, week_start)
);

create index jobs_search_idx on public.jobs using gin (
  to_tsvector(
    'english',
    coalesce(title, '') || ' ' ||
    coalesce(company, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(sector, '') || ' ' ||
    coalesce(industry, '')
  )
);
create index jobs_filters_idx on public.jobs (country, city, sector, work_model, date_posted desc);
create index jobs_created_by_idx on public.jobs (created_by);
create index applications_user_status_idx on public.applications (user_id, status, date_saved desc);
create index applications_deadline_idx on public.applications (user_id, deadline_date) where deadline_date is not null;
create index reminders_user_due_idx on public.reminders (user_id, status, due_at);
create index documents_user_type_idx on public.documents (user_id, type, updated_at desc);
create index ai_artifacts_user_application_idx on public.ai_artifacts (user_id, application_id, created_at desc);
create index application_activity_application_idx on public.application_activity (application_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger waitlist_signups_set_updated_at
before update on public.waitlist_signups
for each row execute function public.set_updated_at();

create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create trigger reminders_set_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();

create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create trigger ai_artifacts_set_updated_at
before update on public.ai_artifacts
for each row execute function public.set_updated_at();

create trigger document_suggestions_set_updated_at
before update on public.document_suggestions
for each row execute function public.set_updated_at();

create trigger weekly_goals_set_updated_at
before update on public.weekly_goals
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'applywise-documents',
  'applywise-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do nothing;

alter table public.profiles enable row level security;
alter table public.waitlist_signups enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.reminders enable row level security;
alter table public.documents enable row level security;
alter table public.ai_artifacts enable row level security;
alter table public.document_suggestions enable row level security;
alter table public.application_activity enable row level security;
alter table public.weekly_goals enable row level security;

create policy "Profiles are readable by owner"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Profiles are insertable by owner"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Profiles are updatable by owner"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Anyone can join waitlist"
  on public.waitlist_signups for insert
  to anon, authenticated
  with check (email is not null and consent_at is not null);

create policy "Public jobs are readable"
  on public.jobs for select
  to anon, authenticated
  using (created_by is null or created_by = auth.uid());

create policy "Users can create manual jobs"
  on public.jobs for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "Users can update own manual jobs"
  on public.jobs for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Users can delete own manual jobs"
  on public.jobs for delete
  to authenticated
  using (created_by = auth.uid());

create policy "Applications are readable by owner"
  on public.applications for select
  to authenticated
  using (user_id = auth.uid());

create policy "Applications are insertable by owner"
  on public.applications for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Applications are updatable by owner"
  on public.applications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Applications are deletable by owner"
  on public.applications for delete
  to authenticated
  using (user_id = auth.uid());

create policy "Reminders are owned by user"
  on public.reminders for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Documents are owned by user"
  on public.documents for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "AI artifacts are owned by user"
  on public.ai_artifacts for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Document suggestions are owned by user"
  on public.document_suggestions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Application activity is owned by user"
  on public.application_activity for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Weekly goals are owned by user"
  on public.weekly_goals for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can read own document files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'applywise-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can upload own document files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'applywise-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own document files"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'applywise-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'applywise-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own document files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'applywise-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

grant usage on schema public to anon, authenticated;
grant usage on type public.application_status to anon, authenticated;
grant usage on type public.deadline_type to anon, authenticated;
grant usage on type public.work_model to anon, authenticated;
grant usage on type public.job_source to anon, authenticated;
grant usage on type public.document_type to anon, authenticated;
grant usage on type public.document_readiness to anon, authenticated;
grant usage on type public.reminder_type to anon, authenticated;
grant usage on type public.reminder_status to anon, authenticated;
grant usage on type public.ai_artifact_type to anon, authenticated;
grant usage on type public.review_status to anon, authenticated;
grant usage on type public.waitlist_status to anon, authenticated;
grant select on public.jobs to anon, authenticated;
grant insert on public.waitlist_signups to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.jobs to authenticated;
grant select, insert, update, delete on public.applications to authenticated;
grant select, insert, update, delete on public.reminders to authenticated;
grant select, insert, update, delete on public.documents to authenticated;
grant select, insert, update, delete on public.ai_artifacts to authenticated;
grant select, insert, update, delete on public.document_suggestions to authenticated;
grant select, insert, update, delete on public.application_activity to authenticated;
grant select, insert, update, delete on public.weekly_goals to authenticated;
