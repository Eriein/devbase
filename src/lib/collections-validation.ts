import { z } from "zod";

// ─── Create schema ─────────────────────────────────────────────

export const createCollectionSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().trim().max(500, "Description too long").nullable().optional(),
});

export type CreateCollectionInput = z.infer<typeof createCollectionSchema>;

export function validateCreateCollection(
  input: unknown
): { ok: true; data: CreateCollectionInput } | { ok: false; error: string } {
  const parsed = createCollectionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  return { ok: true, data: parsed.data };
}
