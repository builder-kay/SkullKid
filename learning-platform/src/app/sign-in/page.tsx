"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student1@afralearn.edu");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Could not sign in.");
        return;
      }
      const rolePath = `/${String(data.user.role).toLowerCase()}/dashboard`;
      router.push(rolePath);
      router.refresh();
    } catch {
      setError("Network issue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eef2ff] p-4">
      <Card className="w-full max-w-md space-y-4 p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-600">
            Sign in as a learner, teacher, or administrator.
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
            />
          </label>
          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
          ) : null}
          <Button disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>
        <p className="text-xs text-slate-500">
          Demo accounts seeded in database: admin, teacher, and student1.
        </p>
      </Card>
    </div>
  );
}
