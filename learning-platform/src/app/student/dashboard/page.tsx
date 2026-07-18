import { AppShell } from "@/components/layout/app-shell";
import { StudentDashboardContent } from "@/components/dashboard/student-dashboard-content";

export const dynamic = "force-dynamic";

export default function StudentDashboardPage() {
  return (
    <AppShell role="student" title="Student Dashboard">
      <StudentDashboardContent />
    </AppShell>
  );
}
