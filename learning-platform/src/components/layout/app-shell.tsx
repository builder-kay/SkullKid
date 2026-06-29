"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, ChartColumn, Medal, Users } from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { label: string; href: string; icon: React.ReactNode };

const navByRole: Record<"student" | "teacher" | "admin", NavItem[]> = {
  student: [
    { label: "Dashboard", href: "/student/dashboard", icon: <ChartColumn className="h-4 w-4" /> },
    { label: "Subjects", href: "/student/subjects/mathematics", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Leaderboard", href: "/student/leaderboard", icon: <Medal className="h-4 w-4" /> },
  ],
  teacher: [
    { label: "Dashboard", href: "/teacher/dashboard", icon: <ChartColumn className="h-4 w-4" /> },
    { label: "Lessons", href: "/teacher/lessons", icon: <BookOpen className="h-4 w-4" /> },
    { label: "Students", href: "/teacher/students", icon: <Users className="h-4 w-4" /> },
  ],
  admin: [
    { label: "Dashboard", href: "/admin/dashboard", icon: <ChartColumn className="h-4 w-4" /> },
    { label: "Users", href: "/admin/users", icon: <Users className="h-4 w-4" /> },
    { label: "Subjects", href: "/admin/subjects", icon: <BookOpen className="h-4 w-4" /> },
  ],
};

export function AppShell({
  role,
  title,
  children,
}: {
  role: "student" | "teacher" | "admin";
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const items = navByRole[role];

  return (
    <div className="min-h-screen bg-[#eef2ff]">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[260px_1fr] md:px-6">
        <aside className="rounded-3xl border border-white/40 bg-[#f3f6ff] p-4 shadow-[10px_10px_24px_#d7dcef,-8px_-8px_18px_#ffffff]">
          <p className="mb-5 text-lg font-semibold text-slate-800">AfriLearn</p>
          <nav className="space-y-2">
            {items.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-indigo-600 text-white" : "text-slate-700 hover:bg-indigo-50",
                  )}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <main className="space-y-6">
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="rounded-3xl border border-white/40 bg-[#f3f6ff] px-6 py-5 shadow-[10px_10px_24px_#d7dcef,-8px_-8px_18px_#ffffff]"
          >
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-600">Gamified adaptive learning for confident growth.</p>
          </motion.header>
          {children}
        </main>
      </div>
    </div>
  );
}
