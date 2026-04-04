export type EditorTheme = "vs-dark" | "monokai" | "github-dark";

export type EditorPreferences = {
  fontSize: number;
  tabSize: number;
  wordWrap: boolean;
  minimap: boolean;
  theme: EditorTheme;
};

export const DEFAULT_EDITOR_PREFERENCES: EditorPreferences = {
  fontSize: 13,
  tabSize: 2,
  wordWrap: true,
  minimap: false,
  theme: "vs-dark",
};

export const FONT_SIZE_OPTIONS = [11, 12, 13, 14, 16, 18] as const;
export const TAB_SIZE_OPTIONS = [2, 4] as const;
export const THEME_OPTIONS: { value: EditorTheme; label: string }[] = [
  { value: "vs-dark", label: "VS Dark" },
  { value: "monokai", label: "Monokai" },
  { value: "github-dark", label: "GitHub Dark" },
];
