"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { type EditorPreferences } from "@/types/editor-preferences";
import {
  validateEditorPreferences,
  mergeWithDefaults,
} from "@/lib/editor-preferences-validation";

// ─── Server Action ───────────────────────────────────────────

export type UpdateEditorPreferencesState = {
  error?: string;
  success?: boolean;
};

export async function updateEditorPreferences(
  preferences: Partial<EditorPreferences>
): Promise<UpdateEditorPreferencesState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not authenticated" };

  const merged = mergeWithDefaults(preferences);
  const validated = validateEditorPreferences(merged);
  if (!validated) return { error: "Invalid preferences" };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { editorPreferences: validated },
  });

  return { success: true };
}
