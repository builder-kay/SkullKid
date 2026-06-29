"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Gamepad2, Sparkles, Trophy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f2fb]">
      <div className="pointer-events-none absolute -left-16 top-24 h-64 w-64 rounded-full bg-purple-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-52 h-72 w-72 rounded-full bg-indigo-300/30 blur-3xl" />

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

      <main className="relative z-10 mx-auto w-full max-w-7xl space-y-8 px-4 pb-12 md:px-6">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="neo-surface rounded-3xl p-6 md:p-8"
          >
            <p className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
            <Sparkles className="h-3.5 w-3.5" /> Learn, Play, and Grow
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              A Modern Adaptive Learning Platform for African Primary Schools
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              AfriLearn blends personalized learning pathways, quizzes, gamification, and classroom analytics
              to help students learn faster, teachers teach smarter, and admins manage with confidence.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/sign-in">
                <Button size="lg">
                  Continue to Auth
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/home">
                <Button variant="secondary" size="lg">Explore Home Preview</Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="grid gap-4"
          >
            <Card className="material-panel relative min-h-56 overflow-hidden rounded-2xl p-0">
              <Image src="/images/1.jpg" alt="Student in online class" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 text-sm font-semibold text-white">
                Live learning experiences with real-time engagement.
              </p>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <Card className="material-panel relative min-h-36 overflow-hidden rounded-2xl p-0">
                <Image src="/images/4.jpg" alt="Learner working on laptop" fill className="object-cover" />
              </Card>
              <Card className="material-panel relative min-h-36 overflow-hidden rounded-2xl p-0">
                <Image src="/images/5.jpg" alt="Student with tablet and headphones" fill className="object-cover" />
              </Card>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Brain,
              title: "Adaptive Intelligence",
              copy: "Lessons and recommendations adjust to each learner’s score history and weak topics.",
            },
            {
              icon: Gamepad2,
              title: "Gamified Motivation",
              copy: "XP, streaks, levels, badges, and leaderboards drive healthy, consistent progress.",
            },
            {
              icon: Users,
              title: "Teacher & Admin Insights",
              copy: "Track learner outcomes, identify weak areas, and manage classes from one dashboard.",
            },
          ].map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.3, delay: idx * 0.06 }}
            >
              <Card className="material-panel h-full rounded-2xl p-5">
                <item.icon className="h-5 w-5 text-purple-700" />
                <p className="mt-3 text-lg font-semibold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.copy}</p>
              </Card>
            </motion.div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="neo-surface rounded-3xl p-6 md:p-8"
          >
            <p className="text-sm font-bold text-slate-900">How The Experience Flows</p>
            <ol className="mt-4 space-y-3 text-sm text-slate-700">
              <li>1. Join quickly with mobile number + OTP verification.</li>
              <li>2. Learn through bite-sized lessons and one-question-at-a-time quizzes.</li>
              <li>3. Receive adaptive recommendations based on performance.</li>
              <li>4. Build streaks, unlock badges, and climb class leaderboards.</li>
            </ol>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              <Trophy className="h-3.5 w-3.5" />
              Designed for final-year demo quality and real classroom impact.
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="grid gap-4"
          >
            <Card className="material-panel relative min-h-44 overflow-hidden rounded-2xl p-0">
              <Image src="/images/2.jpg" alt="Student with laptop" fill className="object-cover" />
            </Card>
            <Card className="material-panel relative min-h-44 overflow-hidden rounded-2xl p-0">
              <Image src="/images/3.jpg" alt="Digital learning resources" fill className="object-cover" />
            </Card>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
