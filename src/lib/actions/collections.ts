"use server";

import { auth } from "@/auth";
import {
  createCollection as dbCreateCollection,
  updateCollection as dbUpdateCollection,
  deleteCollection as dbDeleteCollection,
  toggleCollectionFavorite as dbToggleCollectionFavorite,
} from "@/lib/db/collections";
import { validateCreateCollection } from "@/lib/collections-validation";
import type { CreateCollectionInput } from "@/lib/collections-validation";
import { isAtCollectionLimit, collectionLimitMessage } from "@/lib/usage-limits";
import { FREE_COLLECTIONS_LIMIT } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

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
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const newValue = await dbToggleCollectionFavorite(id, session.user.id);
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
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const validation = validateCreateCollection(input);
  if (!validation.ok) return { success: false, error: validation.error };

  try {
    await dbUpdateCollection(id, session.user.id, validation.data);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update collection" };
  }
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    await dbDeleteCollection(id, session.user.id);
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete collection" };
  }
}

export async function createCollection(
  input: CreateCollectionInput
): Promise<CreateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  // Free tier collection count limit
  if (!session.user.isPro) {
    const count = await prisma.collection.count({ where: { userId: session.user.id } });
    if (isAtCollectionLimit(false, count)) {
      return { success: false, error: collectionLimitMessage(FREE_COLLECTIONS_LIMIT) };
    }
  }

  const validation = validateCreateCollection(input);
  if (!validation.ok) return { success: false, error: validation.error };

  try {
    const created = await dbCreateCollection(session.user.id, validation.data);
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Failed to create collection" };
  }
}
