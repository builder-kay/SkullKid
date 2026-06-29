import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.ADMIN]);
  if (forbidden) return forbidden;

  const [totalUsers, students, teachers, subjects, classes] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: Role.STUDENT } }),
    prisma.user.count({ where: { role: Role.TEACHER } }),
    prisma.subject.count(),
    prisma.classroom.count(),
  ]);

  return NextResponse.json({
    totals: { totalUsers, students, teachers, subjects, classes },
  });
}
