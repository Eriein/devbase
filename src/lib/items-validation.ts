import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z
    .union([z.literal(""), z.url("Must be a valid URL")])
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  language: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

// ─── Pure validation helper ───────────────────────────────────

export function validateUpdateItem(
  input: unknown
): { ok: true; data: UpdateItemInput } | { ok: false; error: string } {
  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  return { ok: true, data: parsed.data };
}
