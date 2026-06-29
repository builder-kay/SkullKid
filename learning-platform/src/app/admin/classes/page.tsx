import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { isDemoMode } from "@/lib/demo-mode";

export const dynamic = "force-dynamic";

export default async function AdminClassesPage() {
  const classes = isDemoMode
    ? [
        { id: "c1", name: "P6A", grade: 6, students: new Array(24).fill({}) },
        { id: "c2", name: "P6B", grade: 6, students: new Array(21).fill({}) },
      ]
    : await prisma.classroom.findMany({
        include: { students: true },
        orderBy: { createdAt: "desc" },
      });
  return (
    <AppShell role="admin" title="Class Management">
      <div className="grid gap-4 md:grid-cols-2">
        {classes.map((classroom) => (
          <Card key={classroom.id}>
            <p className="font-semibold text-slate-900">
              {classroom.name} (Grade {classroom.grade})
            </p>
            <p className="mt-1 text-sm text-slate-600">{classroom.students.length} learners assigned</p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
