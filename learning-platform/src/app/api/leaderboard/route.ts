import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classroomId = searchParams.get("classroomId");
  const subjectId = searchParams.get("subjectId");

  const leaderboard = await prisma.leaderboardSnapshot.findMany({
    where: {
      classroomId: classroomId ?? undefined,
      subjectId: subjectId ?? undefined,
      period: "weekly",
    },
    orderBy: { rank: "asc" },
    take: 20,
  });

  return NextResponse.json({ leaderboard });
}
