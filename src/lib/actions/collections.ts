"use server";

import { requireSession, checkCollectionLimit } from "@/lib/actions/guards";
import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  toggleCollectionFavorite as dbToggleCollectionFavorite,
} from "@/lib/db/collections";
import { validateCreateCollection } from "@/lib/collections-validation";
import type { CreateCollectionInput } from "@/lib/collections-validation";

// ─── Types ────────────────────────────────────────────────────

export type CreateCollectionResult =
  | { success: true; data: { id: string; name: string; description: string | null } }
  | { success: false; error: string };

export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export type ToggleFavoriteResult =
  | { success: true; isFavorite: boolean }
  | { success: false; error: string };

// ─── Server actions ───────────────────────────────────────────

export async function toggleCollectionFavorite(
  id: string
): Promise<ToggleFavoriteResult> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  try {
    const newValue = await dbToggleCollectionFavorite(id, s.userId);
    if (newValue === null) return { success: false, error: "Collection not found" };
    return { success: true, isFavorite: newValue };
  } catch {
    return { success: false, error: "Failed to toggle favorite" };
  }
}

export async function updateCollection(
  id: string,
  input: CreateCollectionInput
): Promise<ActionResult> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  const validation = validateCreateCollection(input);
  if (!validation.ok) return { success: false, error: validation.error };

  try {
    await dbUpdateCollection(id, s.userId, validation.data);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update collection" };
  }
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  try {
    await dbDeleteCollection(id, s.userId);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete collection" };
  }
}

export async function createCollection(
  input: CreateCollectionInput
): Promise<CreateCollectionResult> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  const limitError = await checkCollectionLimit(s.userId, s.isPro);
  if (limitError) return { success: false, error: limitError };

  const validation = validateCreateCollection(input);
  if (!validation.ok) return { success: false, error: validation.error };

  try {
    const created = await dbCreateCollection(s.userId, validation.data);
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Failed to create collection" };
  }
}
