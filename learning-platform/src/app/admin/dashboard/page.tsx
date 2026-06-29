import { AppShell } from "@/components/layout/app-shell";
import { MetricCard } from "@/components/cards/metric-card";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [users, classes, subjects, lessons] = isDemoMode
    ? [65, 4, 3, 18]
    : await Promise.all([
        prisma.user.count(),
        prisma.classroom.count(),
        prisma.subject.count(),
        prisma.lesson.count(),
      ]);

  return (
    <AppShell role="admin" title="Admin Dashboard">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Users" value={users} />
        <MetricCard label="Classes" value={classes} />
        <MetricCard label="Subjects" value={subjects} />
        <MetricCard label="Lessons" value={lessons} />
      </section>
    </AppShell>
  );
}
