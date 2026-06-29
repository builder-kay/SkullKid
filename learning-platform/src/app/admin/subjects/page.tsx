import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-mode";
import { demoSubjectLessons } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function AdminSubjectsPage() {
  const subjects = isDemoMode
    ? demoSubjectLessons.map((subject) => ({
        id: subject.id,
        title: subject.title,
        description: `Core ${subject.title.toLowerCase()} skills with African-context examples.`,
        lessons: subject.lessons,
      }))
    : await prisma.subject.findMany({ include: { lessons: true } });
  return (
    <AppShell role="admin" title="Subject Management">
      <div className="grid gap-4 md:grid-cols-2">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <p className="font-semibold text-slate-900">{subject.title}</p>
            <p className="mt-1 text-sm text-slate-600">{subject.description}</p>
            <p className="mt-2 text-xs text-slate-500">{subject.lessons.length} lessons</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
