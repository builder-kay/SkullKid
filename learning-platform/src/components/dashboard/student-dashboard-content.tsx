"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Lesson = {
  id: string;
  title: string;
  description: string;
  difficulty: number;
  orderIndex: number;
  subject: { id: string; title: string };
  quiz: { id: string } | null;
};

type ProgressEntry = {
  lesson: { title: string; subject: { title: string } };
  bestScore: number;
  completion: number;
};

const SUBJECT_FILTERS = ["All", "Mathematics", "English", "Science"] as const;
type SubjectFilter = (typeof SUBJECT_FILTERS)[number];

export function StudentDashboardContent() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>("All");
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [lessonsResponse, dashboardResponse] = await Promise.all([
        fetch("/api/lessons", { cache: "no-store" }),
        fetch("/api/dashboard/student", { cache: "no-store" }),
      ]);

      const lessonsBody = await lessonsResponse.json();
      const dashboardBody = await dashboardResponse.json();

      if (!lessonsResponse.ok) {
        setError(typeof lessonsBody.error === "string" ? lessonsBody.error : "Could not load courses.");
        return;
      }
      if (!dashboardResponse.ok) {
        setError(typeof dashboardBody.error === "string" ? dashboardBody.error : "Could not load course progress.");
        return;
      }

      setLessons(Array.isArray(lessonsBody.lessons) ? lessonsBody.lessons : []);
      setProgress(Array.isArray(dashboardBody.progress) ? dashboardBody.progress : []);
    } catch {
      setError("Network issue while loading your courses.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const progressByLessonTitle = useMemo(() => {
    const map = new Map<string, { completion: number; bestScore: number }>();
    progress.forEach((entry) => {
      map.set(entry.lesson.title, {
        completion: entry.completion,
        bestScore: entry.bestScore,
      });
    });
    return map;
  }, [progress]);

  const filteredLessons = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return lessons
      .filter((lesson) => subjectFilter === "All" || lesson.subject.title === subjectFilter)
      .filter((lesson) => {
        if (!normalizedSearch) return true;
        const haystack = `${lesson.title} ${lesson.description} ${lesson.subject.title}`.toLowerCase();
        return haystack.includes(normalizedSearch);
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [lessons, searchText, subjectFilter]);

  if (loading) {
    return (
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="h-56 animate-pulse bg-slate-100" />
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <Card className="space-y-3">
        <p className="text-sm font-semibold text-rose-700">Could not load courses.</p>
        <p className="text-sm text-slate-600">{error}</p>
        <Button onClick={load} size="sm">
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <section className="space-y-4">
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Student Courses</p>
            <h2 className="text-xl font-semibold text-slate-900">Continue Your Learning Journey</h2>
            <p className="text-sm text-slate-600">Pick a subject, open a course, and continue where you left off.</p>
          </div>

          <label className="relative block w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search courses or subjects"
              className="input-field w-full pl-10"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUBJECT_FILTERS.map((subject) => (
            <Button
              key={subject}
              size="sm"
              variant={subjectFilter === subject ? "default" : "secondary"}
              onClick={() => setSubjectFilter(subject)}
            >
              {subject}
            </Button>
          ))}
        </div>
      </Card>

      {filteredLessons.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredLessons.map((lesson) => {
            const progressEntry = progressByLessonTitle.get(lesson.title);
            const completion = progressEntry?.completion ?? 0;
            const bestScore = progressEntry?.bestScore ?? 0;
            const actionLabel = completion >= 100 ? "Review Course" : completion > 0 ? "Continue Course" : "Start Course";
            const linkTarget = lesson.quiz ? `/student/quiz/${lesson.quiz.id}` : `/student/subjects/${lesson.subject.id}`;

            return (
              <Card key={lesson.id} className="flex h-full flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700">{lesson.subject.title}</span>
                  <span className="text-xs font-semibold text-slate-500">Level {lesson.difficulty}</span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-slate-900">{lesson.title}</h3>
                  <p className="line-clamp-3 text-sm text-slate-600">{lesson.description}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Progress</span>
                    <span>{completion}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${Math.min(Math.max(completion, 0), 100)}%` }} />
                  </div>
                  <p className="text-xs text-slate-500">Best quiz score: {bestScore}%</p>
                </div>

                <div className="mt-auto flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
                    <BookOpen className="h-3.5 w-3.5" />
                    Lesson {lesson.orderIndex}
                  </span>
                  <Link href={linkTarget}>
                    <Button size="sm" className="gap-1">
                      {actionLabel}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">No courses found</p>
          <p className="text-sm text-slate-600">Try another subject filter or clear your search to see more courses.</p>
          <Button size="sm" variant="secondary" onClick={() => {
            setSearchText("");
            setSubjectFilter("All");
          }}>
            Reset filters
          </Button>
        </Card>
      )}
    </section>
  );
}
