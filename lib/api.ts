const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function api<T>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: object } = {}
): Promise<T> {
  const { body, ...rest } = options;
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    });
  } catch (err) {
    const isNetworkError =
      err instanceof TypeError &&
      (err.message === "Failed to fetch" || err.message === "Load failed");
    if (isNetworkError) {
      throw new Error(
        "Serverga ulanish xatosi. Backend (port 4000) ishlayaptimi? 'cd backend' va 'npm run dev' bajarib ko'ring."
      );
    }
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || "So'rov muvaffaqiyatsiz");
  return data as T;
}

export const auth = {
  register: (email: string, password: string, name: string) =>
    api<{ user: { id: string; email: string; name: string }; token: string }>("/auth/register", {
      method: "POST",
      body: { email, password, name },
    }),
  login: (email: string, password: string) =>
    api<{ user: { id: string; email: string; name: string }; token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
    }),
};

export const children = {
  list: () => api<Array<{ _id: string; name: string; age: number; interests: string[]; totalXp: number; level: number }>>("/children"),
  get: (id: string) => api<{ _id: string; name: string; age: number; interests: string[]; totalXp: number; level: number }>(`/children/${id}`),
  create: (data: { name: string; age: number; interests?: string[] }) =>
    api<{ _id: string; name: string; age: number }>("/children", { method: "POST", body: data }),
  update: (id: string, data: { name?: string; age?: number; interests?: string[] }) =>
    api(`/children/${id}`, { method: "PATCH", body: data }),
  delete: (id: string) => api(`/children/${id}`, { method: "DELETE" }),
};

export const lessons = {
  list: () =>
    api<
      Array<{
        _id: string;
        title: string;
        category: string;
        difficulty: number;
        content: string;
        questions: Array<{ text: string; options?: string[]; correctAnswer: string }>;
        xpReward: number;
        order: number;
      }>
    >("/lessons"),
  get: (id: string) => api<{ _id: string; title: string; category: string; content: string; questions: Array<{ text: string; options?: string[]; correctAnswer: string }>; xpReward: number }>(`/lessons/${id}`),
  complete: (childId: string, lessonId: string, score: number, timeSpentSeconds?: number) =>
    api<{ xpEarned: number; totalXp: number; level: number; achievements: Array<{ type: string; name: string; xpBonus: number }> }>("/lessons/complete", {
      method: "POST",
      body: { childId, lessonId, score, timeSpentSeconds: timeSpentSeconds ?? 0 },
    }),
};

export const lessonProgress = {
  list: (childId: string) =>
    api<Array<{ lessonId: string; score: number; xpEarned: number }>>(`/lesson-progress/child/${childId}`),
};

export const progress = {
  get: (childId: string) =>
    api<{
      totalXp: number;
      level: number;
      currentXp: number;
      xpForNextLevel: number;
      completedLessons: number;
      totalLessons: number;
      progressPercent: number;
    }>(`/progress/child/${childId}`),
};

export const videos = {
  list: () =>
    api<
      Array<{
        _id: string;
        title: string;
        description?: string;
        url: string;
        durationSeconds: number;
        thumbnail?: string;
        category?: string;
      }>
    >("/videos"),
  saveProgress: (childId: string, videoId: string, watchedSeconds: number, completed?: boolean) =>
    api<{ progress: { watchedSeconds: number; completed: boolean; completionPercent: number }; achievements: unknown[] }>("/videos/progress", {
      method: "POST",
      body: { childId, videoId, watchedSeconds, completed },
    }),
  getProgress: (childId: string) =>
    api<Array<{ videoId: { _id: string; title: string; durationSeconds: number }; watchedSeconds: number; completed: boolean }>>(`/videos/progress/${childId}`),
};

export const games = {
  submit: (childId: string, gameType: "logic" | "math", score: number, maxScore: number, metadata?: object) =>
    api<{ xpEarned: number; totalXp: number; level: number; achievements: unknown[] }>("/games/submit", {
      method: "POST",
      body: { childId, gameType, score, maxScore, metadata },
    }),
};

export const chat = {
  message: (childId: string, message: string) =>
    api<{ reply: string; tokensUsed: number }>("/chat/message", { method: "POST", body: { childId, message } }),
  history: (childId: string) => api<{ messages: Array<{ role: string; content: string }> }>(`/chat/history/${childId}`),
};

export const leaderboard = {
  list: (limit?: number) =>
    api<Array<{ rank: number; childName: string; totalXp: number; level: number }>>(`/leaderboard?limit=${limit ?? 20}`),
};

export const dashboard = {
  analytics: (childId: string) =>
    api<{
      totalXp: number;
      level: number;
      completedLessons: number;
      totalLessons?: number;
      totalStudyTimeSeconds: number;
      weeklyProgress: Array<{ date: string; lessonsCompleted: number; xpEarned: number }>;
      gamesPlayed: number;
      videosCompleted: number;
      resultsOverview?: { matematik: number; mantiq: number; oyinlar: number };
    }>(`/dashboard/analytics/${childId}`),
};

export const achievements = {
  getByChild: (childId: string) =>
    api<{
      childId: string;
      totalStars: number;
      achievementCount: number;
      streak: number;
      achievements: Array<{
        _id: string;
        type: string;
        name: string;
        description?: string;
        xpBonus: number;
        unlockedAt: string;
      }>;
    }>(`/achievements/child/${childId}`),
};
