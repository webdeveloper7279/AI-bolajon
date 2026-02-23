import { z } from "zod";

export const chatMessageSchema = z.object({
  childId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  message: z.string().min(1).max(2000),
});
