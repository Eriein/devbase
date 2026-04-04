"use client";

import { useState } from "react";
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
import { deleteCollection, toggleCollectionFavorite } from "@/lib/actions/collections";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { useToggleFavorite } from "@/hooks/useToggleFavorite";

interface CollectionActionsProps {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
}

export function CollectionActions({ id, name, description, isFavorite: initialFavorite }: CollectionActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const { toggle: toggleFavorite, isPending } = useToggleFavorite(toggleCollectionFavorite);

  function handleDelete() {
    toast.promise(deleteCollection(id), {
      success: () => {
        return "Collection deleted";
      },
      error: (err) => err,
      finally: () => {
        window.location.href = "/collections";
      },
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleFavorite(id, isFavorite, setIsFavorite)}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Star
            className={
              isFavorite
                ? "size-4 fill-amber-400 text-amber-400"
                : "size-4"
            }
          />
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
