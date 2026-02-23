import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface ChildProfile {
  _id: string;
  name: string;
  age: number;
  interests?: string[];
  totalXp?: number;
  level?: number;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  children: ChildProfile[];
  currentChildId: string | null;
  setAuth: (token: string, user: AuthUser) => void;
  setChildren: (children: ChildProfile[]) => void;
  setCurrentChild: (id: string | null) => void;
  addChild: (child: ChildProfile) => void;
  updateChildXp: (childId: string, totalXp: number, level: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      children: [],
      currentChildId: null,
      setAuth: (token, user) => {
        if (typeof window !== "undefined") localStorage.setItem("token", token);
        set({ token, user });
      },
      setChildren: (children) => set({ children }),
      setCurrentChild: (currentChildId) => set({ currentChildId }),
      addChild: (child) => set((s) => ({ children: [child, ...s.children] })),
      updateChildXp: (childId, totalXp, level) =>
        set((s) => ({
          children: s.children.map((c) =>
            c._id === childId ? { ...c, totalXp, level } : c
          ),
        })),
      logout: () => {
        if (typeof window !== "undefined") localStorage.removeItem("token");
        set({ token: null, user: null, children: [], currentChildId: null });
      },
    }),
    { name: "ai-bolajon-auth" }
  )
);
