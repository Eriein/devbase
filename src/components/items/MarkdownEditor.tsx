"use client";

import { useState, useTransition } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Sparkles, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { optimizePrompt } from "@/lib/actions/ai";

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
  /**
   * When true (drawer read view only), renders the AI Optimize button.
   * Must be combined with itemTypeName so the server action knows what
   * kind of item it's optimizing.
   */
  showOptimizeButton?: boolean;
  /** Pro subscription status — gates the Optimize button */
  isPro?: boolean;
  /** Item title, forwarded to the optimizePrompt server action */
  title?: string;
  /** Item type name (prompt) — required when showOptimizeButton is true */
  itemTypeName?: string;
  /** Item ID — required when showOptimizeButton is true */
  itemId?: string;
  /**
   * Callback when user accepts the optimized prompt. Called with the
   * optimized content that should be persisted (e.g., via updateItem).
   */
  onAcceptOptimized?: (optimizedContent: string) => void;
}

// ─── Component ────────────────────────────────────────────────

type Tab = "write" | "preview";
type CompareMode = "none" | "original" | "optimized";

export function MarkdownEditor({
  value,
  onChange,
  showOptimizeButton = false,
  isPro = false,
  title,
  itemTypeName,
  itemId,
  onAcceptOptimized,
}: MarkdownEditorProps) {
  const isReadonly = onChange === undefined;
  const [tab, setTab] = useState<Tab>("write");
  const [copied, setCopied] = useState(false);
  const [compareMode, setCompareMode] = useState<CompareMode>("none");
  const [optimizedPrompt, setOptimizedPrompt] = useState<string | null>(null);
  const [isOptimizing, startOptimizeTransition] = useTransition();

  const canShowOptimize = showOptimizeButton && !!itemTypeName && !!itemId;

  const handleCopy = () => {
    const textToCopy =
      compareMode === "optimized" && optimizedPrompt
        ? optimizedPrompt
        : value;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptimize = () => {
    if (!canShowOptimize || !itemTypeName || !itemId) return;
    startOptimizeTransition(async () => {
      const result = await optimizePrompt({
        title: title ?? null,
        content: value,
        itemTypeName,
        itemId,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setOptimizedPrompt(result.optimizedPrompt);
      setCompareMode("optimized");
      toast.success("Prompt optimized");
    });
  };

  const handleAccept = () => {
    if (!optimizedPrompt || !onAcceptOptimized) return;
    onAcceptOptimized(optimizedPrompt);
    setCompareMode("none");
    setOptimizedPrompt(null);
    toast.success("Prompt saved");
  };

  const handleReject = () => {
    setCompareMode("none");
    setOptimizedPrompt(null);
  };

  const showPreview = isReadonly || tab === "preview";

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#1e1e1e]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-[#252526] px-3 py-2">
        <div className="flex items-center gap-0.5">
          {compareMode !== "none" ? (
            <div className="flex items-center gap-0.5">
              <TabButton
                active={compareMode === "original"}
                onClick={() => setCompareMode("original")}
              >
                Original
              </TabButton>
              <TabButton
                active={compareMode === "optimized"}
                onClick={() => setCompareMode("optimized")}
              >
                Optimized
              </TabButton>
            </div>
          ) : isReadonly ? (
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
        <div className="flex items-center gap-0.5">
          {canShowOptimize &&
            (isPro ? (
              <Button
                variant="ghost"
                size="icon-sm"
                title={
                  optimizedPrompt
                    ? "Regenerate optimization"
                    : "Optimize with AI"
                }
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="h-6 w-6 text-muted-foreground hover:text-foreground"
              >
                {isOptimizing ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon-sm"
                title="AI features require Pro subscription"
                disabled
                className="h-6 w-6 text-muted-foreground/60"
              >
                <Crown className="size-3.5" />
              </Button>
            ))}
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
      </div>

      {/* Body */}
      {compareMode !== "none" ? (
        <div className="flex flex-col">
          <div
            className="markdown-preview editor-scrollbar overflow-y-auto px-4 py-3 text-sm"
            style={{ maxHeight: 320 }}
          >
            {compareMode === "original" ? (
              value.trim() ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {value}
                </ReactMarkdown>
              ) : (
                <p className="italic text-muted-foreground/50">Nothing to preview</p>
              )
            ) : optimizedPrompt ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {optimizedPrompt}
              </ReactMarkdown>
            ) : (
              <p className="italic text-muted-foreground/50">No optimization yet</p>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 border-t border-border/60 bg-[#252526] px-3 py-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReject}
              className="h-8"
            >
              Reject
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleAccept}
              disabled={!optimizedPrompt || !onAcceptOptimized}
              className="h-8"
            >
              Accept
            </Button>
          </div>
        </div>
      ) : showPreview ? (
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
