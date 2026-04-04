import { z } from "zod";

const toggleItemFavoriteSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
});

const toggleCollectionFavoriteSchema = z.object({
  id: z.string().min(1, "Collection ID is required"),
});

export function validateToggleItemFavoriteInput(input: unknown) {
  const result = toggleItemFavoriteSchema.safeParse(input);
  if (!result.success) {
    return { ok: false as const, error: result.error.issues[0]?.message ?? "Invalid input" };
  }
  return { ok: true as const, data: result.data };
}

export function validateToggleCollectionFavoriteInput(input: unknown) {
  const result = toggleCollectionFavoriteSchema.safeParse(input);
  if (!result.success) {
    return { ok: false as const, error: result.error.issues[0]?.message ?? "Invalid input" };
  }
  return { ok: true as const, data: result.data };
}
