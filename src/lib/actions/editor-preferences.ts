"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/actions/guards";
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
  const s = await requireSession();
  if (!s.ok) return { error: s.error };

  const merged = mergeWithDefaults(preferences);
  const validated = validateEditorPreferences(merged);
  if (!validated) return { error: "Invalid preferences" };

  await prisma.user.update({
    where: { id: s.userId },
    data: { editorPreferences: validated },
  });

  return { success: true };
}
