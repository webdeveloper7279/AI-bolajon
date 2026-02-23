"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { games as gamesApi } from "@/lib/api";

function GamesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "math" | "logic") || null;
  const token = useAuthStore((s) => s.token);
  const currentChildId = useAuthStore((s) => s.currentChildId);
  const updateChildXp = useAuthStore((s) => s.updateChildXp);

  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(10);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mathA, setMathA] = useState(0);
  const [mathB, setMathB] = useState(0);
  const [mathAnswer, setMathAnswer] = useState("");
  const [logicSequence, setLogicSequence] = useState<number[]>([]);
  const [logicAnswer, setLogicAnswer] = useState("");

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  useEffect(() => {
    if (type === "math") {
      setMathA(Math.floor(Math.random() * 10) + 1);
      setMathB(Math.floor(Math.random() * 10) + 1);
    }
    if (type === "logic") {
      const arr = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5).slice(0, 4);
      setLogicSequence(arr);
    }
  }, [type]);

  const submitMath = async () => {
    const correct = mathA + mathB === parseInt(mathAnswer, 10) ? 1 : 0;
    setLoading(true);
    try {
      const res = await gamesApi.submit(currentChildId!, "math", correct, 1);
      updateChildXp(currentChildId!, res.totalXp, res.level);
      setScore(correct);
      setMaxScore(1);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const submitLogic = async () => {
    const sorted = [...logicSequence].sort((a, b) => a - b);
    const userArr = logicAnswer.split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n));
    const correct = userArr.length === sorted.length && userArr.every((v, i) => v === sorted[i]) ? 1 : 0;
    setLoading(true);
    try {
      const res = await gamesApi.submit(currentChildId!, "logic", correct, 1);
      updateChildXp(currentChildId!, res.totalXp, res.level);
      setScore(correct);
      setMaxScore(1);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  if (submitted) {
    return (
      <div className="min-h-screen noise-bg">
        <div className="gradient-bg" />
        <main className="max-w-md mx-auto px-4 py-8">
          <GlassCard className="p-8 text-center">
            <p className="text-4xl mb-4">🎮</p>
            <h1 className="text-2xl font-bold mb-2">O&apos;yin tugadi!</h1>
            <p className="text-3xl font-bold gradient-text-yellow mb-4">{score} / {maxScore}</p>
            <p className="text-white/60 mb-6">Natija saqlandi.</p>
            <Link href="/games"><Button>Boshqa o&apos;yinlar</Button></Link>
          </GlassCard>
        </main>
      </div>
    );
  }

  if (type === "math") {
    return (
      <div className="min-h-screen noise-bg pb-24">
        <div className="gradient-bg" />
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
            <Link href="/games" className="text-white/70 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-lg font-semibold">Math o&apos;yini</h1>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-8">
          <GlassCard className="p-8 text-center">
            <p className="text-white/60 mb-2">Qo&apos;shing</p>
            <p className="text-4xl font-bold mb-4">{mathA} + {mathB} = ?</p>
            <input
              type="number"
              value={mathAnswer}
              onChange={(e) => setMathAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-center text-2xl"
              placeholder="Javob"
            />
            <Button className="mt-6 w-full" onClick={submitMath} disabled={loading}>Yuborish</Button>
          </GlassCard>
        </main>
      </div>
    );
  }

  if (type === "logic") {
    return (
      <div className="min-h-screen noise-bg pb-24">
        <div className="gradient-bg" />
        <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
            <Link href="/games" className="text-white/70 hover:text-white"><ArrowLeft className="w-5 h-5" /></Link>
            <h1 className="text-lg font-semibold">Mantiq o&apos;yini</h1>
          </div>
        </header>
        <main className="max-w-md mx-auto px-4 py-8">
          <GlassCard className="p-8">
            <p className="text-white/60 mb-2">Raqamlarni o&apos;sish tartibida yozing (vergul yoki probel bilan)</p>
            <p className="text-2xl font-bold mb-4 flex gap-2 justify-center">
              {logicSequence.map((n, i) => (
                <span key={i} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10">{n}</span>
              ))}
            </p>
            <input
              type="text"
              value={logicAnswer}
              onChange={(e) => setLogicAnswer(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white"
              placeholder="Masalan: 1, 2, 3, 4"
            />
            <Button className="mt-6 w-full" onClick={submitLogic} disabled={loading}>Yuborish</Button>
          </GlassCard>
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
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-amber-400" /> O&apos;yinlar
          </h1>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-4">
        <Link href="/games?type=math">
          <GlassCard className="p-6 bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">➕</div>
              <div>
                <h2 className="text-xl font-semibold">Math o&apos;yini</h2>
                <p className="text-white/60 text-sm">Raqamlar va qo&apos;shish</p>
              </div>
            </div>
          </GlassCard>
        </Link>
        <Link href="/games?type=logic">
          <GlassCard className="p-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-3xl">🔤</div>
              <div>
                <h2 className="text-xl font-semibold">Mantiq o&apos;yini</h2>
                <p className="text-white/60 text-sm">Tartiblash</p>
              </div>
            </div>
          </GlassCard>
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}

export default function GamesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen noise-bg" />}>
      <GamesPageContent />
    </Suspense>
  );
}
