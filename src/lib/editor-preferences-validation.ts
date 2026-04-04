import {
  type EditorPreferences,
  type EditorTheme,
  DEFAULT_EDITOR_PREFERENCES,
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
} from "@/types/editor-preferences";

// ─── Pure Validation ─────────────────────────────────────────

export function validateEditorPreferences(
  data: unknown
): EditorPreferences | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;

  const fontSize =
    typeof d.fontSize === "number" && [11, 12, 13, 14, 16, 18].includes(d.fontSize)
      ? d.fontSize
      : null;
  const tabSize =
    typeof d.tabSize === "number" && [2, 4].includes(d.tabSize)
      ? d.tabSize
      : null;
  const wordWrap = typeof d.wordWrap === "boolean" ? d.wordWrap : null;
  const minimap = typeof d.minimap === "boolean" ? d.minimap : null;
  const theme =
    d.theme === "vs-dark" || d.theme === "monokai" || d.theme === "github-dark"
      ? (d.theme as EditorTheme)
      : null;

  if (
    fontSize === null ||
    tabSize === null ||
    wordWrap === null ||
    minimap === null ||
    theme === null
  ) {
    return null;
  }

  return { fontSize, tabSize, wordWrap, minimap, theme };
}

export function mergeWithDefaults(
  partial: Partial<EditorPreferences>
): EditorPreferences {
  return { ...DEFAULT_EDITOR_PREFERENCES, ...partial };
}

/**
 * Leniently parses a raw JSON value from the DB into EditorPreferences,
 * falling back to defaults for any missing or invalid field.
 */
export function parseStoredPreferences(raw: unknown): EditorPreferences {
  if (!raw || typeof raw !== "object") return DEFAULT_EDITOR_PREFERENCES;
  const d = raw as Record<string, unknown>;
  return {
    fontSize:
      typeof d.fontSize === "number" &&
      (FONT_SIZE_OPTIONS as readonly number[]).includes(d.fontSize)
        ? d.fontSize
        : DEFAULT_EDITOR_PREFERENCES.fontSize,
    tabSize:
      typeof d.tabSize === "number" &&
      (TAB_SIZE_OPTIONS as readonly number[]).includes(d.tabSize)
        ? d.tabSize
        : DEFAULT_EDITOR_PREFERENCES.tabSize,
    wordWrap:
      typeof d.wordWrap === "boolean"
        ? d.wordWrap
        : DEFAULT_EDITOR_PREFERENCES.wordWrap,
    minimap:
      typeof d.minimap === "boolean"
        ? d.minimap
        : DEFAULT_EDITOR_PREFERENCES.minimap,
    theme:
      d.theme === "vs-dark" ||
      d.theme === "monokai" ||
      d.theme === "github-dark"
        ? (d.theme as EditorTheme)
        : DEFAULT_EDITOR_PREFERENCES.theme,
  };
}
