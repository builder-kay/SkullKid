"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BookOpen, ChevronRight, Flag, Medal, Search, Sparkles, Trophy, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const heroImages = ["/images/1.jpg", "/images/5.jpg", "/images/4.jpg"];
  const [heroIndex, setHeroIndex] = useState(0);
  const friends = ["Aisha Mensah", "Kwame Ofori", "Lerato Maseko", "Tendai Ncube", "Fatima Bello", "Chiamaka Obi"];

  const leaderboard = [
    { name: "Salimatu P.", xp: "9,220 PTS" },
    { name: "Syahru M.", xp: "8,250 PTS" },
    { name: "Aditya A.", xp: "5,900 PTS" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-[#e9e9ee]">
      <main className="w-full overflow-hidden bg-[#f7f4fc]">
        <div className="grid min-h-screen lg:grid-cols-[240px_1fr_290px]">
          <aside className="border-r border-purple-100/70 bg-white/70 px-4 py-5">
            <p className="text-2xl font-black tracking-tight text-slate-900">AfriLearn</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">My Desk</p>

            <div className="mt-5 space-y-1.5">
              {[
                { label: "Dashboard", active: true },
                { label: "My Schedule", active: false },
                { label: "Messages", active: false },
                { label: "Mini Games", active: false },
                { label: "Classroom", active: false },
              ].map((item) => (
                <button
                  key={item.label}
                  className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                    item.active
                      ? "bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-md"
                      : "text-slate-700 hover:bg-purple-50"
                  }`}
                >
                  <BookOpen className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-gradient-to-b from-cyan-400 to-indigo-600 p-4 text-white shadow-lg">
              <p className="text-sm font-semibold">GO PRO</p>
              <p className="mt-1 text-xs text-white/90">Unlock more mini-games and quest rewards.</p>
              <Button size="sm" variant="secondary" className="mt-3 w-full">
                Upgrade Plan
              </Button>
            </div>
          </aside>

          <section className="space-y-4 p-4 md:p-6">
            <header className="flex items-center justify-between gap-3">
              <div className="flex flex-1 items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm">
                <Search className="h-4 w-4 text-slate-400" />
                <input className="w-full bg-transparent text-sm outline-none" placeholder="Search course, quiz, or game..." />
              </div>
              <button className="rounded-full bg-white p-2 shadow-sm">
                <Bell className="h-4 w-4 text-slate-700" />
              </button>
            </header>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
              <Card className="material-panel rounded-2xl p-5">
                <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
                  <div>
                    <p className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                      <Sparkles className="h-3.5 w-3.5" /> Daily Boost
                    </p>
                    <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900">Learn, Play and Earn Free Gifts!</h1>
                    <p className="mt-2 text-sm text-slate-600">
                      Challenge friends in quiz games and complete daily quests to unlock points, badges, and rewards.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href="/student/dashboard">
                        <Button>View Rewards</Button>
                      </Link>
                      <Button variant="secondary">Get Started</Button>
                    </div>
                  </div>
                  <div className="relative min-h-56 overflow-hidden rounded-2xl md:min-h-full">
                    <Image
                      src={heroImages[heroIndex]}
                      alt="African learner on device"
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      className="object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 via-indigo-900/10 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <p className="text-xs font-semibold text-white">Interactive Learning Spotlight</p>
                      <div className="flex gap-1.5">
                        {heroImages.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setHeroIndex(idx)}
                            className={`h-2.5 w-2.5 rounded-full ${idx === heroIndex ? "bg-white" : "bg-white/55"}`}
                            aria-label={`show hero image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
              <motion.div whileHover={{ y: -2 }}>
                <Card className="material-panel rounded-2xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Mini Games</p>
                    <button className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700">
                      See all <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      { title: "History Hero", players: "260 Playing", image: "/images/4.jpg" },
                      { title: "Language War", players: "210 Playing", image: "/images/1.jpg" },
                      { title: "Questopia", players: "248 Playing", image: "/images/2.jpg" },
                      { title: "Math Master", players: "184 Playing", image: "/images/5.jpg" },
                    ].map((game) => (
                      <div key={game.title} className="relative overflow-hidden rounded-xl p-3 text-white">
                        <Image src={game.image} alt={game.title} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-purple-700/35" />
                        <div className="relative z-10">
                          <p className="text-sm font-semibold">{game.title}</p>
                          <p className="mt-1 text-xs text-white/85">{game.players}</p>
                          <button className="mt-2 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-slate-900">
                            Play now
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              <motion.div whileHover={{ y: -2 }}>
                <Card className="material-panel rounded-2xl p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">Daily Quest</p>
                    <button className="text-xs font-semibold text-purple-700">Claim all</button>
                  </div>
                  <div className="space-y-3">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">Complete 2 Courses From Your Class</p>
                      <p className="text-xs text-slate-500">+160 EXP</p>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div className="h-2 w-1/2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600" />
                      </div>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-sm font-semibold text-slate-900">Challenge 2 Friends</p>
                      <p className="text-xs text-slate-500">+250 EXP</p>
                      <div className="mt-2 h-2 rounded-full bg-slate-100">
                        <div className="h-2 w-1/3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600" />
                      </div>
                    </div>
                    <Button className="w-full">Claim Reward</Button>
                  </div>
                </Card>
              </motion.div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="material-panel rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">Leaderboard</p>
                  <Trophy className="h-4 w-4 text-amber-500" />
                </div>
                <div className="space-y-3">
                  {leaderboard.map((entry, idx) => (
                    <div key={entry.name} className="flex items-center justify-between rounded-xl bg-white p-2.5">
                      <p className="text-sm font-semibold text-slate-800">
                        {idx + 1}. {entry.name}
                      </p>
                      <p className="text-xs font-semibold text-purple-700">{entry.xp}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="material-panel rounded-2xl p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">Master Rank</p>
                  <Medal className="h-4 w-4 text-yellow-500" />
                </div>
                <div className="relative overflow-hidden rounded-xl p-4 text-center">
                  <Image src="/images/3.jpg" alt="digital knowledge explosion" fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/65 to-purple-800/45" />
                  <div className="relative z-10">
                    <p className="text-xs font-semibold uppercase text-white/90">Current Badge</p>
                    <p className="mt-1 text-2xl font-black text-white">MASTER</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-600">Keep playing mini-games to unlock Champion and Legend rank.</p>
              </Card>
            </div>
          </section>

          <aside className="border-l border-purple-100/70 bg-white/80 p-4 md:p-5">
            <p className="text-sm font-bold text-slate-900">Duel Invitation</p>
            <div className="mt-3 space-y-2">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-xs font-semibold text-slate-700">Tawiah Yaw</p>
                <p className="text-[11px] text-slate-500">Wants to challenge you to a quiz</p>
                <div className="mt-2 flex gap-2">
                  <button className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-700">Decline</button>
                  <button className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-700">Accept</button>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-900">Friend List</p>
              <Flag className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <input className="w-full bg-transparent text-xs outline-none" placeholder="Search by name" />
            </div>
            <div className="mt-3 space-y-1.5">
              {friends.map((friend) => (
                <div key={friend} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-purple-100 p-1.5">
                      <UserRound className="h-3.5 w-3.5 text-purple-700" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{friend}</p>
                  </div>
                  <span className="text-[11px] text-slate-400">online</span>
                </div>
              ))}
            </div>
            <div className="mt-4 overflow-hidden rounded-xl">
              <Image src="/images/2.jpg" alt="student learning with laptop" width={320} height={180} className="h-32 w-full object-cover" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
