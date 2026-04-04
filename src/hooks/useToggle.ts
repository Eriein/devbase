"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ToggleResult {
  success: boolean;
  error?: string;
}

type SetValueFn = (value: boolean) => void;
type SetValueCallback = (newValue: boolean) => void;

export function useToggle(
  serverAction: (id: string) => Promise<ToggleResult & { isPinned?: boolean; isFavorite?: boolean }>,
  successMessages: { true: string; false: string }
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
        toast.error(result.error ?? "Failed to toggle");
        return;
      }

      const newValue = result.isPinned ?? result.isFavorite ?? optimisticValue;
      toast.success(newValue ? successMessages.true : successMessages.false);
      router.refresh();
    });
  }

  return { toggle, isPending };
}
