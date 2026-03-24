"use server";

import { auth } from "@/auth";
import { updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from "@/lib/db/items";
import { validateUpdateItem } from "@/lib/items-validation";
import type { UpdateItemInput } from "@/lib/items-validation";
import type { ItemDetail } from "@/lib/db/items";

export type UpdateItemResult =
  | { success: true; data: ItemDetail }
  | { success: false; error: string };

export type DeleteItemResult =
  | { success: true }
  | { success: false; error: string };

// ─── Server actions ───────────────────────────────────────────

export async function deleteItem(itemId: string): Promise<DeleteItemResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  try {
    const deleted = await dbDeleteItem(session.user.id, itemId);
    if (!deleted) return { success: false, error: "Item not found" };
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
    });

    if (!updated) return { success: false, error: "Item not found" };
    return { success: true, data: updated };
  } catch {
    return { success: false, error: "Failed to update item" };
  }
}
