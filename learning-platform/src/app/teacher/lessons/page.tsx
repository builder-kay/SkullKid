import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-mode";
import { demoSubjectLessons } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function TeacherLessonsPage() {
  const lessons = isDemoMode
    ? demoSubjectLessons.flatMap((subject) =>
        subject.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          subject: { title: subject.title },
        })),
      )
    : await prisma.lesson.findMany({
        include: { subject: true },
        orderBy: { createdAt: "desc" },
      });

  return (
    <AppShell role="teacher" title="Lesson Manager">
      <Card>
        <p className="mb-3 text-sm font-semibold text-slate-700">Create and edit lessons</p>
        <div className="space-y-2 text-sm">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-900">{lesson.title}</p>
              <p className="text-slate-600">{lesson.subject.title}</p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
