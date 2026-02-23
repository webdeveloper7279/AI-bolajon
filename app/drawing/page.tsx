"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PenTool, Palette } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";

const COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#3b82f6",
  "#8b5cf6", "#ec4899", "#ffffff",
];

const OBJECTS = [
  { id: "robot", label: "Robot", emoji: "🤖" },
  { id: "star", label: "Yulduz", emoji: "⭐" },
  { id: "flower", label: "Gul", emoji: "🌸" },
  { id: "car", label: "Mashina", emoji: "🚗" },
];

export default function DrawingPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [color, setColor] = useState("#22c55e");
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endDraw = () => setIsDrawing(false);

  if (!token) return null;

  return (
    <div className="min-h-screen noise-bg pb-24">
      <div className="gradient-bg" />
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
          <Link href="/home" className="text-white/70 hover:text-white">←</Link>
          <PenTool className="w-5 h-5 text-cyan-400" />
          <h1 className="text-lg font-semibold">Rasm va bo&apos;yash</h1>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        <section>
          <h2 className="text-sm font-medium text-white/60 mb-2">Bo&apos;yash uchun ob&apos;yekt</h2>
          <div className="grid grid-cols-4 gap-3">
            {OBJECTS.map((obj) => (
              <button
                key={obj.id}
                onClick={() => setSelectedObject(selectedObject === obj.id ? null : obj.id)}
                className={`p-4 rounded-2xl bg-white/5 border transition ${
                  selectedObject === obj.id ? "border-cyan-400/60 bg-cyan-500/10" : "border-white/10 hover:bg-white/5"
                }`}
              >
                <span className="text-3xl block mb-1">{obj.emoji}</span>
                <span className="text-sm font-medium">{obj.label}</span>
              </button>
            ))}
          </div>
        </section>

        <GlassCard className="p-2 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full aspect-square bg-slate-800 rounded-xl cursor-crosshair block touch-none"
            style={{ maxHeight: 320 }}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
          />
        </GlassCard>

        <section>
          <h2 className="text-sm font-medium text-white/60 mb-2 flex items-center gap-2">
            <Palette className="w-4 h-4" /> Rang palitrasi
          </h2>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-full transition ring-2 ${
                  color === c ? "ring-white ring-offset-2 ring-offset-navy-900" : "ring-transparent"
                }`}
                style={{ backgroundColor: c }}
                aria-label={`Rang: ${c}`}
              />
            ))}
          </div>
        </section>

        <Link href="/chat" className="block">
          <GlassCard className="p-4 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400/30 flex items-center gap-4">
            <span className="text-3xl">🤖</span>
            <div className="flex-1">
              <p className="font-semibold">AI yordamchi</p>
              <p className="text-sm text-white/60">Rasm va bo&apos;yashda yordam bering</p>
            </div>
          </GlassCard>
        </Link>
      </main>
      <BottomNav />
    </div>
  );
}
