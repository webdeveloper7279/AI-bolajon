"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { auth } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await auth.register(email, password, name);
      setAuth(token, { id: user.id, email: user.email, name: user.name });
      router.push("/onboarding");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ro'yxatdan o'tish xatosi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen noise-bg">
      <div className="gradient-bg" />
      <main className="relative z-10 min-h-screen px-6 py-8 max-w-md mx-auto flex flex-col">
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" /> Orqaga
        </Link>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold mb-2">
          Ro&apos;yxatdan o&apos;tish
        </motion.h1>
        <p className="text-white/60 mb-8">Yangi hisob yarating (ota-ona)</p>
        <GlassCard hover={false} className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FloatingInput label="Ism" value={name} onChange={setName} required />
            <FloatingInput label="Email" value={email} onChange={setEmail} type="email" required />
            <FloatingInput label="Parol (kamida 6 ta)" value={password} onChange={setPassword} type="password" required />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Yuklanmoqda..." : "Ro&apos;yxatdan o&apos;tish"}
            </Button>
          </form>
        </GlassCard>
        <p className="mt-6 text-center text-white/60">
          Hisobingiz bormi?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Kirish
          </Link>
        </p>
      </main>
    </div>
  );
}
