"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateCollection } from "@/lib/actions/collections";
import { normalizeDescription } from "@/lib/collections-validation";

interface EditCollectionDialogProps {
  id: string;
  initialName: string;
  initialDescription: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Called after a successful save. Defaults to router.refresh(). */
  onSuccess?: () => void;
}

export function EditCollectionDialog({
  id,
  initialName,
  initialDescription,
  open,
  onOpenChange,
  onSuccess,
}: EditCollectionDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");

  function handleOpenChange(next: boolean) {
    if (next) {
      setName(initialName);
      setDescription(initialDescription ?? "");
    }
    onOpenChange(next);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateCollection(id, {
        name,
        description: normalizeDescription(description),
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Collection updated");
      onOpenChange(false);
      onSuccess ? onSuccess() : router.refresh();
    });
  }

  const canSave = name.trim().length > 0 && !isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-collection-name">Name</Label>
            <Input
              id="edit-collection-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canSave && handleSave()}
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-collection-description">
              Description{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="edit-collection-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
