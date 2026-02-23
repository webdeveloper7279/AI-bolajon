"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Gamepad2,
  Trophy,
  Video,
  BookOpen,
  User,
  LogOut,
  PenTool,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/hooks/useSocket";
import { children as childrenApi, progress as progressApi, videos as videosApi } from "@/lib/api";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Xayrli tong";
  if (h < 18) return "Xayrli kun";
  return "Xayrli kech";
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function HomePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const children = useAuthStore((s) => s.children);
  const currentChildId = useAuthStore((s) => s.currentChildId);
  const setChildren = useAuthStore((s) => s.setChildren);
  const setCurrentChild = useAuthStore((s) => s.setCurrentChild);
  const logout = useAuthStore((s) => s.logout);

  const [progress, setProgress] = useState<{
    totalXp: number;
    level: number;
    progressPercent: number;
    completedLessons: number;
    totalLessons: number;
  } | null>(null);
  const [videoList, setVideoList] = useState<Array<{ _id: string; title: string; durationSeconds: number }>>([]);
  const [videoProgressMap, setVideoProgressMap] = useState<Record<string, { watchedSeconds: number; completed: boolean }>>({});
  const [achievementPopup, setAchievementPopup] = useState<{ name: string; description?: string; xpBonus: number } | null>(null);

  const { onAchievementUnlocked } = useSocket();

  useEffect(() => {
    if (typeof window === "undefined" || !token) {
      router.replace("/login");
      return;
    }
    if (children.length === 0) {
      childrenApi
        .list()
        .then((list) => {
          if (list.length > 0) {
            setChildren(list);
            setCurrentChild(list[0]._id);
          } else {
            router.replace("/onboarding");
          }
        })
        .catch(() => router.replace("/login"));
      return;
    }
    if (!currentChildId && children.length > 0) setCurrentChild(children[0]._id);
  }, [token, router, children.length, currentChildId, setChildren, setCurrentChild]);

  useEffect(() => {
    if (!currentChildId) return;
    progressApi.get(currentChildId).then((p) => setProgress(p)).catch(() => setProgress(null));
  }, [currentChildId]);

  useEffect(() => {
    videosApi.list().then(setVideoList).catch(() => setVideoList([]));
  }, []);

  useEffect(() => {
    if (!currentChildId) return;
    videosApi.getProgress(currentChildId).then((list) => {
      const map: Record<string, { watchedSeconds: number; completed: boolean }> = {};
      list.forEach((p: { videoId: { _id: string }; watchedSeconds: number; completed: boolean }) => {
        const id = typeof p.videoId === "object" && p.videoId && "_id" in p.videoId ? p.videoId._id : (p as unknown as { videoId: string }).videoId;
        map[id] = { watchedSeconds: p.watchedSeconds, completed: p.completed };
      });
      setVideoProgressMap(map);
    }).catch(() => {});
  }, [currentChildId]);

  useEffect(() => {
    return onAchievementUnlocked((data) => {
      setAchievementPopup(data.achievement);
      setTimeout(() => setAchievementPopup(null), 4000);
    });
  }, [onAchievementUnlocked]);

  const currentChild = children.find((c) => c._id === currentChildId);
  const displayName = currentChild?.name || "Bolajon";
  const totalXp = progress?.totalXp ?? currentChild?.totalXp ?? 0;
  const level = progress?.level ?? currentChild?.level ?? 1;

  if (!token) return null;
  if (children.length === 0) return null;

  return (
    <div className="min-h-screen noise-bg pb-24">
      <div className="gradient-bg" />

      <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <span className="gradient-text-blue font-bold">AI</span>
            <span className="gradient-text-yellow font-bold">Bolajon</span>
          </Link>
          <div className="flex items-center gap-2">
            {children.length > 1 && (
              <select
                value={currentChildId || ""}
                onChange={(e) => setCurrentChild(e.target.value)}
                className="bg-white/10 text-white text-sm rounded-lg px-2 py-1 border border-white/20"
              >
                {children.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
            <Link href="/profile" className="p-2 rounded-xl hover:bg-white/10" aria-label="Profil">
              <User className="w-5 h-5 text-white/70" />
            </Link>
            <button type="button" onClick={() => { logout(); router.push("/"); }} className="p-2 rounded-xl hover:bg-white/10" aria-label="Chiqish">
              <LogOut className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-md mx-auto px-4 pt-6 space-y-6">
        <GlassCard hover={false} className="p-6 overflow-hidden relative">
          <p className="text-white/60 text-sm mb-1">{getGreeting()}</p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">👋</span>
            <h1 className="text-2xl font-bold">{displayName}!</h1>
          </div>
          <p className="text-white/50 text-sm mt-2">Bugun nima o&apos;rganamiz?</p>
        </GlassCard>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-400" /> Videolar
            </h2>
            <Link href="/videos" className="text-sm text-blue-400 hover:text-blue-300">Barchasi</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {videoList.slice(0, 5).map((v, i) => {
              const prog = videoProgressMap[v._id];
              const pct = v.durationSeconds > 0 && prog ? Math.min(100, (prog.watchedSeconds / v.durationSeconds) * 100) : 0;
              return (
                <Link key={v._id} href={`/videos?id=${v._id}`} className="flex-shrink-0 w-40">
                  <GlassCard className="p-0 overflow-hidden">
                    <div className="aspect-video bg-white/5 flex items-center justify-center text-4xl relative">
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-xs font-medium">Xavfsiz</span>
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/40 text-white text-xs flex items-center gap-1">
                        <Play className="w-3 h-3" /> {formatDuration(v.durationSeconds)}
                      </span>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2">{v.title}</h3>
                      {pct > 0 && <ProgressBar value={pct} max={100} className="mt-2" />}
                    </div>
                  </GlassCard>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <PenTool className="w-5 h-5 text-cyan-400" /> Rasm va bo&apos;yash
            </h2>
            <Link href="/drawing" className="text-sm text-cyan-400 hover:text-cyan-300">Ochish</Link>
          </div>
          <Link href="/drawing">
            <GlassCard className="p-4 bg-gradient-to-r from-cyan-500/20 to-teal-500/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">🎨</div>
                <div className="flex-1">
                  <h3 className="font-semibold">Rasm va bo&apos;yash</h3>
                  <p className="text-xs text-white/60">Ranglar va AI yordamchi</p>
                </div>
              </div>
            </GlassCard>
          </Link>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-amber-400" /> O&apos;yinlar
            </h2>
            <Link href="/games" className="text-sm text-amber-400 hover:text-amber-300">Barchasi</Link>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/games?type=math">
              <GlassCard className="p-4 bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">➕</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Math o&apos;yini</h3>
                    <p className="text-xs text-white/60">Raqamlar va hisob</p>
                  </div>
                </div>
              </GlassCard>
            </Link>
            <Link href="/games?type=logic">
              <GlassCard className="p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">🔤</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Mantiq o&apos;yini</h3>
                    <p className="text-xs text-white/60">Topish va tanlash</p>
                  </div>
                </div>
              </GlassCard>
            </Link>
          </div>
        </section>

        <GlassCard hover={false} className="p-6 bg-gradient-to-br from-amber-500/15 to-amber-600/10 border-amber-400/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm mb-1">Jami ballar</p>
              <p className="text-4xl font-bold gradient-text-yellow">{totalXp.toLocaleString()}</p>
              <p className="text-white/50 text-sm mt-1">Daraja {level}</p>
            </div>
            <Trophy className="w-14 h-14 text-amber-400/90" />
          </div>
          {progress && (
            <div className="mt-4">
              <p className="text-white/60 text-sm mb-1">Darslar: {progress.completedLessons} / {progress.totalLessons}</p>
              <ProgressBar value={progress.progressPercent} max={100} />
            </div>
          )}
        </GlassCard>
      </main>

      <AnimatePresence>
        {achievementPopup && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 z-50 mx-auto max-w-md"
          >
            <GlassCard className="p-4 border-amber-400/30 bg-amber-500/10">
              <p className="font-bold text-amber-400">🏆 Yutuq ochildi!</p>
              <p className="text-white font-medium">{achievementPopup.name}</p>
              {achievementPopup.description && <p className="text-white/70 text-sm">{achievementPopup.description}</p>}
              <p className="text-amber-400/90 text-sm">+{achievementPopup.xpBonus} XP</p>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
