import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: { orderBy: { orderIndex: "asc" } }, lesson: true },
  });
  if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
  return NextResponse.json({ quiz });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.TEACHER, Role.ADMIN]);
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = (await request.json()) as { title?: string };
  const quiz = await prisma.quiz.update({
    where: { id },
    data: {
      title: body.title,
    },
  });
  return NextResponse.json({ quiz });
}
