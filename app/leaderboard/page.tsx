"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Medal, TrendingUp } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";
import { leaderboard as leaderboardApi } from "@/lib/api";

export default function LeaderboardPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const [list, setList] = useState<Array<{ rank: number; childName: string; totalXp: number; level: number }>>([]);
  const { onLeaderboardUpdated } = useSocket();

  const fetchList = useCallback(() => {
    leaderboardApi.list(20).then(setList).catch(() => setList([]));
  }, []);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useEffect(() => {
    return onLeaderboardUpdated(fetchList);
  }, [onLeaderboardUpdated, fetchList]);

  if (!token) return null;

  return (
    <div className="min-h-screen noise-bg pb-24">
      <div className="gradient-bg" />
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
          <Link href="/home" className="text-white/70 hover:text-white">←</Link>
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <h1 className="text-lg font-semibold">Reyting</h1>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        {list.map((row, i) => (
          <motion.div
            key={row.rank}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <GlassCard className={`p-4 flex items-center gap-4 ${row.rank <= 3 ? "border-amber-400/30" : ""}`}>
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                {row.rank === 1 && <Medal className="w-6 h-6 text-amber-400" />}
                {row.rank === 2 && <Medal className="w-6 h-6 text-white/70" />}
                {row.rank === 3 && <Medal className="w-6 h-6 text-amber-700" />}
                {row.rank > 3 && row.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{row.childName}</p>
                <p className="text-sm text-white/50">Daraja {row.level}</p>
              </div>
              <p className="font-bold gradient-text-yellow">{row.totalXp.toLocaleString()} XP</p>
            </GlassCard>
          </motion.div>
        ))}
      </main>
      <BottomNav />
    </div>
  );
}
