import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/cards/metric-card";
import { ProgressLineChart } from "@/components/charts/progress-line-chart";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const [students, lessons, attempts] = isDemoMode
    ? [
        42,
        18,
        [
          { score: 74 },
          { score: 78 },
          { score: 82 },
          { score: 69 },
          { score: 85 },
          { score: 88 },
        ],
      ]
    : await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.lesson.count(),
        prisma.quizAttempt.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
      ]);

  return (
    <AppShell role="teacher" title="Teacher Dashboard">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Students" value={students} helper="Active learners in classes" />
        <MetricCard label="Lessons" value={lessons} helper="Published lessons" />
        <MetricCard label="Recent Attempts" value={attempts.length} helper="Latest quiz submissions" />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <ProgressLineChart
          title="Average Class Performance"
          data={attempts.map((a, idx) => ({ name: `Try ${idx + 1}`, value: a.score })).reverse()}
        />
        <Card>
          <p className="text-sm font-semibold text-slate-700">Weak Area Signals</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="rounded-xl bg-amber-50 p-3">Fractions in Mathematics need reinforcement for 6 learners.</li>
            <li className="rounded-xl bg-indigo-50 p-3">Reading comprehension dips on long passages.</li>
            <li className="rounded-xl bg-emerald-50 p-3">Science practical questions show improved confidence.</li>
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
