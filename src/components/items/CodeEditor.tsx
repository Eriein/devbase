"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorPreferences } from "@/components/editor/EditorPreferencesContext";
import type { Monaco } from "@monaco-editor/react";

// Monaco cannot run server-side — load it only in the browser
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.default),
  { ssr: false }
);

// ─── Props ────────────────────────────────────────────────────

interface CodeEditorProps {
  value: string;
  language?: string;
  /** When provided the editor is editable; omit for readonly display */
  onChange?: (value: string) => void;
}

// ─── Custom themes ────────────────────────────────────────────

function registerCustomThemes(monaco: Monaco) {
  monaco.editor.defineTheme("monokai", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "75715e", fontStyle: "italic" },
      { token: "keyword", foreground: "f92672" },
      { token: "string", foreground: "e6db74" },
      { token: "number", foreground: "ae81ff" },
      { token: "type", foreground: "66d9ef" },
      { token: "function", foreground: "a6e22e" },
      { token: "variable", foreground: "f8f8f2" },
      { token: "operator", foreground: "f92672" },
    ],
    colors: {
      "editor.background": "#272822",
      "editor.foreground": "#f8f8f2",
      "editor.lineHighlightBackground": "#3e3d32",
      "editor.selectionBackground": "#49483e",
      "editorCursor.foreground": "#f8f8f0",
      "editorLineNumber.foreground": "#90908a",
      "editorIndentGuide.background1": "#3b3a32",
      "editor.findMatchBackground": "#ffe792",
    },
  });

  monaco.editor.defineTheme("github-dark", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "8b949e", fontStyle: "italic" },
      { token: "keyword", foreground: "ff7b72" },
      { token: "string", foreground: "a5d6ff" },
      { token: "number", foreground: "79c0ff" },
      { token: "type", foreground: "ffa657" },
      { token: "function", foreground: "d2a8ff" },
      { token: "variable", foreground: "c9d1d9" },
      { token: "operator", foreground: "ff7b72" },
    ],
    colors: {
      "editor.background": "#0d1117",
      "editor.foreground": "#c9d1d9",
      "editor.lineHighlightBackground": "#161b22",
      "editor.selectionBackground": "#264f78",
      "editorCursor.foreground": "#c9d1d9",
      "editorLineNumber.foreground": "#6e7681",
      "editorIndentGuide.background1": "#21262d",
      "editor.findMatchBackground": "#f2cc6080",
    },
  });
}

// ─── macOS dots ───────────────────────────────────────────────

function WindowDots() {
  return (
    <div className="flex items-center gap-1.5">
      <span className="size-3 rounded-full bg-[#ff5f57]" />
      <span className="size-3 rounded-full bg-[#ffbd2e]" />
      <span className="size-3 rounded-full bg-[#28c840]" />
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export function CodeEditor({ value, language, onChange }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);
  const { preferences } = useEditorPreferences();
  const isReadonly = onChange === undefined;
  const displayLang = language ?? "plaintext";

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate editor height: 1 line ≈ 19px + padding, clamp 80–400px
  const lineCount = value.split("\n").length;
  const editorHeight = Math.min(Math.max(lineCount * 19 + 16, 80), 400);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-[#252526] px-3 py-2">
        <div className="flex items-center gap-3">
          <WindowDots />
          <span className="font-mono text-xs text-muted-foreground/70">
            {displayLang}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          title={copied ? "Copied!" : "Copy"}
          onClick={handleCopy}
          className="h-6 w-6 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="size-3.5 text-green-400" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </Button>
      </div>

      {/* Editor */}
      <MonacoEditor
        height={editorHeight}
        language={displayLang}
        value={value}
        theme={preferences.theme}
        beforeMount={registerCustomThemes}
        onChange={isReadonly ? undefined : (val) => onChange(val ?? "")}
        options={{
          readOnly: isReadonly,
          minimap: { enabled: preferences.minimap },
          scrollBeyondLastLine: false,
          fontSize: preferences.fontSize,
          tabSize: preferences.tabSize,
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          folding: false,
          wordWrap: preferences.wordWrap ? "on" : "off",
          renderLineHighlight: isReadonly ? "none" : "line",
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
