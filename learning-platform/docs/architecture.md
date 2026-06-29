# Gamified Adaptive Learning Platform - Architecture Blueprint

## 1) Project Folder Structure

```text
learning-platform/
  prisma/
    schema.prisma
    seed.ts
  src/
    app/
      (public)/
        page.tsx
        sign-in/page.tsx
      (student)/
        student/dashboard/page.tsx
        student/subjects/[subjectId]/page.tsx
        student/quiz/[quizId]/page.tsx
        student/leaderboard/page.tsx
      (teacher)/
        teacher/dashboard/page.tsx
        teacher/lessons/page.tsx
        teacher/quizzes/page.tsx
        teacher/students/page.tsx
      (admin)/
        admin/dashboard/page.tsx
        admin/users/page.tsx
        admin/subjects/page.tsx
        admin/classes/page.tsx
      api/
        auth/login/route.ts
        auth/register/route.ts
        auth/me/route.ts
        lessons/route.ts
        lessons/[id]/route.ts
        quizzes/route.ts
        quizzes/[id]/route.ts
        quizzes/[id]/attempt/route.ts
        dashboard/student/route.ts
        dashboard/teacher/route.ts
        dashboard/admin/route.ts
        leaderboard/route.ts
        recommendations/route.ts
      layout.tsx
      globals.css
    components/
      layout/
      ui/
      cards/
      charts/
      quiz/
      gamification/
    features/
      auth/
      lessons/
      quizzes/
      adaptive/
      gamification/
      analytics/
      users/
    lib/
      prisma.ts
      auth.ts
      jwt.ts
      rbac.ts
      validators.ts
      constants.ts
      helpers.ts
    store/
      auth-store.ts
      ui-store.ts
  middleware.ts
  tailwind.config.ts
  README.md
```

## 2) Database Schema Plan (Prisma + PostgreSQL)

Core entities and relationships:

- `User` -> has role (`STUDENT`, `TEACHER`, `ADMIN`)
- `StudentProfile` -> learner metadata, avatar, level, XP, streak
- `TeacherProfile` -> teaching metadata
- `Classroom` -> many students, one teacher
- `Subject` -> Mathematics, English, Science
- `Lesson` -> belongs to a subject and optionally a classroom
- `Quiz` -> belongs to a lesson
- `QuizQuestion` -> belongs to quiz
- `QuizAttempt` -> belongs to student + quiz
- `QuestionAttempt` -> per-question history
- `ProgressRecord` -> student lesson progress + score trends
- `Badge` + `StudentBadge` -> gamification badges
- `LeaderboardSnapshot` -> segmented leaderboard by class/subject
- `Recommendation` -> adaptive recommendations (next/practice/remedial)
- `FeedbackMessage` -> teacher encouragement/feedback

## 3) Main User Flows

### Student flow

1. Sign in -> dashboard with progress, streak, XP, recommendations
2. Select subject -> view lesson cards with status (locked/in-progress/completed)
3. Open lesson -> complete content + practice checks
4. Take quiz (one question at a time) -> immediate feedback
5. Submit quiz -> adaptive engine evaluates score and unlocks next action
6. Gain XP/badges/level updates -> leaderboard refresh

### Teacher flow

1. Sign in -> teacher dashboard with class analytics
2. Create/edit lesson and quizzes
3. Monitor student progress and weak topics
4. Send encouragement/feedback to selected students

### Admin flow

1. Sign in -> admin dashboard
2. Manage users, subjects, classes
3. Manage platform content governance
4. View cross-platform analytics and engagement metrics

## 4) Component Architecture

- **Layout shell**
  - `AppShell`
  - `SidebarNav` (role-based menu)
  - `TopHeader` (notifications/profile)
- **Shared UI**
  - `NeoCard`, `MetricCard`, `ProgressRing`, `StatusPill`, `EmptyState`
- **Learning**
  - `LessonCard`, `LessonPathTimeline`, `SubjectTabs`
- **Quiz**
  - `QuizPlayer`, `QuestionStepper`, `AnswerOptions`, `QuizResultPanel`
- **Gamification**
  - `XpBar`, `LevelBadge`, `AchievementGrid`, `StreakCard`, `LeaderboardTable`
- **Analytics**
  - `ProgressLineChart`, `WeakTopicChart`, `ClassPerformanceChart`
- **Forms**
  - `LessonEditorForm`, `QuizBuilderForm`, `UserAdminTable`

## 5) Design System (Neomorphism-Inspired, Accessibility-First)

- **Visual language**
  - Soft layered shadows, rounded 16-24px cards, generous whitespace
  - Vibrant but controlled palette; high contrast for readability
  - Clean typography with clear hierarchy for ages 9-12
- **Color direction**
  - Primary: Indigo/Blue
  - Secondary accents: Emerald, Amber, Coral
  - Neutral background: warm gray/ivory
- **Interaction**
  - One primary action per screen
  - Subtle Framer Motion transitions (150-250ms)
  - Immediate success feedback and friendly error copy
- **Accessibility**
  - Keyboard navigable controls
  - Focus-visible rings
  - Semantic landmarks
  - Color contrast > WCAG AA target for text/UI

## 6) API Route Plan

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Student

- `GET /api/dashboard/student`
- `GET /api/subjects`
- `GET /api/lessons?subjectId=...`
- `GET /api/quizzes/:id`
- `POST /api/quizzes/:id/attempt`
- `GET /api/recommendations`
- `GET /api/leaderboard?classroomId=...&subjectId=...`

### Teacher

- `GET /api/dashboard/teacher`
- `POST /api/lessons`
- `PATCH /api/lessons/:id`
- `POST /api/quizzes`
- `PATCH /api/quizzes/:id`
- `GET /api/teacher/students`
- `POST /api/teacher/feedback`

### Admin

- `GET /api/dashboard/admin`
- `GET/POST/PATCH /api/admin/users`
- `GET/POST/PATCH /api/admin/subjects`
- `GET/POST/PATCH /api/admin/classes`

## 7) Adaptive Rules Implementation Plan

- **Score >= 80%**
  - Unlock next lesson
  - Award base + bonus XP
  - Increase question difficulty tag
- **Score 50-79%**
  - Recommend practice set
  - Allow retry with reduced penalty
- **Score < 50%**
  - Recommend remedial lesson
  - Serve easier practice path first

Tracked variables:

- Attempt count
- Score history trend
- Weak topics by tag
- Consistency (daily/weekly learning activity)

## 8) Gamification Engine Plan

- XP events: lesson complete, quiz complete, daily login, streak milestones
- Levels:
  - Explorer
  - Scholar
  - Champion
  - Legend
- Badges:
  - Perfect Score
  - Math Wizard
  - Science Explorer
  - 7-Day Streak
  - Fast Learner
- Segmented leaderboard:
  - By classroom
  - By subject
  - Weekly and all-time views

## 9) Security & Quality

- JWT auth with secure cookie strategy
- Role-based route guards in middleware + API-level checks
- Zod validation for all incoming payloads
- Centralized error handling responses
- Prisma transactions for score/XP/progress consistency
- Maintainable TypeScript-first domain services
