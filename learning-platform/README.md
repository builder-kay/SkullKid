# AfriLearn

Design and Development of a Gamified Adaptive Learning Platform for African Primary School Students.

This project is a production-style final-year demo built with:

- Next.js 15 + TypeScript
- Tailwind CSS + shadcn-style component primitives
- Framer Motion animations
- PostgreSQL + Prisma ORM
- Supabase Auth + JWT role sessions
- Clifze OTP SMS verification
- Zustand state slices
- Recharts analytics visualizations

## Core Roles

- Student: adaptive pathways, quizzes, XP/levels/badges/streaks, leaderboard
- Teacher: lesson/quiz management, learner tracking, weak-area insights, feedback
- Admin: user/class/subject governance and platform analytics

## Architecture

Detailed architecture documentation is available in `docs/architecture.md`, covering:

- Folder structure
- Database model
- User flows
- Component architecture
- Design system
- API route plan

## Quick Start

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env` and update credentials:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/afralearn?schema=public"
JWT_SECRET="change-this-in-production"
SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
SUPABASE_SERVICE_ROLE_KEY="YOUR_SUPABASE_SERVICE_ROLE_KEY"
CLIFZE_API_KEY="YOUR_CLIFZE_API_KEY"
CLIFZE_SENDER_ID="YOUR_SENDER_ID"
CLIFZE_BASE_URL="https://clifze.shop/api/v1"
CLIFZE_OTP_EXPIRY_MIN="10"
```

### 3) Create Supabase profile table (required for username + phone auth)

Run this SQL in Supabase SQL editor:

```sql
create table if not exists public.profiles (
  id uuid primary key,
  full_name text not null,
  username text unique not null,
  phone text unique not null,
  role text not null check (role in ('STUDENT', 'TEACHER')),
  created_at timestamp with time zone default now()
);
```

Or use the full project SQL pack in `supabase/sql`:

1. `00_reset_public_schema.sql` (wipe existing `public` schema)
2. `01_create_schema.sql` (create all project tables/enums/indexes)
3. `02_seed_basics.sql` (insert starter subjects/badges)

### 4) Initialize local Prisma database (for learning modules)

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

### 5) Run app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Auth Flows (Phone + OTP)

- Sign up: full name + username + Ghana number + role + password -> OTP verification required
- Sign in: username or Ghana number + password
- Forgot password: number-first account check -> OTP -> reset password
- Duplicate number on signup: blocked with sign-in/reset guidance

## Adaptive Rules

- Score >= 80: unlock next lesson, award higher XP, increase difficulty
- Score 50-79: recommend practice and retry
- Score < 50: recommend remedial path and easier practice

Tracked metrics include attempts, score history, weak topics, and consistency.

## API Overview

- Auth:
  - `/api/auth/login`
  - `/api/auth/signup/request-otp`
  - `/api/auth/signup/verify-otp`
  - `/api/auth/password/request-reset`
  - `/api/auth/password/confirm-reset`
  - `/api/auth/me`
- Student: `/api/dashboard/student`, `/api/quizzes/:id/attempt`, `/api/recommendations`, `/api/leaderboard`
- Teacher: `/api/dashboard/teacher`, `/api/lessons`, `/api/quizzes`, `/api/teacher/feedback`
- Admin: `/api/dashboard/admin`, `/api/admin/users`, `/api/admin/subjects`, `/api/admin/classes`

## Accessibility and UX Highlights

- Large readable typography and high contrast UI
- Mobile-first responsive layouts
- One-question-at-a-time quiz interaction
- Friendly error/success messages
- Keyboard-focus visibility and clean information hierarchy
