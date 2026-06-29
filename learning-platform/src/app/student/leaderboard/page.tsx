import { AppShell } from "@/components/layout/app-shell";
import { LeaderboardTable } from "@/components/gamification/leaderboard-table";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-mode";
import { demoLeaderboard } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function StudentLeaderboardPage() {
  const board = isDemoMode
    ? demoLeaderboard
    : await prisma.leaderboardSnapshot.findMany({
        where: { period: "weekly" },
        orderBy: { rank: "asc" },
        take: 10,
      });
  const userIds = board.map((entry) => entry.userId);
  const users = isDemoMode
    ? demoLeaderboard.map((entry) => ({ id: entry.userId, fullName: entry.name }))
    : await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, fullName: true },
      });
  const nameMap = new Map(users.map((user) => [user.id, user.fullName]));

  return (
    <AppShell role="student" title="Leaderboard">
      <LeaderboardTable
        rows={board.map((entry) => ({
          rank: entry.rank,
          name: nameMap.get(entry.userId) ?? "Learner",
          xp: entry.xp,
          score: entry.score,
        }))}
      />
    </AppShell>
  );
}
