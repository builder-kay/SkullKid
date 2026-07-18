import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.STUDENT]);
  if (forbidden) return forbidden;

  const [profile, progress, recommendations, attempts] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { userId: session.userId },
      include: { user: true, badges: { include: { badge: true } } },
    }),
    prisma.progressRecord.findMany({
      where: { userId: session.userId },
      include: { lesson: { include: { subject: true } } },
    }),
    prisma.recommendation.findMany({
      where: { userId: session.userId, isCompleted: false },
      orderBy: { createdAt: "desc" },
      take: 3,
    }),
    prisma.quizAttempt.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        quiz: {
          include: { lesson: true },
        },
      },
    }),
  ]);

  const weakTopicMap = new Map<string, number>();
  for (const item of progress) {
    for (const topic of item.weakTopics) {
      weakTopicMap.set(topic, (weakTopicMap.get(topic) ?? 0) + 1);
    }
  }
  const weakTopics = [...weakTopicMap.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const completionAverage =
    progress.length === 0
      ? 0
      : Math.round(progress.reduce((sum, item) => sum + Number(item.completion), 0) / progress.length);

  return NextResponse.json({
    profile,
    progress,
    recommendations,
    attempts,
    weakTopics,
    completionAverage,
  });
}
