import { Role, SubjectCode } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";

const subjectSchema = z.object({
  code: z.enum(["MATHEMATICS", "ENGLISH", "SCIENCE"]),
  title: z.string().min(3),
  description: z.string().min(6),
  classroomId: z.string().optional(),
});

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.ADMIN]);
  if (forbidden) return forbidden;

  const subjects = await prisma.subject.findMany({ include: { lessons: true } });
  return NextResponse.json({ subjects });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.ADMIN]);
  if (forbidden) return forbidden;

  const body = await request.json();
  const parsed = subjectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const subject = await prisma.subject.create({
    data: {
      ...parsed.data,
      code: parsed.data.code as SubjectCode,
    },
  });
  return NextResponse.json({ subject }, { status: 201 });
}
