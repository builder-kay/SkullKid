import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";

const classSchema = z.object({
  name: z.string().min(2),
  grade: z.number().int().min(1).max(12),
});

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.ADMIN]);
  if (forbidden) return forbidden;

  const classes = await prisma.classroom.findMany({
    include: { students: { select: { id: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ classes });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.ADMIN]);
  if (forbidden) return forbidden;

  const body = await request.json();
  const parsed = classSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const classroom = await prisma.classroom.create({
    data: parsed.data,
  });
  return NextResponse.json({ classroom }, { status: 201 });
}
