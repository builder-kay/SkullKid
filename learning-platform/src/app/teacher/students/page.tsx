import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-mode";
import { demoLeaderboard } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function TeacherStudentsPage() {
  const students = isDemoMode
    ? demoLeaderboard.map((entry) => ({
        id: entry.userId,
        fullName: entry.name,
        student: { xp: entry.xp, level: entry.rank <= 2 ? "Scholar" : "Explorer" },
        lessonProgress: new Array(Math.max(1, 5 - entry.rank)).fill({}),
      }))
    : await prisma.user.findMany({
        where: { role: "STUDENT" },
        include: { student: true, lessonProgress: true },
        orderBy: { fullName: "asc" },
      });

  return (
    <AppShell role="teacher" title="Student Progress">
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">XP</th>
              <th className="py-2">Level</th>
              <th className="py-2">Lessons Tracked</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} className="border-t border-slate-200">
                <td className="py-3 font-medium text-slate-800">{student.fullName}</td>
                <td className="py-3">{student.student?.xp ?? 0}</td>
                <td className="py-3">{student.student?.level ?? "Explorer"}</td>
                <td className="py-3">{student.lessonProgress.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
