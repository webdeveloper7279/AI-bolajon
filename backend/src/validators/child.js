import { z } from "zod";

export const createChildSchema = z.object({
  name: z.string().min(1).max(50),
  age: z.coerce.number().int().min(3).max(12),
  interests: z.array(z.string().max(50)).optional().default([]),
  avatar: z.string().url().optional().nullable(),
});

export const updateChildSchema = createChildSchema.partial();

export const childIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid child ID"),
});
