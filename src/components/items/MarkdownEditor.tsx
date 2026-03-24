"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Tab button ───────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-[#1e1e1e] text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Props ────────────────────────────────────────────────────

interface MarkdownEditorProps {
  value: string;
  /** When provided the editor is editable; omit for readonly display */
  onChange?: (value: string) => void;
}

// ─── Component ────────────────────────────────────────────────

type Tab = "write" | "preview";

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const isReadonly = onChange === undefined;
  const [tab, setTab] = useState<Tab>("write");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const showPreview = isReadonly || tab === "preview";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-[#252526] px-3 py-2">
        <div className="flex items-center gap-0.5">
          {isReadonly ? (
            <span className="px-2.5 py-1 text-xs text-muted-foreground/70">
              Preview
            </span>
          ) : (
            <>
              <TabButton active={tab === "write"} onClick={() => setTab("write")}>
                Write
              </TabButton>
              <TabButton
                active={tab === "preview"}
                onClick={() => setTab("preview")}
              >
                Preview
              </TabButton>
            </>
          )}
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

      {/* Body */}
      {showPreview ? (
        <div
          className="markdown-preview editor-scrollbar overflow-y-auto px-4 py-3 text-sm"
          style={{ maxHeight: 400 }}
        >
          {value.trim() ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
          ) : (
            <p className="italic text-muted-foreground/50">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="Write markdown…"
          className="editor-scrollbar w-full resize-none bg-transparent px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          style={{ minHeight: 120, maxHeight: 400 }}
        />
      )}
    </div>
  );
}
