import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.TEACHER, Role.ADMIN]);
  if (forbidden) return forbidden;

  const [students, lessons, attempts] = await Promise.all([
    prisma.user.findMany({
      where: { role: Role.STUDENT },
      include: { student: true, lessonProgress: true },
      take: 30,
    }),
    prisma.lesson.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.quizAttempt.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { user: true, quiz: { include: { lesson: true } } },
    }),
  ]);

  return NextResponse.json({ students, lessons, attempts });
}
