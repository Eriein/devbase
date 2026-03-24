"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        theme="vs-dark"
        onChange={isReadonly ? undefined : (val) => onChange(val ?? "")}
        options={{
          readOnly: isReadonly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          lineNumbers: "on",
          lineNumbersMinChars: 3,
          folding: false,
          wordWrap: "on",
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
