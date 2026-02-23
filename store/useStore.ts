import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserProfile {
  name: string;
  childName: string;
  childAge: string;
  avatar?: string;
  completedOnboarding: boolean;
}

export interface VideoProgress {
  videoId: string;
  watchedSeconds: number;
  completed: boolean;
}

export interface GameProgress {
  gameId: string;
  level: number;
  xp: number;
  maxXp: number;
  completed: boolean;
}

interface AppState {
  user: UserProfile | null;
  points: number;
  videos: VideoProgress[];
  games: GameProgress[];
  setUser: (user: UserProfile | null) => void;
  setPoints: (points: number) => void;
  addPoints: (amount: number) => void;
  setVideoProgress: (videoId: string, watchedSeconds: number, completed?: boolean) => void;
  setGameProgress: (gameId: string, level: number, xp: number, maxXp: number, completed?: boolean) => void;
  completeOnboarding: (profile: Partial<UserProfile>) => void;
}

const defaultVideos: VideoProgress[] = [
  { videoId: "v1", watchedSeconds: 0, completed: false },
  { videoId: "v2", watchedSeconds: 45, completed: false },
  { videoId: "v3", watchedSeconds: 120, completed: true },
];

const defaultGames: GameProgress[] = [
  { gameId: "g1", level: 2, xp: 65, maxXp: 100, completed: false },
  { gameId: "g2", level: 1, xp: 20, maxXp: 50, completed: false },
  { gameId: "g3", level: 3, xp: 100, maxXp: 100, completed: true },
];

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      points: 1250,
      videos: defaultVideos,
      games: defaultGames,

      setUser: (user) => set({ user }),

      setPoints: (points) => set({ points }),

      addPoints: (amount) => set((state) => ({ points: state.points + amount })),

      setVideoProgress: (videoId, watchedSeconds, completed = false) =>
        set((state) => ({
          videos: state.videos.map((v) =>
            v.videoId === videoId ? { ...v, watchedSeconds, completed } : v
          ),
        })),

      setGameProgress: (gameId, level, xp, maxXp, completed = false) =>
        set((state) => ({
          games: state.games.map((g) =>
            g.gameId === gameId ? { ...g, level, xp, maxXp, completed } : g
          ),
        })),

      completeOnboarding: (profile) =>
        set((state) => ({
          user: {
            name: profile.name ?? state.user?.name ?? "",
            childName: profile.childName ?? state.user?.childName ?? "",
            childAge: profile.childAge ?? state.user?.childAge ?? "",
            avatar: profile.avatar ?? state.user?.avatar,
            completedOnboarding: true,
          },
        })),
    }),
    { name: "ai-bolajon-store" }
  )
);
