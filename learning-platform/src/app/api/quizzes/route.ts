import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";
import { z } from "zod";

const quizSchema = z.object({
  lessonId: z.string().min(1),
  title: z.string().min(3),
  questions: z.array(
    z.object({
      prompt: z.string().min(5),
      options: z.array(z.string().min(1)).min(2),
      correctAnswer: z.string().min(1),
      explanation: z.string().optional(),
      topicTag: z.string().min(2),
      difficulty: z.number().int().min(1).max(3).default(1),
      orderIndex: z.number().int().min(1),
    }),
  ),
});

export async function POST(request: Request) {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.TEACHER, Role.ADMIN]);
  if (forbidden) return forbidden;

  const body = await request.json();
  const parsed = quizSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const quiz = await prisma.quiz.create({
    data: {
      lessonId: parsed.data.lessonId,
      title: parsed.data.title,
      createdById: session.userId,
      questions: {
        createMany: {
          data: parsed.data.questions,
        },
      },
    },
    include: { questions: true },
  });

  return NextResponse.json({ quiz }, { status: 201 });
}
