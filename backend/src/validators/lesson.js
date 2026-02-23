import { z } from "zod";

export const completeLessonSchema = z.object({
  childId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  lessonId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  score: z.number().min(0).max(100),
  timeSpentSeconds: z.number().min(0).optional().default(0),
});

export const lessonIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/),
});
