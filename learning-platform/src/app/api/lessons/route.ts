import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { lessonSchema } from "@/lib/validators";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get("subjectId");

  const lessons = await prisma.lesson.findMany({
    where: { subjectId: subjectId ?? undefined },
    orderBy: { orderIndex: "asc" },
    include: { subject: true, quiz: true },
  });

  return NextResponse.json({ lessons });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();

  const forbidden = assertRole(session.role as Role, [Role.TEACHER, Role.ADMIN]);
  if (forbidden) return forbidden;

  const body = await request.json();
  const parsed = lessonSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const lesson = await prisma.lesson.create({
    data: {
      ...parsed.data,
      createdById: session.userId,
    },
  });

  return NextResponse.json({ lesson }, { status: 201 });
}
