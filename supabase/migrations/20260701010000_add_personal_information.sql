-- Store extracted CV profile data per authenticated user.

create table if not exists public.personal_information (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  candidate_name text,
  headline text,
  summary text,
  contact jsonb not null default '{}'::jsonb,
  education jsonb not null default '[]'::jsonb,
  experience jsonb not null default '[]'::jsonb,
  projects jsonb not null default '[]'::jsonb,
  skills jsonb not null default '{}'::jsonb,
  certifications jsonb not null default '[]'::jsonb,
  evidence_points jsonb not null default '[]'::jsonb,
  missing_fields jsonb not null default '[]'::jsonb,
  extraction_notes jsonb not null default '[]'::jsonb,
  source text not null default 'cv_extraction',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists personal_information_user_idx
  on public.personal_information (user_id);

drop trigger if exists personal_information_set_updated_at on public.personal_information;

create trigger personal_information_set_updated_at
before update on public.personal_information
for each row execute function public.set_updated_at();

alter table public.personal_information enable row level security;

drop policy if exists "Personal information is owned by user" on public.personal_information;

create policy "Personal information is owned by user"
  on public.personal_information for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.personal_information to authenticated;
