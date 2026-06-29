import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/cards/metric-card";
import { ProgressLineChart } from "@/components/charts/progress-line-chart";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-mode";
import { demoProgress, demoStudent } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  let student: {
    xp: number;
    level: string;
    streakDays: number;
    badges: unknown[];
  } | null = null;
  let progress: { lesson: { title: string }; bestScore: number }[] = [];

  if (isDemoMode) {
    student = demoStudent;
    progress = demoProgress.map((entry) => ({ lesson: { title: entry.title }, bestScore: entry.bestScore }));
  } else {
    const dbStudent = await prisma.studentProfile.findFirst({
      include: { user: true, badges: { include: { badge: true } } },
    });
    student = dbStudent;
    progress = await prisma.progressRecord.findMany({
      where: { userId: dbStudent?.userId },
      include: { lesson: true },
    });
  }

  const chartData = progress.map((entry) => ({
    name: entry.lesson.title.slice(0, 12),
    value: entry.bestScore,
  }));

  return (
    <AppShell role="student" title="Student Dashboard">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="XP Points" value={student?.xp ?? 0} helper="Earned from quizzes and lessons" />
        <MetricCard label="Level" value={student?.level ?? "Explorer"} helper="Next: Champion at 700 XP" />
        <MetricCard label="Streak" value={`${student?.streakDays ?? 0} days`} helper="Daily login streak" />
        <MetricCard label="Badges" value={student?.badges.length ?? 0} helper="Achievement milestones" />
      </section>
      <section className="grid gap-4 lg:grid-cols-2">
        <ProgressLineChart
          title="Performance Trend"
          data={chartData.length > 0 ? chartData : [{ name: "Start", value: 0 }]}
        />
        <Card>
          <p className="text-sm font-semibold text-slate-700">Adaptive Recommendations</p>
          <ul className="mt-3 space-y-3 text-sm text-slate-600">
            <li className="rounded-xl bg-indigo-50 p-3">
              Complete the next mathematics lesson to unlock advanced challenges.
            </li>
            <li className="rounded-xl bg-amber-50 p-3">
              Practice division word problems from local transport examples.
            </li>
            <li className="rounded-xl bg-emerald-50 p-3">
              Keep your streak by finishing one quick quiz today.
            </li>
          </ul>
        </Card>
      </section>
    </AppShell>
  );
}
