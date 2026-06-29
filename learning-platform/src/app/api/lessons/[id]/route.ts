import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";
import { lessonSchema } from "@/lib/validators";

type Params = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: { subject: true, quiz: { include: { questions: true } } },
  });
  if (!lesson) return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  return NextResponse.json({ lesson });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.TEACHER, Role.ADMIN]);
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await request.json();
  const parsed = lessonSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const lesson = await prisma.lesson.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ lesson });
}
