import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie, unauthorized } from "@/lib/auth";
import { assertRole } from "@/lib/rbac";

const feedbackSchema = z.object({
  recipientId: z.string().min(1),
  message: z.string().min(5).max(300),
});

export async function POST(request: Request) {
  const session = await getSessionFromCookie();
  if (!session) return unauthorized();
  const forbidden = assertRole(session.role as Role, [Role.TEACHER, Role.ADMIN]);
  if (forbidden) return forbidden;

  const body = await request.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const feedback = await prisma.feedbackMessage.create({
    data: {
      senderId: session.userId,
      recipientId: parsed.data.recipientId,
      message: parsed.data.message,
    },
  });
  return NextResponse.json({ feedback }, { status: 201 });
}
