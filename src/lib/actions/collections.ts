"use server";

import { auth } from "@/auth";
import { createCollection as dbCreateCollection } from "@/lib/db/collections";
import { validateCreateCollection } from "@/lib/collections-validation";
import type { CreateCollectionInput } from "@/lib/collections-validation";

// ─── Types ────────────────────────────────────────────────────

export type CreateCollectionResult =
  | { success: true; data: { id: string; name: string; description: string | null } }
  | { success: false; error: string };

// ─── Server actions ───────────────────────────────────────────

export async function createCollection(
  input: CreateCollectionInput
): Promise<CreateCollectionResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const validation = validateCreateCollection(input);
  if (!validation.ok) return { success: false, error: validation.error };

  try {
    const created = await dbCreateCollection(session.user.id, validation.data);
    return { success: true, data: created };
  } catch {
    return { success: false, error: "Failed to create collection" };
  }
}
