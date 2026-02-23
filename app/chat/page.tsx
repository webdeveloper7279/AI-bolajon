"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuthStore } from "@/store/authStore";
import { chat as chatApi } from "@/lib/api";

export default function ChatPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const currentChildId = useAuthStore((s) => s.currentChildId);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  useEffect(() => {
    if (!currentChildId) return;
    chatApi.history(currentChildId).then((r) => setMessages(r.messages || [])).catch(() => setMessages([]));
  }, [currentChildId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !currentChildId || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const { reply } = await chatApi.message(currentChildId, userMsg);
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Xatolik. Qayta urinib koring." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen noise-bg flex flex-col pb-24">
      <div className="gradient-bg" />
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-navy-950/80 border-b border-white/5">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-2">
          <Link href="/home" className="text-white/70 hover:text-white">←</Link>
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <h1 className="text-lg font-semibold">AI Yordamchi</h1>
        </div>
      </header>
      <main className="flex-1 max-w-md mx-auto w-full px-4 py-4 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          {messages.length === 0 && (
            <p className="text-white/50 text-center py-8">Salom! Savol bering.</p>
          )}
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <GlassCard className={"max-w-[85%] p-3 " + (msg.role === "user" ? "bg-blue-500/20 border-blue-400/30" : "")}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </GlassCard>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <GlassCard className="p-3"><p className="text-white/50 text-sm">...</p></GlassCard>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Xabar yozing..."
            className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40"
          />
          <Button size="md" onClick={send} disabled={loading}>Yuborish</Button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
