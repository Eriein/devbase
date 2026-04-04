"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  type EditorPreferences,
  DEFAULT_EDITOR_PREFERENCES,
} from "@/types/editor-preferences";
import { updateEditorPreferences } from "@/lib/actions/editor-preferences";

// ─── Context ──────────────────────────────────────────────────

interface EditorPreferencesContextValue {
  preferences: EditorPreferences;
  updatePreference: <K extends keyof EditorPreferences>(
    key: K,
    value: EditorPreferences[K]
  ) => void;
}

const EditorPreferencesContext = createContext<EditorPreferencesContextValue>({
  preferences: DEFAULT_EDITOR_PREFERENCES,
  updatePreference: () => {},
});

export function useEditorPreferences() {
  return useContext(EditorPreferencesContext);
}

// ─── Provider ─────────────────────────────────────────────────

interface EditorPreferencesProviderProps {
  initial: EditorPreferences;
  children: ReactNode;
}

export function EditorPreferencesProvider({
  initial,
  children,
}: EditorPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<EditorPreferences>(initial);

  const updatePreference = useCallback(
    <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => {
      const next = { ...preferences, [key]: value };
      setPreferences(next);

      updateEditorPreferences(next).then((result) => {
        if (result.error) {
          toast.error(result.error);
          // Revert on failure
          setPreferences(preferences);
        } else {
          toast.success("Editor preferences saved");
        }
      });
    },
    [preferences]
  );

  return (
    <EditorPreferencesContext.Provider value={{ preferences, updatePreference }}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}
