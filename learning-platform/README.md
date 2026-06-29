# AfriLearn

Design and Development of a Gamified Adaptive Learning Platform for African Primary School Students.

This project is a production-style final-year demo built with:

- Next.js 15 + TypeScript
- Tailwind CSS + shadcn-style component primitives
- Framer Motion animations
- PostgreSQL + Prisma ORM
- JWT auth + role-based access control
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
```

### 3) Initialize database

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

### 4) Run app

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Seeded Demo Accounts

- Admin: `admin@afralearn.edu`
- Teacher: `teacher@afralearn.edu`
- Student: `student1@afralearn.edu`
- Password: `Password123!`

## Adaptive Rules

- Score >= 80: unlock next lesson, award higher XP, increase difficulty
- Score 50-79: recommend practice and retry
- Score < 50: recommend remedial path and easier practice

Tracked metrics include attempts, score history, weak topics, and consistency.

## API Overview

- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/me`
- Student: `/api/dashboard/student`, `/api/quizzes/:id/attempt`, `/api/recommendations`, `/api/leaderboard`
- Teacher: `/api/dashboard/teacher`, `/api/lessons`, `/api/quizzes`, `/api/teacher/feedback`
- Admin: `/api/dashboard/admin`, `/api/admin/users`, `/api/admin/subjects`, `/api/admin/classes`

## Accessibility and UX Highlights

- Large readable typography and high contrast UI
- Mobile-first responsive layouts
- One-question-at-a-time quiz interaction
- Friendly error/success messages
- Keyboard-focus visibility and clean information hierarchy
