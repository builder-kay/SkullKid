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

  const recommendations = await prisma.recommendation.findMany({
    where: { userId: session.userId, isCompleted: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ recommendations });
}
