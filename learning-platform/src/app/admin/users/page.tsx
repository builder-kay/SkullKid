import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-mode";
import { demoLeaderboard } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = isDemoMode
    ? [
        { id: "a1", fullName: "Amina Okoro", email: "admin@afralearn.edu", role: "ADMIN" },
        { id: "t1", fullName: "Mr. Kofi Mensah", email: "teacher@afralearn.edu", role: "TEACHER" },
        ...demoLeaderboard.map((entry, idx) => ({
          id: entry.userId,
          fullName: entry.name,
          email: `student${idx + 1}@afralearn.edu`,
          role: "STUDENT",
        })),
      ]
    : await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <AppShell role="admin" title="User Management">
      <Card className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-500">
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-slate-200">
                <td className="py-3">{user.fullName}</td>
                <td className="py-3">{user.email}</td>
                <td className="py-3">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
