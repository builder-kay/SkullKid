import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export default async function TeacherQuizzesPage() {
  const quizzes = isDemoMode
    ? [
        {
          id: "q1",
          title: "Fractions Quick Check",
          lesson: { title: "Fractions at the Market" },
          questions: [{ id: "x1" }, { id: "x2" }],
        },
        {
          id: "q2",
          title: "Healthy Food Quiz",
          lesson: { title: "Healthy Food and Energy" },
          questions: [{ id: "x3" }, { id: "x4" }, { id: "x5" }],
        },
      ]
    : await prisma.quiz.findMany({
        include: { lesson: true, questions: true },
        orderBy: { createdAt: "desc" },
      });

  return (
    <AppShell role="teacher" title="Quiz Manager">
      <Card>
        <p className="mb-3 text-sm font-semibold text-slate-700">Quiz bank</p>
        <div className="space-y-2 text-sm">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-900">{quiz.title}</p>
              <p className="text-slate-600">
                {quiz.lesson.title} - {quiz.questions.length} questions
              </p>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
