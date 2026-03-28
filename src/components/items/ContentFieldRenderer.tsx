"use client";

import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import { isCodeType, isMarkdownType } from "@/lib/item-type-helpers";

// ─── ContentBlock (view mode for plain text types) ────────────

function ContentBlock({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
      <div className="overflow-x-auto p-4">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="w-px select-none pr-4 text-right align-top font-mono text-xs text-muted-foreground/50">
                  {i + 1}
                </td>
                <td className="whitespace-pre-wrap break-words font-mono text-sm text-foreground">
                  {line || "\u00A0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

interface ContentFieldRendererProps {
  typeName: string;
  value: string;
  language?: string;
  /** When provided, renders in edit mode; when omitted, renders in view mode */
  onChange?: (val: string) => void;
  /** Only used in edit mode for plain-text types */
  rows?: number;
}

/**
 * Shared content field renderer used by ItemDrawer and CreateItemDialog.
 * Renders CodeEditor, MarkdownEditor, or Textarea/ContentBlock depending on type and mode.
 */
export function ContentFieldRenderer({
  typeName,
  value,
  language,
  onChange,
  rows = 8,
}: ContentFieldRendererProps) {
  const isEditMode = onChange !== undefined;

  if (isCodeType(typeName)) {
    return (
      <CodeEditor
        value={value}
        language={language}
        onChange={isEditMode ? onChange : undefined}
      />
    );
  }

  if (isMarkdownType(typeName)) {
    return (
      <MarkdownEditor
        value={value}
        onChange={isEditMode ? onChange : undefined}
      />
    );
  }

  if (isEditMode) {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Content"
        rows={rows}
      />
    );
  }

  return <ContentBlock content={value} />;
}
