"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { useAuthStore } from "@/store/authStore";

export default function SplashPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const children = useAuthStore((s) => s.children);

  useEffect(() => {
    if (token) router.replace("/home");
  }, [token, router]);

  const hasChildren = children.length > 0;
  const startHref = !token ? "/login" : hasChildren ? "/home" : "/onboarding";
  const startLabel = !token ? "Boshlash" : hasChildren ? "Shaxsiy kabinetga" : "Bolani qo'shish";

  return (
    <div className="min-h-screen noise-bg">
      <div className="gradient-bg" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-64 h-64 rounded-full bg-blue-500/20 blur-3xl top-1/4 -left-32"
        />
        <motion.div
          animate={{ y: [0, 15, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-48 h-48 rounded-full bg-teal-500/20 blur-3xl bottom-1/3 -right-24"
        />
      </div>
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-6"
        >
          <GlassCard hover={false} className="p-6 mb-2">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
              <Sparkles className="w-16 h-16 text-amber-400" />
            </motion.div>
          </GlassCard>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold text-center leading-tight"
          >
            <span className="gradient-text-blue">AI</span> <span className="gradient-text-yellow">Bolajon</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-white/70 text-center text-lg max-w-sm"
          >
            Bolalar uchun xavfsiz va qiziqarli AI ta'lim platformasi
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }} className="pt-4 flex flex-col gap-3">
            <Link href={startHref}>
              <Button size="lg" icon={Sparkles}>
                {startLabel}
              </Button>
            </Link>
            {!token && (
              <Link href="/register">
                <Button variant="secondary" size="md">
                  Ro&apos;yxatdan o&apos;tish
                </Button>
              </Link>
            )}
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
