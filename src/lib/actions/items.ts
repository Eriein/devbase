"use server";

import { requireSession, checkItemLimit } from "@/lib/actions/guards";
import {
  createItem as dbCreateItem,
  updateItem as dbUpdateItem,
  deleteItem as dbDeleteItem,
  getItemFileKey,
  toggleItemFavorite as dbToggleItemFavorite,
  toggleItemPin as dbToggleItemPin,
} from "@/lib/db/items";
import {
  validateCreateItem,
  validateUpdateItem,
} from "@/lib/items-validation";
import type { CreateItemInput, UpdateItemInput } from "@/lib/items-validation";
import type { ItemDetail } from "@/lib/db/items";
import { deleteFromR2 } from "@/lib/r2";
import { canUploadFiles } from "@/lib/usage-limits";

export type CreateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export type DeleteItemResult =
  | { success: true }
  | { success: false; error: string };

export type ToggleFavoriteResult =
  | { success: true; isFavorite: boolean }
  | { success: false; error: string };

export type TogglePinResult =
  | { success: true; isPinned: boolean }
  | { success: false; error: string };

// ─── Server actions ───────────────────────────────────────────

export async function toggleItemFavorite(
  itemId: string
): Promise<ToggleFavoriteResult> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  try {
    const newValue = await dbToggleItemFavorite(s.userId, itemId);
    if (newValue === null) return { success: false, error: "Item not found" };
    return { success: true, isFavorite: newValue };
  } catch {
    return { success: false, error: "Failed to toggle favorite" };
  }
}

export async function toggleItemPin(
  itemId: string
): Promise<TogglePinResult> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  try {
    const newValue = await dbToggleItemPin(s.userId, itemId);
    if (newValue === null) return { success: false, error: "Item not found" };
    return { success: true, isPinned: newValue };
  } catch {
    return { success: false, error: "Failed to toggle pin" };
  }
}

export async function createItem(
  input: CreateItemInput
): Promise<CreateItemResult> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  // Pro gate: file/image items require Pro
  if (input.fileUrl && !canUploadFiles(s.isPro)) {
    return { success: false, error: "File uploads require a Pro subscription" };
  }

  const limitError = await checkItemLimit(s.userId, s.isPro);
  if (limitError) return { success: false, error: limitError };

  const validation = validateCreateItem(input);
  if (!validation.ok) return { success: false, error: validation.error };

  const data = validation.data;

  try {
    const created = await dbCreateItem(s.userId, {
      itemTypeId: data.itemTypeId,
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url ?? null,
      language: data.language ?? null,
      tags: data.tags,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      contentType: data.fileUrl ? "file" : "text",
      collectionIds: data.collectionIds,
    });
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Failed to create item" };
  }
}

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  try {
    const fileKey = await getItemFileKey(s.userId, itemId);
    const deleted = await dbDeleteItem(s.userId, itemId);
    if (!deleted) return { success: false, error: "Item not found" };

    if (fileKey) {
      await deleteFromR2(fileKey).catch((err) =>
        console.error("R2 delete error (non-fatal):", err)
      );
    }

    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete item" };
  }
}

export async function updateItem(
  itemId: string,
  input: UpdateItemInput
): Promise<UpdateItemResult> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  const validation = validateUpdateItem(input);
  if (!validation.ok) return { success: false, error: validation.error };

  const data = validation.data;

  try {
    const updated = await dbUpdateItem(s.userId, itemId, {
      title: data.title,
      description: data.description ?? null,
      content: data.content ?? null,
      url: data.url ?? null,
      language: data.language ?? null,
      tags: data.tags,
      collectionIds: data.collectionIds,
    });

    if (!updated) return { success: false, error: "Item not found" };
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to update item" };
  }
}
