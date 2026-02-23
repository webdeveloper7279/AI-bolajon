"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuthStore } from "@/store/authStore";
import { lessons as lessonsApi, lessonProgress as progressApi } from "@/lib/api";

export default function LessonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const token = useAuthStore((s) => s.token);
  const currentChildId = useAuthStore((s) => s.currentChildId);
  const updateChildXp = useAuthStore((s) => s.updateChildXp);

  const [lesson, setLesson] = useState<{
    _id: string;
    title: string;
    content: string;
    questions: Array<{ text: string; options?: string[]; correctAnswer: string }>;
    xpReward: number;
  } | null>(null);
  const [completed, setCompleted] = useState(false);
  const [step, setStep] = useState<"content" | "quiz">("content");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  useEffect(() => {
    if (!id) return;
    lessonsApi.get(id).then(setLesson).catch(() => setLesson(null));
    if (currentChildId) {
      progressApi.list(currentChildId).then((list) => {
        const done = list.some((p: { lessonId: string }) => p.lessonId === id);
        setCompleted(done);
      }).catch(() => {});
    }
  }, [id, currentChildId]);

  const submitQuiz = async () => {
    if (!lesson || !currentChildId) return;
    const correct = lesson.questions.filter((q, i) => answers[i] === q.correctAnswer).length;
    const pct = lesson.questions.length ? Math.round((correct / lesson.questions.length) * 100) : 0;
    setScore(pct);
    setLoading(true);
    try {
      const res = await lessonsApi.complete(currentChildId, lesson._id, pct, Math.round((Date.now() - startTime) / 1000));
      updateChildXp(currentChildId, res.totalXp, res.level);
      setCompleted(true);
    } catch {
      setScore(null);
    } finally {
      setLoading(false);
    }
  };

  if (!token || !lesson) return null;

  if (completed && score !== null) {
    return (
      <div className="min-h-screen noise-bg">
        <div className="gradient-bg" />
        <main className="max-w-md mx-auto px-4 py-8">
          <GlassCard className="p-8 text-center">
            <p className="text-4xl mb-4">🎉</p>
            <h1 className="text-2xl font-bold mb-2">Dars tugadi!</h1>
            <p className="text-3xl font-bold gradient-text-yellow mb-4">{score}%</p>
            <p className="text-white/60 mb-6">Natija saqlandi, XP hisobingiz yangilandi.</p>
            <Link href="/lessons"><Button>Darslar ro&apos;yxati</Button></Link>
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
          <Link href="/lessons" className="text-white/70 hover:text-white">←</Link>
          <h1 className="text-lg font-semibold truncate">{lesson.title}</h1>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {step === "content" && (
          <GlassCard className="p-6">
            <div className="prose prose-invert max-w-none">
              <p className="text-white/90 whitespace-pre-wrap">{lesson.content}</p>
            </div>
            <Button className="mt-6 w-full" onClick={() => setStep("quiz")}>
              Savollarga o&apos;tish
            </Button>
          </GlassCard>
        )}

        {step === "quiz" && (
          <div className="space-y-6">
            {lesson.questions.map((q, i) => (
              <GlassCard key={i} className="p-4">
                <p className="font-medium mb-3">{q.text}</p>
                <div className="space-y-2">
                  {(q.options || [q.correctAnswer]).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAnswers((a) => ({ ...a, [i]: opt }))}
                      className={`w-full text-left px-4 py-2 rounded-xl border transition-colors ${
                        answers[i] === opt ? "bg-blue-500/20 border-blue-400/50" : "bg-white/5 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </GlassCard>
            ))}
            <Button className="w-full" size="lg" onClick={submitQuiz} disabled={loading || Object.keys(answers).length < lesson.questions.length}>
              {loading ? "Yuborilmoqda..." : "Yuborish"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
