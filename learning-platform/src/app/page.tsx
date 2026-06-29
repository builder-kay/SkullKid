import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f2fb]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 md:px-6">
        <p className="text-lg font-black tracking-tight text-slate-900">AfriLearn</p>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <a className="text-slate-900" href="#">Home</a>
          <a href="#">Teachers</a>
          <a href="#">Offers</a>
          <a href="#">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/sign-in">
            <Button variant="secondary" size="sm">Sign In</Button>
          </Link>
          <Link href="/sign-in">
            <Button size="sm">Free Trial</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-10 md:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="neo-surface rounded-3xl p-6 md:p-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
            <Sparkles className="h-3.5 w-3.5" /> Learn, Play, and Grow
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
            Design and Development of a Gamified Adaptive Learning Platform
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            Built for African primary school learners, teachers, and administrators with adaptive
            recommendations, gamified learning journeys, and clear progress insights.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/sign-in">
              <Button size="lg">
                Continue to Auth
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/home">
              <Button variant="secondary" size="lg">Open App Home</Button>
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <Card className="material-panel rounded-2xl p-5">
            <p className="text-sm font-bold text-slate-900">Flow Overview</p>
            <ol className="mt-3 space-y-2 text-sm text-slate-700">
              <li>1. Landing page (you are here)</li>
              <li>2. Auth page (`/sign-in`)</li>
              <li>3. Home page (`/home`)</li>
            </ol>
          </Card>
          <Card className="material-panel rounded-2xl p-5">
            <p className="text-sm font-bold text-slate-900">Why AfriLearn?</p>
            <p className="mt-2 text-sm text-slate-600">
              Personalized learning paths, role-based dashboards, and healthy gamification aligned with
              real classroom outcomes.
            </p>
          </Card>
        </section>
      </main>
    </div>
  );
}
