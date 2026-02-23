import { z } from "zod";

export const videoProgressSchema = z.object({
  childId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  videoId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  watchedSeconds: z.number().min(0),
  completed: z.boolean().optional().default(false),
});
