"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useEditorPreferences } from "@/components/editor/EditorPreferencesContext";
import {
  FONT_SIZE_OPTIONS,
  TAB_SIZE_OPTIONS,
  THEME_OPTIONS,
} from "@/types/editor-preferences";

// ─── Row Layout ───────────────────────────────────────────────

function PreferenceRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export function EditorPreferencesForm() {
  const { preferences, updatePreference } = useEditorPreferences();

  return (
    <div className="space-y-5">
      {/* Theme */}
      <PreferenceRow label="Theme" description="Color theme for the code editor">
        <Select
          value={preferences.theme}
          onValueChange={(val) =>
            updatePreference("theme", val as typeof preferences.theme)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEME_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PreferenceRow>

      {/* Font size */}
      <PreferenceRow label="Font Size" description="Editor font size in pixels">
        <Select
          value={String(preferences.fontSize)}
          onValueChange={(val) => updatePreference("fontSize", Number(val))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FONT_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PreferenceRow>

      {/* Tab size */}
      <PreferenceRow label="Tab Size" description="Number of spaces per tab">
        <Select
          value={String(preferences.tabSize)}
          onValueChange={(val) => updatePreference("tabSize", Number(val))}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TAB_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} spaces
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PreferenceRow>

      {/* Word wrap */}
      <PreferenceRow
        label="Word Wrap"
        description="Wrap long lines instead of horizontal scroll"
      >
        <Switch
          checked={preferences.wordWrap}
          onCheckedChange={(val) => updatePreference("wordWrap", val)}
        />
      </PreferenceRow>

      {/* Minimap */}
      <PreferenceRow
        label="Minimap"
        description="Show code overview minimap on the right"
      >
        <Switch
          checked={preferences.minimap}
          onCheckedChange={(val) => updatePreference("minimap", val)}
        />
      </PreferenceRow>
    </div>
  );
}
