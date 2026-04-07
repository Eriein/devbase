"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateAutoTags } from "@/lib/actions/ai";

interface SuggestTagsButtonProps {
  title: string;
  content: string | null;
  description: string | null;
  isPro: boolean;
  existingTags: string[];
  onAcceptTag: (tag: string) => void;
}

export function SuggestTagsButton({
  title,
  content,
  description,
  isPro,
  existingTags,
  onAcceptTag,
}: SuggestTagsButtonProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  if (!isPro) return null;

  function handleSuggest() {
    startTransition(async () => {
      const result = await generateAutoTags({ title, content, description });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      // Filter out tags that already exist
      const existingLower = new Set(existingTags.map((t) => t.toLowerCase()));
      const newSuggestions = result.tags.filter(
        (tag) => !existingLower.has(tag)
      );

      if (newSuggestions.length === 0) {
        toast.info("All suggested tags are already added");
        return;
      }

      setSuggestions(newSuggestions);
    });
  }

  function handleAccept(tag: string) {
    onAcceptTag(tag);
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  function handleReject(tag: string) {
    setSuggestions((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleSuggest}
        disabled={isPending || !title.trim()}
        className="h-7 gap-1.5 text-xs text-muted-foreground"
      >
        {isPending ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Sparkles className="size-3.5" />
        )}
        {isPending ? "Suggesting…" : "Suggest Tags"}
      </Button>

      {suggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {suggestions.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleAccept(tag)}
                className="rounded-full p-0.5 hover:bg-green-500/20 hover:text-green-400"
                title="Accept"
              >
                <Check className="size-3" />
              </button>
              <button
                type="button"
                onClick={() => handleReject(tag)}
                className="rounded-full p-0.5 hover:bg-red-500/20 hover:text-red-400"
                title="Reject"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
