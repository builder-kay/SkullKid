import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";

const createUserSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
});

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.ADMIN]);
  if (forbidden) return forbidden;

  const users = await prisma.user.findMany({
    select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.ADMIN]);
  if (forbidden) return forbidden;

  const body = await request.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash("Password123!", 10);
  const user = await prisma.user.create({
    data: {
      ...parsed.data,
      role: parsed.data.role as Role,
      passwordHash,
      student: parsed.data.role === "STUDENT" ? { create: {} } : undefined,
      teacher: parsed.data.role === "TEACHER" ? { create: {} } : undefined,
    },
  });
  return NextResponse.json({ user }, { status: 201 });
}
