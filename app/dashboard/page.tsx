"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, Clock, Target, Trophy } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { dashboard as dashboardApi } from "@/lib/api";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h} soat`;
  return `${m} daqiqa`;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId");
  const token = useAuthStore((s) => s.token);
  const children = useAuthStore((s) => s.children);
  const currentChildId = useAuthStore((s) => s.currentChildId) || childId || children[0]?._id;

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
    const id = currentChildId || childId;
    if (!id) return;
    dashboardApi.analytics(id).then(setAnalytics).catch(() => setAnalytics(null));
  }, [currentChildId, childId]);

  if (!token) return null;

  const child = children.find((c) => c._id === currentChildId || c._id === childId);

  return (
    <div className="min-h-screen noise-bg pb-24">
      <div className="gradient-bg" />
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
          <Link href="/profile" className="text-white/70 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" /> Statistika
          </h1>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {child && (
          <GlassCard className="p-4">
            <p className="text-white/50 text-sm">O&apos;quvchi</p>
            <p className="text-xl font-semibold">{child.name}</p>
            <p className="text-white/60 text-sm">{child.age} yosh</p>
          </GlassCard>
        )}

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
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
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
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
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
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{ width: `${analytics.resultsOverview.oyinlar}%` }}
                    />
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>
        )}

        {analytics && (
          <GlassCard className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">O&apos;rganish statistikasi</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-white/50 text-sm">Jami vaqt</p>
                  <p className="text-xl font-bold">{formatTime(analytics.totalStudyTimeSeconds)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-white/50 text-sm">Bajarilgan vazifalar</p>
                  <p className="text-xl font-bold">{analytics.completedLessons + analytics.gamesPlayed}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-amber-400" />
                <div>
                  <p className="text-white/50 text-sm">Jami ballar</p>
                  <p className="text-xl font-bold">{analytics.totalXp.toLocaleString()}</p>
                </div>
              </div>
              <div>
                <p className="text-white/50 text-sm">O&apos;rtacha natija</p>
                <p className="text-xl font-bold">
                  {analytics.resultsOverview
                    ? Math.round(
                        (analytics.resultsOverview.matematik +
                          analytics.resultsOverview.mantiq +
                          analytics.resultsOverview.oyinlar) /
                          3
                      )
                    : 0}
                  %
                </p>
              </div>
            </div>
          </GlassCard>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
