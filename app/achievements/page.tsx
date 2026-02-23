"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, Star, Trophy, Flame, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { achievements as achievementsApi } from "@/lib/api";

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / (24 * 60 * 60 * 1000));
  if (diff === 0) return "Bugun";
  if (diff === 1) return "Kecha";
  if (diff < 7) return `${diff} kun avval`;
  return d.toLocaleDateString("uz-UZ");
}

export default function AchievementsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const children = useAuthStore((s) => s.children);
  const currentChildId = useAuthStore((s) => s.currentChildId);
  const setCurrentChild = useAuthStore((s) => s.setCurrentChild);

  const [data, setData] = useState<{
    totalStars: number;
    achievementCount: number;
    streak: number;
    achievements: Array<{ _id: string; type: string; name: string; description?: string; xpBonus: number; unlockedAt: string }>;
  } | null>(null);

  const childId = currentChildId || children[0]?._id;

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  useEffect(() => {
    if (!childId) return;
    achievementsApi.getByChild(childId).then(setData).catch(() => setData(null));
  }, [childId]);

  if (!token) return null;

  const unlocked = data?.achievements || [];
  const recent = unlocked.slice(0, 3);

  return (
    <div className="min-h-screen noise-bg pb-24">
      <div className="gradient-bg" />
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/home" className="text-white/70 hover:text-white">←</Link>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" /> Mukofotlar
          </h1>
          {children.length > 1 && (
            <select
              value={childId || ""}
              onChange={(e) => setCurrentChild(e.target.value)}
              className="bg-white/10 text-white text-sm rounded-lg px-2 py-1 border border-white/20"
            >
              {children.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <GlassCard className="p-4 text-center">
            <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data?.totalStars ?? 0}</p>
            <p className="text-xs text-white/60">Yulduzlar</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data?.achievementCount ?? 0}</p>
            <p className="text-xs text-white/60">Yutuqlar</p>
          </GlassCard>
          <GlassCard className="p-4 text-center">
            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
            <p className="text-2xl font-bold">{data?.streak ?? 0}</p>
            <p className="text-xs text-white/60">Kun ketma-ket</p>
          </GlassCard>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-3">Yutuqlar</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: "first_lesson", name: "Birinchi qadam", icon: "🏆" },
              { type: "first_game", name: "Birinchi o'yin", icon: "🎮" },
              { type: "first_video", name: "Birinchi video", icon: "📹" },
              { type: "five_lessons", name: "5 ta dars", icon: "📚" },
              { type: "ten_lessons", name: "10 ta dars", icon: "📖" },
              { type: "level_3", name: "3-daraja", icon: "⭐" },
              { type: "level_5", name: "5-daraja", icon: "🏆" },
            ].map((def) => {
              const ach = unlocked.find((a) => a.type === def.type);
              const has = !!ach;
              return (
                <motion.div
                  key={def.type}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                >
                  <GlassCard
                    className={`p-4 ${has ? "border-amber-400/30" : "opacity-70"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{def.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{def.name}</p>
                        {has ? (
                          <p className="text-xs text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Ochildi
                          </p>
                        ) : (
                          <p className="text-xs text-white/40">Ochilmagan</p>
                        )}
                      </div>
                      {has && <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </section>

        {recent.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3">So&apos;nggi yutuqlar</h2>
            <GlassCard className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              <div className="space-y-2">
                {recent.map((a) => (
                  <div key={a._id} className="flex items-center gap-3">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="font-medium">{a.name}</span>
                    <span className="text-white/50 text-sm ml-auto">
                      {formatDate(a.unlockedAt)}
                    </span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </section>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
