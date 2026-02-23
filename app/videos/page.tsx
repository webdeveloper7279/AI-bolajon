"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, ArrowLeft } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAuthStore } from "@/store/authStore";
import { videos as videosApi } from "@/lib/api";

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function VideosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const watchId = searchParams.get("id");
  const token = useAuthStore((s) => s.token);
  const currentChildId = useAuthStore((s) => s.currentChildId);

  const [list, setList] = useState<Array<{ _id: string; title: string; durationSeconds: number; description?: string; url?: string }>>([]);
  const [progressMap, setProgressMap] = useState<Record<string, { watchedSeconds: number; completed: boolean }>>({});
  const [watchSeconds, setWatchSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  useEffect(() => {
    videosApi.list().then(setList).catch(() => setList([]));
  }, []);

  useEffect(() => {
    if (!currentChildId) return;
    videosApi.getProgress(currentChildId).then((arr) => {
      const map: Record<string, { watchedSeconds: number; completed: boolean }> = {};
      arr.forEach((p: { videoId: { _id: string } | string; watchedSeconds: number; completed: boolean }) => {
        const id = typeof p.videoId === "object" && p.videoId ? (p.videoId as { _id: string })._id : (p.videoId as string);
        map[id] = { watchedSeconds: p.watchedSeconds, completed: p.completed };
      });
      setProgressMap(map);
    }).catch(() => {});
  }, [currentChildId]);

  const video = watchId ? list.find((v) => v._id === watchId) : null;

  useEffect(() => {
    if (!video || !watchId || initialized) return;
    const prog = progressMap[watchId];
    if (prog) setWatchSeconds(prog.watchedSeconds);
    setInitialized(true);
  }, [video, watchId, progressMap, initialized]);

  useEffect(() => {
    if (!video || !currentChildId) return;
    const interval = setInterval(() => {
      setWatchSeconds((s) => {
        const next = s + 5;
        if (next >= video.durationSeconds * 0.9 && !saving) {
          setSaving(true);
          videosApi.saveProgress(currentChildId, video._id, video.durationSeconds, true).finally(() => setSaving(false));
        } else if (next % 15 === 0 && next > 0 && !saving) {
          setSaving(true);
          videosApi.saveProgress(currentChildId, video._id, next, false).finally(() => setSaving(false));
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [video?._id, currentChildId, saving, video?.durationSeconds]);

  if (!token) return null;

  if (watchId && video) {
    const prog = progressMap[video._id] || { watchedSeconds: watchSeconds };
    const current = watchSeconds > 0 ? watchSeconds : prog.watchedSeconds;
    const pct = Math.min(100, (current / video.durationSeconds) * 100);

    return (
      <div className="min-h-screen noise-bg">
        <div className="gradient-bg" />
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
            <Link href="/videos" className="text-white/70 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-lg font-semibold truncate">{video.title}</h1>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-6">
          <GlassCard className="aspect-video bg-black/40 overflow-hidden p-0">
            {video.url && (video.url.includes("youtube.com/embed") || video.url.includes("youtube.com/watch") || video.url.includes("youtu.be") || video.url.includes("youtube.com/shorts")) ? (
              <iframe
                className="w-full h-full min-h-[200px]"
                src={video.url.includes("/embed/") ? video.url : `https://www.youtube.com/embed/${(video.url.match(/(?:shorts\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1] ?? "").split("&")[0]}`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center relative">
                <Play className="w-16 h-16 text-white/60" />
                <p className="absolute bottom-4 left-4 right-4 text-center text-white/70 text-sm">Video player (URL: {video.url})</p>
              </div>
            )}
          </GlassCard>
          <div className="mt-4">
            <ProgressBar value={pct} max={100} showLabel />
            <p className="text-white/50 text-sm mt-1">{formatDuration(Math.round((pct / 100) * video.durationSeconds))} / {formatDuration(video.durationSeconds)}</p>
          </div>
          {watchSeconds > 0 && (
            <p className="text-white/50 text-sm mt-2">Kuzatilmoqda: {watchSeconds}s (har 15s da progress saqlanadi)</p>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen noise-bg pb-24">
      <div className="gradient-bg" />
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
          <Link href="/home" className="text-white/70 hover:text-white">←</Link>
          <h1 className="text-lg font-semibold">Videolar</h1>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-3">
        {list.map((v) => {
          const prog = progressMap[v._id];
          const pct = prog ? (prog.watchedSeconds / v.durationSeconds) * 100 : 0;
          return (
            <Link key={v._id} href={`/videos?id=${v._id}`}>
              <GlassCard className="p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold">{v.title}</h2>
                  <p className="text-sm text-white/50">{formatDuration(v.durationSeconds)}</p>
                  {pct > 0 && <ProgressBar value={pct} max={100} className="mt-2" />}
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
