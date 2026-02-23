"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, BarChart3, LogOut, ChevronRight } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";
import { dashboard as dashboardApi } from "@/lib/api";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h} soat ${m % 60} daqiqa`;
  return `${m} daqiqa`;
}

export default function ProfilePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const children = useAuthStore((s) => s.children);
  const currentChildId = useAuthStore((s) => s.currentChildId);
  const setCurrentChild = useAuthStore((s) => s.setCurrentChild);
  const logout = useAuthStore((s) => s.logout);
  const { onLeaderboardUpdated } = useSocket();

  const fetchAnalytics = useCallback(() => {
    if (currentChildId) dashboardApi.analytics(currentChildId).then(setAnalytics).catch(() => setAnalytics(null));
  }, [currentChildId]);

  const [analytics, setAnalytics] = useState<{
    totalXp: number;
    level: number;
    completedLessons: number;
    totalStudyTimeSeconds: number;
    weeklyProgress: Array<{ date: string; lessonsCompleted: number; xpEarned: number }>;
    gamesPlayed: number;
    videosCompleted: number;
    resultsOverview?: { matematik: number; mantiq: number; oyinlar: number };
  } | null>(null);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    return onLeaderboardUpdated(fetchAnalytics);
  }, [onLeaderboardUpdated, fetchAnalytics]);

  if (!token) return null;

  return (
    <div className="min-h-screen noise-bg pb-24">
      <div className="gradient-bg" />
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
          <Link href="/home" className="text-white/70 hover:text-white">←</Link>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-blue-400" /> Profil
          </h1>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <GlassCard className="p-6">
          <p className="text-white/50 text-sm">Ota-ona</p>
          <p className="text-xl font-semibold">{user?.name}</p>
          <p className="text-white/60 text-sm">{user?.email}</p>
        </GlassCard>

        <section>
          <h2 className="text-lg font-semibold mb-3">Bolalar</h2>
          <div className="space-y-2">
            {children.map((c) => (
              <GlassCard
                key={c._id}
                className={`p-4 flex items-center justify-between cursor-pointer ${currentChildId === c._id ? "border-blue-400/40" : ""}`}
                hover
              >
                <div className="flex items-center gap-3" onClick={() => setCurrentChild(c._id)}>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-white/50">{c.age} yosh • {c.totalXp ?? 0} XP</p>
                  </div>
                </div>
                <Link href={`/dashboard?childId=${c._id}`} className="p-2">
                  <ChevronRight className="w-5 h-5 text-white/50" />
                </Link>
              </GlassCard>
            ))}
          </div>
          <Link href="/onboarding" className="block mt-3 text-center text-blue-400 hover:underline text-sm">
            + Bola qo&apos;shish
          </Link>
        </section>

        {analytics?.resultsOverview && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Natijalar umumiy ko&apos;rinishi</h2>
            <GlassCard className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Matematik</span>
                    <span>{analytics.resultsOverview.matematik}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                      style={{ width: `${analytics.resultsOverview.matematik}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Mantiq</span>
                    <span>{analytics.resultsOverview.mantiq}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${analytics.resultsOverview.mantiq}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>O&apos;yinlar</span>
                    <span>{analytics.resultsOverview.oyinlar}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                      style={{ width: `${analytics.resultsOverview.oyinlar}%` }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>
        )}

        {analytics && (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-teal-400" /> Statistika
            </h2>
            <GlassCard className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-white/50 text-sm">Jami XP</p>
                  <p className="text-2xl font-bold gradient-text-yellow">{analytics.totalXp}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm">Daraja</p>
                  <p className="text-2xl font-bold">{analytics.level}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm">Tugatilgan darslar</p>
                  <p className="text-2xl font-bold">{analytics.completedLessons}</p>
                </div>
                <div>
                  <p className="text-white/50 text-sm">O&apos;qish vaqti</p>
                  <p className="text-xl font-bold">{formatTime(analytics.totalStudyTimeSeconds)}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-white/10">
                <p className="text-white/50 text-sm mb-2">Haftalik progress</p>
                <div className="space-y-2">
                  {analytics.weeklyProgress.slice(-7).map((d) => (
                    <div key={d.date} className="flex justify-between text-sm">
                      <span>{d.date}</span>
                      <span>{d.lessonsCompleted} dars, +{d.xpEarned} XP</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-white/50 text-sm">O&apos;yinlar: {analytics.gamesPlayed} • Videolar: {analytics.videosCompleted}</p>
            </GlassCard>
          </section>
        )}

        <div className="flex gap-3">
          <Link href="/leaderboard" className="flex-1">
            <GlassCard className="p-4 text-center">Reyting</GlassCard>
          </Link>
          <Link href="/chat" className="flex-1">
            <GlassCard className="p-4 text-center">AI Chat</GlassCard>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => { logout(); router.push("/"); }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-5 h-5" /> Chiqish
        </button>
      </main>
      <BottomNav />
    </div>
  );
}
