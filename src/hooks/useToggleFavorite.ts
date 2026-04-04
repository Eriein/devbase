"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ToggleResult {
  success: boolean;
  isFavorite?: boolean;
  error?: string;
}

type SetValueFn = (value: boolean) => void;
type SetValueCallback = (newValue: boolean) => void;

export function useToggleFavorite(
  serverAction: (id: string) => Promise<ToggleResult>
) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function toggle(
    id: string,
    currentValue: boolean,
    setValueOrCallback: SetValueFn | SetValueCallback
  ) {
    const optimisticValue = !currentValue;
    setValueOrCallback(optimisticValue);

    startTransition(async () => {
      const result = await serverAction(id);

      if (!result.success) {
        setValueOrCallback(currentValue);
        toast.error(result.error ?? "Failed to toggle favorite");
        return;
      }

      toast.success(
        result.isFavorite ? "Added to favorites" : "Removed from favorites"
      );
      router.refresh();
    });
  }

  return { toggle, isPending };
}
