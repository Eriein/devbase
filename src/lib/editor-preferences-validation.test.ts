import { describe, it, expect } from "vitest";
import {
  validateEditorPreferences,
  mergeWithDefaults,
  parseStoredPreferences,
} from "./editor-preferences-validation";
import { DEFAULT_EDITOR_PREFERENCES } from "@/types/editor-preferences";

// ─── validateEditorPreferences ────────────────────────────────

describe("validateEditorPreferences", () => {
  it("accepts a fully valid preferences object", () => {
    const result = validateEditorPreferences({
      fontSize: 14,
      tabSize: 4,
      wordWrap: false,
      minimap: true,
      theme: "monokai",
    });
    expect(result).toEqual({
      fontSize: 14,
      tabSize: 4,
      wordWrap: false,
      minimap: true,
      theme: "monokai",
    });
  });

  it("accepts all valid theme values", () => {
    for (const theme of ["vs-dark", "monokai", "github-dark"]) {
      const result = validateEditorPreferences({
        ...DEFAULT_EDITOR_PREFERENCES,
        theme,
      });
      expect(result).not.toBeNull();
      expect(result?.theme).toBe(theme);
    }
  });

  it("accepts all valid font sizes", () => {
    for (const fontSize of [11, 12, 13, 14, 16, 18]) {
      const result = validateEditorPreferences({
        ...DEFAULT_EDITOR_PREFERENCES,
        fontSize,
      });
      expect(result?.fontSize).toBe(fontSize);
    }
  });

  it("accepts all valid tab sizes", () => {
    for (const tabSize of [2, 4]) {
      const result = validateEditorPreferences({
        ...DEFAULT_EDITOR_PREFERENCES,
        tabSize,
      });
      expect(result?.tabSize).toBe(tabSize);
    }
  });

  it("returns null for invalid font size", () => {
    expect(
      validateEditorPreferences({ ...DEFAULT_EDITOR_PREFERENCES, fontSize: 15 })
    ).toBeNull();
  });

  it("returns null for invalid tab size", () => {
    expect(
      validateEditorPreferences({ ...DEFAULT_EDITOR_PREFERENCES, tabSize: 3 })
    ).toBeNull();
  });

  it("returns null for invalid theme", () => {
    expect(
      validateEditorPreferences({ ...DEFAULT_EDITOR_PREFERENCES, theme: "dracula" })
    ).toBeNull();
  });

  it("returns null for non-boolean wordWrap", () => {
    expect(
      validateEditorPreferences({ ...DEFAULT_EDITOR_PREFERENCES, wordWrap: "on" })
    ).toBeNull();
  });

  it("returns null for non-boolean minimap", () => {
    expect(
      validateEditorPreferences({ ...DEFAULT_EDITOR_PREFERENCES, minimap: 0 })
    ).toBeNull();
  });

  it("returns null for null input", () => {
    expect(validateEditorPreferences(null)).toBeNull();
  });

  it("returns null for non-object input", () => {
    expect(validateEditorPreferences("string")).toBeNull();
    expect(validateEditorPreferences(42)).toBeNull();
  });

  it("returns null when a field is missing", () => {
    const { fontSize: _omit, ...withoutFontSize } = DEFAULT_EDITOR_PREFERENCES;
    expect(validateEditorPreferences(withoutFontSize)).toBeNull();
  });
});

// ─── mergeWithDefaults ────────────────────────────────────────

describe("mergeWithDefaults", () => {
  it("returns defaults when given an empty object", () => {
    expect(mergeWithDefaults({})).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("overrides only specified fields", () => {
    const result = mergeWithDefaults({ fontSize: 16, theme: "github-dark" });
    expect(result.fontSize).toBe(16);
    expect(result.theme).toBe("github-dark");
    expect(result.tabSize).toBe(DEFAULT_EDITOR_PREFERENCES.tabSize);
    expect(result.wordWrap).toBe(DEFAULT_EDITOR_PREFERENCES.wordWrap);
    expect(result.minimap).toBe(DEFAULT_EDITOR_PREFERENCES.minimap);
  });

  it("returns a full EditorPreferences object for any partial input", () => {
    const result = mergeWithDefaults({ minimap: true });
    expect(Object.keys(result)).toEqual(["fontSize", "tabSize", "wordWrap", "minimap", "theme"]);
  });
});

// ─── parseStoredPreferences ───────────────────────────────────

describe("parseStoredPreferences", () => {
  it("returns defaults for null input", () => {
    expect(parseStoredPreferences(null)).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("returns defaults for non-object input", () => {
    expect(parseStoredPreferences("corrupted")).toEqual(DEFAULT_EDITOR_PREFERENCES);
    expect(parseStoredPreferences(undefined)).toEqual(DEFAULT_EDITOR_PREFERENCES);
  });

  it("parses a fully valid stored object", () => {
    const stored = {
      fontSize: 16,
      tabSize: 4,
      wordWrap: false,
      minimap: true,
      theme: "github-dark",
    };
    expect(parseStoredPreferences(stored)).toEqual(stored);
  });

  it("falls back per-field for an invalid fontSize", () => {
    const result = parseStoredPreferences({
      ...DEFAULT_EDITOR_PREFERENCES,
      fontSize: 99,
    });
    expect(result.fontSize).toBe(DEFAULT_EDITOR_PREFERENCES.fontSize);
    expect(result.theme).toBe(DEFAULT_EDITOR_PREFERENCES.theme);
  });

  it("falls back per-field for an invalid tabSize", () => {
    const result = parseStoredPreferences({
      ...DEFAULT_EDITOR_PREFERENCES,
      tabSize: 8,
    });
    expect(result.tabSize).toBe(DEFAULT_EDITOR_PREFERENCES.tabSize);
  });

  it("falls back per-field for an invalid theme", () => {
    const result = parseStoredPreferences({
      ...DEFAULT_EDITOR_PREFERENCES,
      theme: "solarized",
    });
    expect(result.theme).toBe(DEFAULT_EDITOR_PREFERENCES.theme);
  });

  it("uses defaults for missing fields, keeps valid fields", () => {
    const result = parseStoredPreferences({ theme: "monokai" });
    expect(result.theme).toBe("monokai");
    expect(result.fontSize).toBe(DEFAULT_EDITOR_PREFERENCES.fontSize);
    expect(result.tabSize).toBe(DEFAULT_EDITOR_PREFERENCES.tabSize);
    expect(result.wordWrap).toBe(DEFAULT_EDITOR_PREFERENCES.wordWrap);
    expect(result.minimap).toBe(DEFAULT_EDITOR_PREFERENCES.minimap);
  });

  it("handles partially corrupt data — valid fields preserved, invalid fall back", () => {
    const result = parseStoredPreferences({
      fontSize: 14,
      tabSize: 999,   // invalid
      wordWrap: true,
      minimap: "yes", // invalid
      theme: "vs-dark",
    });
    expect(result.fontSize).toBe(14);
    expect(result.tabSize).toBe(DEFAULT_EDITOR_PREFERENCES.tabSize);
    expect(result.wordWrap).toBe(true);
    expect(result.minimap).toBe(DEFAULT_EDITOR_PREFERENCES.minimap);
    expect(result.theme).toBe("vs-dark");
  });
});
