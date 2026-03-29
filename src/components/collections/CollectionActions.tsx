"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Star } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { deleteCollection } from "@/lib/actions/collections";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";

interface CollectionActionsProps {
  id: string;
  name: string;
  description: string | null;
}

export function CollectionActions({ id, name, description }: CollectionActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteCollection(id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Collection deleted");
      router.push("/collections");
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast.info("Favorites coming soon")}
          aria-label="Favorite collection"
        >
          <Star className="size-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setEditOpen(true)} aria-label="Edit collection">
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeleteOpen(true)}
          aria-label="Delete collection"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <EditCollectionDialog
        id={id}
        initialName={name}
        initialDescription={description}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{name}&rdquo; will be removed. Items in this collection
              will not be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
