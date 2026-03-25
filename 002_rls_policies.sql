-- Enable RLS
alter table public.profiles enable row level security;
alter table public.student_assignments enable row level security;
alter table public.hour_logs enable row level security;
alter table public.rubrics enable row level security;
alter table public.rubric_criteria enable row level security;
alter table public.rubric_evaluations enable row level security;
alter table public.evaluation_scores enable row level security;

-- Helper functions (security definer = run as owner, not caller)
create or replace function public.get_my_role() returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;
create or replace function public.get_my_program() returns text language sql security definer stable as $$
  select program from public.profiles where id = auth.uid();
$$;
create or replace function public.is_super_admin() returns boolean language sql security definer stable as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'super_admin');
$$;
create or replace function public.is_my_assigned_student(p_student_id uuid) returns boolean language sql security definer stable as $$
  select exists (select 1 from public.student_assignments where site_supervisor_id = auth.uid() and student_id = p_student_id);
$$;

-- PROFILES
create policy "profiles: read own" on public.profiles for select using (id = auth.uid());
create policy "profiles: supervisors read same program" on public.profiles for select using (program = public.get_my_program() and public.get_my_role() in ('site_supervisor','faculty_supervisor'));
create policy "profiles: super_admin read all" on public.profiles for select using (public.is_super_admin());
create policy "profiles: super_admin insert" on public.profiles for insert with check (public.is_super_admin());
create policy "profiles: update own name" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: super_admin update" on public.profiles for update using (public.is_super_admin());

-- STUDENT_ASSIGNMENTS
create policy "assignments: student reads own" on public.student_assignments for select using (student_id = auth.uid());
create policy "assignments: site supervisor reads own" on public.student_assignments for select using (site_supervisor_id = auth.uid());
create policy "assignments: faculty reads program" on public.student_assignments for select using (public.get_my_role() = 'faculty_supervisor' and program = public.get_my_program());
create policy "assignments: faculty update required_hours" on public.student_assignments for update using (public.get_my_role() = 'faculty_supervisor' and program = public.get_my_program()) with check (public.get_my_role() = 'faculty_supervisor');
create policy "assignments: super_admin all" on public.student_assignments for all using (public.is_super_admin());
create policy "assignments: super_admin insert" on public.student_assignments for insert with check (public.is_super_admin());

-- HOUR_LOGS
create policy "hour_logs: student read own" on public.hour_logs for select using (student_id = auth.uid());
create policy "hour_logs: student insert" on public.hour_logs for insert with check (student_id = auth.uid() and public.get_my_role() = 'student');
create policy "hour_logs: student update pending" on public.hour_logs for update using (student_id = auth.uid() and status = 'pending') with check (student_id = auth.uid());
create policy "hour_logs: site supervisor read assigned" on public.hour_logs for select using (public.is_my_assigned_student(student_id));
create policy "hour_logs: site supervisor update assigned" on public.hour_logs for update using (public.get_my_role() = 'site_supervisor' and public.is_my_assigned_student(student_id) and status = 'pending') with check (public.get_my_role() = 'site_supervisor');
create policy "hour_logs: faculty read program" on public.hour_logs for select using (public.get_my_role() = 'faculty_supervisor' and exists (select 1 from public.student_assignments sa where sa.student_id = hour_logs.student_id and sa.program = public.get_my_program()));
create policy "hour_logs: faculty update site_approved" on public.hour_logs for update using (public.get_my_role() = 'faculty_supervisor' and status = 'site_approved' and exists (select 1 from public.student_assignments sa where sa.student_id = hour_logs.student_id and sa.program = public.get_my_program())) with check (public.get_my_role() = 'faculty_supervisor');
create policy "hour_logs: super_admin all" on public.hour_logs for all using (public.is_super_admin());

-- RUBRICS (program-scoped)
create policy "rubrics: read by program" on public.rubrics for select using (public.is_super_admin() or program = public.get_my_program());
create policy "rubrics: faculty insert" on public.rubrics for insert with check (public.get_my_role() = 'faculty_supervisor' and program = public.get_my_program() and created_by = auth.uid());
create policy "rubrics: faculty update" on public.rubrics for update using (public.get_my_role() = 'faculty_supervisor' and program = public.get_my_program());
create policy "rubrics: super_admin all" on public.rubrics for all using (public.is_super_admin());

-- RUBRIC_CRITERIA (inherits from rubrics)
create policy "rubric_criteria: read by program" on public.rubric_criteria for select using (exists (select 1 from public.rubrics r where r.id = rubric_criteria.rubric_id and (public.is_super_admin() or r.program = public.get_my_program())));
create policy "rubric_criteria: faculty insert" on public.rubric_criteria for insert with check (public.get_my_role() = 'faculty_supervisor' and exists (select 1 from public.rubrics r where r.id = rubric_criteria.rubric_id and r.program = public.get_my_program()));
create policy "rubric_criteria: faculty update" on public.rubric_criteria for update using (public.get_my_role() = 'faculty_supervisor' and exists (select 1 from public.rubrics r where r.id = rubric_criteria.rubric_id and r.program = public.get_my_program()));
create policy "rubric_criteria: super_admin all" on public.rubric_criteria for all using (public.is_super_admin());

-- RUBRIC_EVALUATIONS
create policy "evaluations: student reads own submitted" on public.rubric_evaluations for select using (student_id = auth.uid() and status = 'submitted');
create policy "evaluations: site supervisor read/insert" on public.rubric_evaluations for select using (evaluator_id = auth.uid() or public.is_my_assigned_student(student_id));
create policy "evaluations: site supervisor insert" on public.rubric_evaluations for insert with check (evaluator_id = auth.uid() and public.get_my_role() = 'site_supervisor' and public.is_my_assigned_student(student_id));
create policy "evaluations: site supervisor update draft" on public.rubric_evaluations for update using (evaluator_id = auth.uid() and status = 'draft') with check (evaluator_id = auth.uid());
create policy "evaluations: faculty read program" on public.rubric_evaluations for select using (public.get_my_role() = 'faculty_supervisor' and exists (select 1 from public.rubrics r where r.id = rubric_evaluations.rubric_id and r.program = public.get_my_program()));
create policy "evaluations: super_admin all" on public.rubric_evaluations for all using (public.is_super_admin());

-- EVALUATION_SCORES
create policy "scores: read via evaluation" on public.evaluation_scores for select using (exists (select 1 from public.rubric_evaluations re where re.id = evaluation_scores.evaluation_id and (re.student_id = auth.uid() or re.evaluator_id = auth.uid() or public.get_my_role() in ('faculty_supervisor','super_admin'))));
create policy "scores: evaluator insert/update" on public.evaluation_scores for insert with check (exists (select 1 from public.rubric_evaluations re where re.id = evaluation_scores.evaluation_id and re.evaluator_id = auth.uid() and re.status = 'draft'));
create policy "scores: evaluator update" on public.evaluation_scores for update using (exists (select 1 from public.rubric_evaluations re where re.id = evaluation_scores.evaluation_id and re.evaluator_id = auth.uid() and re.status = 'draft'));
create policy "scores: super_admin all" on public.evaluation_scores for all using (public.is_super_admin());
