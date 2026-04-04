"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { iconMap } from "@/lib/item-type-helpers";
import { deleteCollection, toggleCollectionFavorite } from "@/lib/actions/collections";
import { EditCollectionDialog } from "@/components/collections/EditCollectionDialog";
import { useToggleFavorite } from "@/hooks/useToggleFavorite";
import type { CollectionWithTypes } from "@/lib/db/collections";

interface CollectionCardProps {
  collection: CollectionWithTypes;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(collection.isFavorite);
  const { toggle: toggleFavorite, isPending } = useToggleFavorite(toggleCollectionFavorite);

  function handleDelete() {
    toast.promise(deleteCollection(collection.id), {
      success: () => "Collection deleted",
      error: (err) => err,
    });
  }

  return (
    <>
      {/* Card */}
      <div
        className="group relative flex h-44 cursor-pointer flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:bg-card/80"
        style={{ borderLeftWidth: "3px", borderLeftColor: collection.dominantColor }}
        onClick={() => router.push(`/collections/${collection.id}`)}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground">{collection.name}</h3>
          <div className="flex items-center gap-1">
            {isFavorite && (
              <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
            )}
            {/* 3-dots menu */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="rounded p-0.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 focus-visible:opacity-100"
                onClick={(e) => e.stopPropagation()}
                aria-label="Collection options"
              >
                <MoreHorizontal className="size-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Pencil className="mr-2 size-3.5" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleFavorite(collection.id, isFavorite, setIsFavorite)}>
                  <Star
                    className={
                      isFavorite
                        ? "mr-2 size-3.5 fill-amber-400 text-amber-400"
                        : "mr-2 size-3.5"
                    }
                  />
                  {isFavorite ? "Unfavorite" : "Favorite"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="mr-2 size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {collection.description && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {collection.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-1.5">
            {collection.typeIcons.map((type) => {
              const Icon = iconMap[type.icon];
              return Icon ? (
                <div
                  key={type.id}
                  className="rounded p-1.5"
                  style={{ backgroundColor: type.color + "20" }}
                  title={type.name}
                >
                  <Icon className="size-3.5" style={{ color: type.color }} />
                </div>
              ) : null;
            })}
          </div>
          <span className="text-xs text-muted-foreground">
            {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      <EditCollectionDialog
        id={collection.id}
        initialName={collection.name}
        initialDescription={collection.description}
        open={editOpen}
        onOpenChange={setEditOpen}
      />

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete collection?</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{collection.name}&rdquo; will be removed. Items in this
              collection will not be deleted.
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
