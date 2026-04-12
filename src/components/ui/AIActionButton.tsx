"use client";

import { Sparkles, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIActionButtonProps {
  isPro: boolean;
  isPending: boolean;
  onClick: () => void;
  title: string;
}

export function AIActionButton({
  isPro,
  isPending,
  onClick,
  title,
}: AIActionButtonProps) {
  return isPro ? (
    <Button
      variant="ghost"
      size="icon-sm"
      title={title}
      onClick={onClick}
      disabled={isPending}
      className="h-6 w-6 text-muted-foreground hover:text-foreground"
    >
      {isPending ? (
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
  );
}