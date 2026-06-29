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

  const [profile, progress, recommendations] = await Promise.all([
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
  ]);

  return NextResponse.json({ profile, progress, recommendations });
}
