import { z } from "zod";

export const submitGameScoreSchema = z.object({
  childId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  gameType: z.enum(["logic", "math"]),
  score: z.number().min(0),
  maxScore: z.number().min(1),
  metadata: z.record(z.unknown()).optional(),
});
