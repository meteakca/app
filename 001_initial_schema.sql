create extension if not exists "uuid-ossp";

-- profiles: extends auth.users
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  email       text not null,
  role        text not null check (role in ('student','site_supervisor','faculty_supervisor','super_admin')),
  program     text check (program in ('ESPY','COUN') or program is null),
  created_at  timestamptz not null default now()
);

-- student_assignments: links student → site supervisor + faculty supervisor
create table public.student_assignments (
  id                    uuid primary key default uuid_generate_v4(),
  student_id            uuid not null references public.profiles(id),
  site_supervisor_id    uuid not null references public.profiles(id),
  faculty_supervisor_id uuid not null references public.profiles(id),
  program               text not null check (program in ('ESPY','COUN')),
  academic_year         text not null,
  required_hours        integer not null,
  created_at            timestamptz not null default now(),
  unique (student_id, academic_year)
);

-- hour_logs: student-submitted entries
create table public.hour_logs (
  id                   uuid primary key default uuid_generate_v4(),
  student_id           uuid not null references public.profiles(id),
  date                 date not null,
  hours                numeric(4,2) not null check (hours > 0 and hours <= 24),
  activity_description text not null,
  status               text not null default 'pending'
                       check (status in ('pending','site_approved','faculty_approved','rejected')),
  site_approved        boolean not null default false,
  site_approved_at     timestamptz,
  site_approved_by     uuid references public.profiles(id),
  faculty_approved     boolean not null default false,
  faculty_approved_at  timestamptz,
  faculty_approved_by  uuid references public.profiles(id),
  rejection_reason     text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- rubrics: templates created by faculty
create table public.rubrics (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  program       text not null check (program in ('ESPY','COUN')),
  description   text,
  created_by    uuid not null references public.profiles(id),
  academic_year text not null,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- rubric_criteria: scoring dimensions
create table public.rubric_criteria (
  id                      uuid primary key default uuid_generate_v4(),
  rubric_id               uuid not null references public.rubrics(id) on delete cascade,
  name                    text not null,
  description             text,
  max_score               integer not null default 4,
  order_index             integer not null default 0,
  performance_descriptors jsonb,
  created_at              timestamptz not null default now()
);

-- rubric_evaluations: one evaluation per student per rubric per year
create table public.rubric_evaluations (
  id            uuid primary key default uuid_generate_v4(),
  rubric_id     uuid not null references public.rubrics(id),
  student_id    uuid not null references public.profiles(id),
  evaluator_id  uuid not null references public.profiles(id),
  academic_year text not null,
  status        text not null default 'draft' check (status in ('draft','submitted')),
  notes         text,
  submitted_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (rubric_id, student_id, evaluator_id, academic_year)
);

-- evaluation_scores: one row per criterion per evaluation
create table public.evaluation_scores (
  id            uuid primary key default uuid_generate_v4(),
  evaluation_id uuid not null references public.rubric_evaluations(id) on delete cascade,
  criterion_id  uuid not null references public.rubric_criteria(id),
  score         integer not null check (score >= 0),
  comments      text,
  unique (evaluation_id, criterion_id)
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger hour_logs_updated_at before update on public.hour_logs for each row execute function public.set_updated_at();
create trigger rubrics_updated_at before update on public.rubrics for each row execute function public.set_updated_at();
create trigger rubric_evaluations_updated_at before update on public.rubric_evaluations for each row execute function public.set_updated_at();

-- Auto-create profile on new auth user (role/program passed via user_metadata)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email, role, program)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    nullif(new.raw_user_meta_data->>'program', '')
  );
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- Indexes
create index hour_logs_student_id_idx on public.hour_logs(student_id);
create index hour_logs_status_idx on public.hour_logs(status);
create index student_assignments_student_id_idx on public.student_assignments(student_id);
create index student_assignments_site_supervisor_id_idx on public.student_assignments(site_supervisor_id);
create index rubric_evaluations_student_id_idx on public.rubric_evaluations(student_id);
