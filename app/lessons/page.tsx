"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Check } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { lessons as lessonsApi, lessonProgress as progressApi } from "@/lib/api";

export default function LessonsPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const currentChildId = useAuthStore((s) => s.currentChildId);
  const [lessons, setLessons] = useState<Array<{ _id: string; title: string; category: string; difficulty: number; xpReward: number }>>([]);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  useEffect(() => {
    lessonsApi.list().then(setLessons).catch(() => setLessons([]));
  }, []);

  useEffect(() => {
    if (!currentChildId) return;
    progressApi.list(currentChildId).then((list) => {
      const ids = new Set(list.map((p: { lessonId: string }) => p.lessonId));
      setCompletedIds(ids);
    }).catch(() => {});
  }, [currentChildId]);

  if (!token) return null;

  return (
    <div className="min-h-screen noise-bg pb-24">
      <div className="gradient-bg" />
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
          <Link href="/home" className="text-white/70 hover:text-white">←</Link>
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" /> Darslar
          </h1>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        {lessons.map((l, i) => {
          const done = completedIds.has(l._id);
          return (
            <Link key={l._id} href={`/lessons/${l._id}`}>
              <GlassCard className={`p-4 flex items-center gap-4 ${done ? "border-emerald-500/30" : ""}`}>
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  {done ? <Check className="w-5 h-5 text-emerald-400" /> : <span className="text-lg">{i + 1}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold">{l.title}</h2>
                  <p className="text-sm text-white/50">{l.category} • {l.xpReward} XP</p>
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </main>
      <BottomNav />
    </div>
  );
}
