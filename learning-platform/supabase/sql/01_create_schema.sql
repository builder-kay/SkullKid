begin;

create extension if not exists "pgcrypto";

-- =========
-- Enums
-- =========
create type public.app_role as enum ('STUDENT', 'TEACHER', 'ADMIN');
create type public.subject_code as enum ('MATHEMATICS', 'ENGLISH', 'SCIENCE');
create type public.recommendation_type as enum ('NEXT_LESSON', 'PRACTICE', 'REMEDIAL');

-- =========
-- Utility trigger
-- =========
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========
-- Core identity profile (linked to Supabase Auth)
-- =========
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text not null unique,
  phone text not null unique,
  role public.app_role not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- =========
-- Academic structures
-- =========
create table public.classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade int not null check (grade between 1 and 12),
  teacher_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_classrooms_updated_at
before update on public.classrooms
for each row
execute function public.set_updated_at();

create table public.classroom_students (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(classroom_id, student_id)
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  code public.subject_code not null unique,
  title text not null,
  description text,
  classroom_id uuid references public.classrooms(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_subjects_updated_at
before update on public.subjects
for each row
execute function public.set_updated_at();

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  description text not null,
  content text not null,
  difficulty int not null default 1 check (difficulty between 1 and 3),
  order_index int not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(subject_id, order_index)
);

create trigger trg_lessons_updated_at
before update on public.lessons
for each row
execute function public.set_updated_at();

-- =========
-- Quiz engine
-- =========
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references public.lessons(id) on delete cascade,
  title text not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_quizzes_updated_at
before update on public.quizzes
for each row
execute function public.set_updated_at();

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  prompt text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text,
  difficulty int not null default 1 check (difficulty between 1 and 3),
  topic_tag text not null,
  order_index int not null,
  created_at timestamptz not null default now(),
  unique(quiz_id, order_index)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  score int not null check (score between 0 and 100),
  total_questions int not null check (total_questions >= 0),
  correct_count int not null check (correct_count >= 0),
  duration_sec int,
  created_at timestamptz not null default now()
);

create table public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  question_id uuid not null references public.quiz_questions(id) on delete cascade,
  selected_answer text not null,
  is_correct boolean not null,
  created_at timestamptz not null default now()
);

-- =========
-- Adaptive progress
-- =========
create table public.progress_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completion numeric(5,2) not null default 0,
  best_score int not null default 0,
  attempts int not null default 0,
  weak_topics text[] not null default '{}',
  consistency numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(student_id, lesson_id)
);

create trigger trg_progress_records_updated_at
before update on public.progress_records
for each row
execute function public.set_updated_at();

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  type public.recommendation_type not null,
  reason text not null,
  is_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========
-- Gamification
-- =========
create table public.student_stats (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  xp int not null default 0,
  level text not null default 'Explorer',
  streak_days int not null default 0,
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_student_stats_updated_at
before update on public.student_stats
for each row
execute function public.set_updated_at();

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon text not null,
  created_at timestamptz not null default now()
);

create table public.student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  unique(student_id, badge_id)
);

create table public.leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  xp int not null default 0,
  score int not null default 0 check (score between 0 and 100),
  rank int not null check (rank > 0),
  period text not null default 'weekly',
  created_at timestamptz not null default now()
);

-- =========
-- Communication
-- =========
create table public.feedback_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

-- =========
-- Indexes
-- =========
create index idx_profiles_role on public.profiles(role);
create index idx_profiles_phone on public.profiles(phone);
create index idx_classrooms_teacher on public.classrooms(teacher_id);
create index idx_classroom_students_student on public.classroom_students(student_id);
create index idx_lessons_subject on public.lessons(subject_id);
create index idx_quiz_attempts_student on public.quiz_attempts(student_id);
create index idx_quiz_attempts_quiz on public.quiz_attempts(quiz_id);
create index idx_progress_records_student on public.progress_records(student_id);
create index idx_recommendations_student on public.recommendations(student_id);
create index idx_feedback_recipient on public.feedback_messages(recipient_id);
create index idx_leaderboard_filter on public.leaderboard_snapshots(classroom_id, subject_id, period, rank);

commit;
