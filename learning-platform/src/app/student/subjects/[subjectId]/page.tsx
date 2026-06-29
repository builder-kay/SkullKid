import { notFound } from "next/navigation";
import { SubjectCode } from "@prisma/client";
import { AppShell } from "@/components/layout/app-shell";
import { LessonCard } from "@/components/cards/lesson-card";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-mode";
import { demoSubjectLessons } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ subjectId: string }> };

export default async function SubjectLessonsPage({ params }: Params) {
  const { subjectId } = await params;
  const code: SubjectCode | null =
    subjectId.toLowerCase() === "mathematics"
      ? SubjectCode.MATHEMATICS
      : subjectId.toLowerCase() === "english"
        ? SubjectCode.ENGLISH
        : subjectId.toLowerCase() === "science"
          ? SubjectCode.SCIENCE
          : null;

  const subject = isDemoMode
    ? demoSubjectLessons.find((item) => item.id === subjectId || item.code === code)
    : await prisma.subject.findFirst({
        where: {
          OR: [{ id: subjectId }, ...(code ? [{ code }] : [])],
        },
        include: {
          lessons: {
            include: { quiz: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      });
  if (!subject) notFound();

  return (
    <AppShell role="student" title={`${subject.title} Lessons`}>
      <section className="grid gap-4 md:grid-cols-2">
        {subject.lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            id={"quizId" in lesson ? lesson.quizId : (lesson.quiz?.id ?? lesson.id)}
            title={lesson.title}
            description={lesson.description}
            difficulty={lesson.difficulty}
          />
        ))}
      </section>
    </AppShell>
  );
}
