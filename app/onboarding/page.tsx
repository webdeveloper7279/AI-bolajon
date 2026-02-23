"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { FloatingInput } from "@/components/ui/FloatingInput";
import { FloatingSelect } from "@/components/ui/FloatingSelect";
import { children as childrenApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const AGE_OPTIONS = [
  { value: "3", label: "3 yosh" },
  { value: "4", label: "4 yosh" },
  { value: "5", label: "5 yosh" },
  { value: "6", label: "6 yosh" },
  { value: "7", label: "7 yosh" },
  { value: "8", label: "8 yosh" },
  { value: "9", label: "9 yosh" },
  { value: "10", label: "10 yosh" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const addChild = useAuthStore((s) => s.addChild);
  const setCurrentChild = useAuthStore((s) => s.setCurrentChild);

  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !token) router.replace("/login");
  }, [token, router]);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!childName.trim()) next.childName = "Bolaning ismini kiriting";
    if (!childAge) next.childAge = "Yoshni tanlang";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const age = parseInt(childAge, 10);
      const created = await childrenApi.create({ name: childName.trim(), age });
      addChild({
        _id: created._id,
        name: created.name,
        age: created.age,
        totalXp: 0,
        level: 1,
      });
      setCurrentChild(created._id);
      router.push("/home");
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : "Xatolik" });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen noise-bg">
      <div className="gradient-bg" />
      <main className="relative z-10 min-h-screen px-6 py-8 max-w-md mx-auto flex flex-col">
        <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6">
          <ArrowLeft className="w-5 h-5" /> Orqaga
        </Link>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold mb-2">
          Bolani qo&apos;shing
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/60 mb-8">
          Bolajon uchun profil yarating — keyin darslar va o&apos;yinlar ochiladi.
        </motion.p>
        <GlassCard hover={false} className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FloatingInput
              label="Bolaning ismi"
              value={childName}
              onChange={setChildName}
              placeholder="Masalan: Sardor"
              error={errors.childName}
              required
            />
            <FloatingSelect
              label="Bolaning yoshi"
              value={childAge}
              onChange={setChildAge}
              options={AGE_OPTIONS}
              placeholder="Yoshni tanlang"
              error={errors.childAge}
              required
            />
            {errors.submit && <p className="text-red-400 text-sm">{errors.submit}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Saqlanmoqda..." : "Davom etish"}
            </Button>
          </form>
        </GlassCard>
      </main>
    </div>
  );
}
