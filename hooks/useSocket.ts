"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:4000";

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore((s) => s.token);
  const currentChildId = useAuthStore((s) => s.currentChildId);
  const updateChildXp = useAuthStore((s) => s.updateChildXp);

  useEffect(() => {
    if (!token) return;
    const s = io(SOCKET_URL, { auth: { token } });
    socketRef.current = s;
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s || !currentChildId) return;
    s.emit("subscribe_child", currentChildId);
    return () => {
      s.emit("unsubscribe_child", currentChildId);
    };
  }, [currentChildId, token]);

  const onXpUpdated = useCallback(
    (cb: (data: { totalXp: number; xpEarned: number; level: number }) => void) => {
      const s = socketRef.current;
      if (!s) return () => {};
      s.on("xp_updated", cb);
      return () => s.off("xp_updated", cb);
    },
    [token]
  );

  const onAchievementUnlocked = useCallback(
    (cb: (data: { achievement: { name: string; description?: string; xpBonus: number } }) => void) => {
      const s = socketRef.current;
      if (!s) return () => {};
      s.on("achievement_unlocked", cb);
      return () => s.off("achievement_unlocked", cb);
    },
    [token]
  );

  const onLeaderboardUpdated = useCallback(
    (cb: () => void) => {
      const s = socketRef.current;
      if (!s) return () => {};
      s.on("leaderboard_updated", cb);
      return () => s.off("leaderboard_updated", cb);
    },
    [token]
  );

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;
    const handler = (data: { totalXp: number; level: number }) => {
      if (currentChildId) updateChildXp(currentChildId, data.totalXp, data.level);
    };
    s.on("xp_updated", handler);
    return () => s.off("xp_updated", handler);
  }, [currentChildId, updateChildXp, token]);

  return { socket: socketRef.current, onXpUpdated, onAchievementUnlocked, onLeaderboardUpdated };
}
