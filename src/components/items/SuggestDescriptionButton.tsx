"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateAutoDescription } from "@/lib/actions/ai";

interface SuggestDescriptionButtonProps {
  title: string;
  content: string | null;
  url: string | null;
  language: string | null;
  fileName: string | null;
  itemTypeName: string;
  isPro: boolean;
  onGenerated: (description: string) => void;
}

export function SuggestDescriptionButton({
  title,
  content,
  url,
  language,
  fileName,
  itemTypeName,
  isPro,
  onGenerated,
}: SuggestDescriptionButtonProps) {
  const [isPending, startTransition] = useTransition();

  if (!isPro) return null;

  // Require at least one signal field before the button is clickable.
  const hasSignal =
    title.trim().length > 0 ||
    (content?.trim().length ?? 0) > 0 ||
    (url?.trim().length ?? 0) > 0 ||
    (fileName?.trim().length ?? 0) > 0;

  function handleSuggest() {
    startTransition(async () => {
      const result = await generateAutoDescription({
        title,
        content,
        url,
        language,
        fileName,
        itemTypeName,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      onGenerated(result.description);
      toast.success("Description generated");
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleSuggest}
      disabled={isPending || !hasSignal}
      className="h-7 gap-1.5 text-xs text-muted-foreground"
      title="Generate description with AI"
    >
      {isPending ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Sparkles className="size-3.5" />
      )}
      {isPending ? "Generating…" : "Suggest"}
    </Button>
  );
}
