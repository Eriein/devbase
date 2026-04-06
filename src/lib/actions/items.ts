"use server";

import { auth } from "@/auth";
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
import { isAtItemLimit, canUploadFiles, itemLimitMessage } from "@/lib/usage-limits";
import { FREE_ITEMS_LIMIT } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

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
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const newValue = await dbToggleItemFavorite(session.user.id, itemId);
    if (newValue === null) return { success: false, error: "Item not found" };
    return { success: true, isFavorite: newValue };
  } catch {
    return { success: false, error: "Failed to toggle favorite" };
  }
}

export async function toggleItemPin(
  itemId: string
): Promise<TogglePinResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const newValue = await dbToggleItemPin(session.user.id, itemId);
    if (newValue === null) return { success: false, error: "Item not found" };
    return { success: true, isPinned: newValue };
  } catch {
    return { success: false, error: "Failed to toggle pin" };
  }
}

export async function createItem(
  input: CreateItemInput
): Promise<CreateItemResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  // Pro gate: file/image items require Pro
  if (input.fileUrl && !canUploadFiles(session.user.isPro)) {
    return { success: false, error: "File uploads require a Pro subscription" };
  }

  // Free tier item count limit
  if (!session.user.isPro) {
    const count = await prisma.item.count({ where: { userId: session.user.id } });
    if (isAtItemLimit(false, count)) {
      return { success: false, error: itemLimitMessage(FREE_ITEMS_LIMIT) };
    }
  }

  const validation = validateCreateItem(input);
  if (!validation.ok) return { success: false, error: validation.error };

  const data = validation.data;

  try {
    const created = await dbCreateItem(session.user.id, {
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
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const fileKey = await getItemFileKey(session.user.id, itemId);
    const deleted = await dbDeleteItem(session.user.id, itemId);
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
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const validation = validateUpdateItem(input);
  if (!validation.ok) return { success: false, error: validation.error };

  const data = validation.data;

  try {
    const updated = await dbUpdateItem(session.user.id, itemId, {
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
