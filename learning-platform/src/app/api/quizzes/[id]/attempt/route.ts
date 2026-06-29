import { RecommendationType, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";
import { quizAttemptSchema } from "@/lib/validators";
import { getAdaptiveRecommendation, getLevelFromXp } from "@/lib/helpers";
import { XP_EVENTS } from "@/lib/constants";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.STUDENT]);
  if (forbidden) return forbidden;

  const { id: quizId } = await params;
  const body = await request.json();
  const parsed = quizAttemptSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { questions: true, lesson: true },
  });
  if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });

  const answerMap = new Map(parsed.data.answers.map((entry) => [entry.questionId, entry.selectedAnswer]));
  let correctCount = 0;
  const weakTopics = new Set<string>();

  for (const q of quiz.questions) {
    const selected = answerMap.get(q.id);
    if (selected === q.correctAnswer) {
      correctCount += 1;
    } else {
      weakTopics.add(q.topicTag);
    }
  }

  const totalQuestions = quiz.questions.length;
  const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
  const adaptive = getAdaptiveRecommendation(score);
  const recommendationType =
    adaptive.type === "NEXT_LESSON"
      ? RecommendationType.NEXT_LESSON
      : adaptive.type === "PRACTICE"
        ? RecommendationType.PRACTICE
        : RecommendationType.REMEDIAL;

  const result = await prisma.$transaction(async (tx) => {
    const attempt = await tx.quizAttempt.create({
      data: {
        quizId,
        userId: session.userId,
        score,
        totalQuestions,
        correctCount,
        durationSec: parsed.data.durationSec,
        questionLogs: {
          create: quiz.questions.map((q) => ({
            questionId: q.id,
            selectedAnswer: answerMap.get(q.id) ?? "",
            isCorrect: answerMap.get(q.id) === q.correctAnswer,
          })),
        },
      },
      include: { questionLogs: true },
    });

    const studentProfile = await tx.studentProfile.findUnique({
      where: { userId: session.userId },
    });

    if (studentProfile) {
      const bonus = score === 100 ? XP_EVENTS.PERFECT_SCORE_BONUS : 0;
      const updatedXp = studentProfile.xp + adaptive.xpAward + bonus;
      await tx.studentProfile.update({
        where: { userId: session.userId },
        data: {
          xp: updatedXp,
          level: getLevelFromXp(updatedXp),
          lastActiveDate: new Date(),
          streakDays: { increment: 1 },
        },
      });
    }

    await tx.progressRecord.upsert({
      where: {
        userId_lessonId: {
          userId: session.userId,
          lessonId: quiz.lessonId,
        },
      },
      update: {
        attempts: { increment: 1 },
        bestScore: { set: Math.max(score, 0) },
        completion: score >= 50 ? 100 : 60,
        weakTopics: [...weakTopics],
      },
      create: {
        userId: session.userId,
        lessonId: quiz.lessonId,
        attempts: 1,
        bestScore: score,
        completion: score >= 50 ? 100 : 60,
        weakTopics: [...weakTopics],
      },
    });

    await tx.recommendation.create({
      data: {
        userId: session.userId,
        lessonId: quiz.lessonId,
        type: recommendationType,
        reason: adaptive.reason,
      },
    });

    return { attempt, adaptive };
  });

  return NextResponse.json(result);
}
