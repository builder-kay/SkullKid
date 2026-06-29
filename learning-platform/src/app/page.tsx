import Link from "next/link";
import { BookOpen, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#eef2ff] px-4 py-12">
      <main className="mx-auto max-w-6xl space-y-10">
        <section className="rounded-3xl border border-white/40 bg-[#f3f6ff] p-8 shadow-[10px_10px_24px_#d7dcef,-8px_-8px_18px_#ffffff]">
          <p className="text-sm font-semibold text-indigo-600">Final-Year Project Demo</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Gamified Adaptive Learning Platform for African Primary Schools
          </h1>
          <p className="mt-4 max-w-3xl text-slate-600">
            A mobile-first platform where learners grow with adaptive pathways, teachers guide with
            actionable insights, and administrators track impact.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/sign-in">
              <Button size="lg">Sign In</Button>
            </Link>
            <Link href="/student/dashboard">
              <Button variant="secondary" size="lg">
                Explore Student Demo
              </Button>
            </Link>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <BookOpen className="mb-2 h-5 w-5 text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Adaptive Lessons</h2>
            <p className="mt-1 text-sm text-slate-600">
              Smart recommendations based on score trends, weak topics, and consistency.
            </p>
          </Card>
          <Card>
            <Trophy className="mb-2 h-5 w-5 text-amber-500" />
            <h2 className="font-semibold text-slate-900">Healthy Competition</h2>
            <p className="mt-1 text-sm text-slate-600">
              XP, streaks, badges, and segmented leaderboards by class and subject.
            </p>
          </Card>
          <Card>
            <TrendingUp className="mb-2 h-5 w-5 text-emerald-600" />
            <h2 className="font-semibold text-slate-900">Teacher Analytics</h2>
            <p className="mt-1 text-sm text-slate-600">
              Real-time progress and weak area identification for targeted support.
            </p>
          </Card>
        </section>
      </main>
    </div>
  );
}
