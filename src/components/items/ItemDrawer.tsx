"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Check,
  Save,
  X,
} from "lucide-react";
import { iconMap } from "@/lib/item-type-helpers";
import type { ItemDetail } from "@/lib/db/items";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useItemDrawerActions } from "./drawer/useItemDrawerActions";
import { ItemContentSection } from "./drawer/ItemContentSection";
import { ItemFileSection } from "./drawer/ItemFileSection";
import { ItemTagsSection } from "./drawer/ItemTagsSection";
import { ItemMetadataSection } from "./drawer/ItemMetadataSection";
import { ItemDrawerEditForm } from "./drawer/ItemDrawerEditForm";

// ─── Skeleton ─────────────────────────────────────────────────

function DrawerSkeleton() {
  return (
    <div className="animate-pulse p-6 pt-8">
      <div className="mb-4 flex items-start gap-4">
        <div className="size-10 rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-3/4 rounded bg-muted" />
          <div className="h-5 w-20 rounded-full bg-muted" />
        </div>
      </div>
      <div className="mb-6 flex gap-4">
        <div className="h-5 w-16 rounded bg-muted" />
        <div className="h-5 w-12 rounded bg-muted" />
        <div className="h-5 w-14 rounded bg-muted" />
        <div className="h-5 w-12 rounded bg-muted" />
      </div>
      <div className="mb-4 h-px bg-border" />
      <div className="mb-2 h-4 w-24 rounded bg-muted" />
      <div className="mb-1 h-4 w-full rounded bg-muted" />
      <div className="mb-6 h-4 w-2/3 rounded bg-muted" />
      <div className="mb-2 h-4 w-16 rounded bg-muted" />
      <div className="h-16 rounded bg-muted" />
    </div>
  );
}

// ─── Drawer ───────────────────────────────────────────────────

interface ItemDrawerProps {
  itemId: string | null;
  open: boolean;
  onClose: () => void;
}

export function ItemDrawer({ itemId, open, onClose }: ItemDrawerProps) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    copied,
    isEditing,
    editState,
    isPending,
    setEditState,
    handleCopy,
    handleToggleFavorite,
    handleTogglePin,
    handleEditStart,
    handleEditCancel,
    handleDelete,
    handleSave,
    patch,
    resetEditState,
  } = useItemDrawerActions(item, setItem, onClose);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      resetEditState();
      return;
    }

    setLoading(true);
    resetEditState();
    fetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setItem(data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  const TypeIcon = item ? iconMap[item.itemType.icon] : null;
  const accentColor = item?.itemType.color ?? undefined;

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto p-0 data-[side=right]:sm:max-w-xl"
      >
        {loading || !item ? (
          <>
            <SheetHeader className="sr-only">
              <SheetTitle>Loading...</SheetTitle>
              <SheetDescription>Item details are loading</SheetDescription>
            </SheetHeader>
            <DrawerSkeleton />
          </>
        ) : (
          <>
            <SheetHeader className="sr-only">
              <SheetTitle>{item.title}</SheetTitle>
              <SheetDescription>Details for {item.title}</SheetDescription>
            </SheetHeader>

            <div className="flex h-full flex-col">
              {/* ── Title + type badge ── */}
              <div className="flex items-start gap-4 px-6 pt-6 pb-4">
                {TypeIcon && (
                  <div
                    className="flex size-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: accentColor + "20" }}
                  >
                    <TypeIcon className="size-5" style={{ color: accentColor }} />
                  </div>
                )}
                <div className="min-w-0 flex-1 pr-6">
                  {isEditing && editState ? (
                    <Input
                      value={editState.title}
                      onChange={patch("title")}
                      className="mb-1.5 h-8 text-base font-semibold"
                      placeholder="Title"
                      autoFocus
                    />
                  ) : (
                    <h2 className="text-lg font-semibold leading-tight text-foreground">
                      {item.title}
                    </h2>
                  )}
                  <span
                    className="mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: accentColor + "20",
                      color: accentColor,
                    }}
                  >
                    {item.itemType.name}
                  </span>
                </div>
              </div>

              {/* ── Action bar ── */}
              {isEditing ? (
                <div className="flex items-center gap-2 px-6 pb-4">
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isPending || !editState?.title.trim()}
                    className="gap-1.5"
                  >
                    <Save className="size-4" />
                    {isPending ? "Saving…" : "Save"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEditCancel}
                    disabled={isPending}
                    className="gap-1.5 text-muted-foreground"
                  >
                    <X className="size-4" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-6 pb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Favorite"
                    onClick={handleToggleFavorite}
                    className="gap-1.5 text-muted-foreground"
                  >
                    <Star
                      className={
                        item.isFavorite
                          ? "size-4 fill-amber-400 text-amber-400"
                          : "size-4"
                      }
                    />
                    <span className="text-xs">Favorite</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Pin"
                    onClick={handleTogglePin}
                    className="gap-1.5 text-muted-foreground"
                  >
                    <Pin
                      className={
                        item.isPinned ? "size-4 text-foreground" : "size-4"
                      }
                    />
                    <span className="text-xs">Pin</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title={copied ? "Copied!" : "Copy content"}
                    onClick={handleCopy}
                    className="gap-1.5 text-muted-foreground"
                  >
                    {copied ? (
                      <Check className="size-4 text-green-400" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                    <span className="text-xs">{copied ? "Copied!" : "Copy"}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    title="Edit"
                    onClick={handleEditStart}
                    className="gap-1.5 text-muted-foreground"
                  >
                    <Pencil className="size-4" />
                    <span className="text-xs">Edit</span>
                  </Button>
                  <div className="flex-1" />
                  <AlertDialog>
                    <AlertDialogTrigger
                      render={
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Delete"
                          className="text-muted-foreground hover:text-destructive"
                          disabled={isPending}
                        />
                      }
                    >
                      <Trash2 className="size-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete item?</AlertDialogTitle>
                        <AlertDialogDescription>
                          <strong className="text-foreground">{item.title}</strong>{" "}
                          will be permanently deleted. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}

              {/* ── Divider ── */}
              <div className="mx-6 border-t border-border" />

              {/* ── Body sections ── */}
              <div className="flex-1 space-y-6 px-6 pt-6 pb-6">
                {isEditing && editState ? (
                  <ItemDrawerEditForm
                    item={item}
                    editState={editState}
                    patch={patch}
                    onContentChange={(val) =>
                      setEditState((prev) => prev && { ...prev, content: val })
                    }
                    onCollectionIdsChange={(ids) =>
                      setEditState((prev) => prev && { ...prev, collectionIds: ids })
                    }
                  />
                ) : (
                  <>
                    {/* Description — view mode */}
                    {item.description && (
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-foreground">
                          Description
                        </h3>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    )}

                    {/* Content — view mode */}
                    <ItemContentSection
                      item={item}
                      isEditing={false}
                      editState={null}
                      onContentChange={() => {}}
                    />

                    {/* URL — view mode */}
                    {item.url && (
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-foreground">
                          Link
                        </h3>
                        <div className="rounded-lg border border-border bg-muted/30 p-4">
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-sm text-blue-400 underline underline-offset-2 hover:text-blue-300"
                          >
                            {item.url}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Image / File — view mode */}
                    <ItemFileSection item={item} />
                  </>
                )}

                {/* Tags — both modes */}
                <ItemTagsSection
                  item={item}
                  isEditing={isEditing}
                  editState={editState}
                  onPatch={
                    patch("tagsRaw") as (
                      e: React.ChangeEvent<HTMLInputElement>
                    ) => void
                  }
                />

                {/* Collections + Details — view mode only */}
                {!isEditing && <ItemMetadataSection item={item} />}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
