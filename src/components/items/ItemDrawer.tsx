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
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  Check,
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  FolderOpen,
  Clock,
} from "lucide-react";
import type { ItemDetail } from "@/lib/db/items";

// ─── Icon map ─────────────────────────────────────────────────

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

// ─── Helpers ──────────────────────────────────────────────────

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

// ─── Content with line numbers ────────────────────────────────

function ContentBlock({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-muted/30">
      <div className="overflow-x-auto p-4">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i}>
                <td className="select-none pr-4 text-right align-top font-mono text-xs text-muted-foreground/50">
                  {i + 1}
                </td>
                <td className="whitespace-pre-wrap break-words font-mono text-sm text-foreground">
                  {line || "\u00A0"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!itemId) {
      setItem(null);
      return;
    }

    setLoading(true);
    fetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => setItem(data))
      .catch(() => setItem(null))
      .finally(() => setLoading(false));
  }, [itemId]);

  const handleCopy = () => {
    const text = item?.content ?? item?.url ?? "";
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                    <TypeIcon
                      className="size-5"
                      style={{ color: accentColor }}
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1 pr-6">
                  <h2 className="text-lg font-semibold leading-tight text-foreground">
                    {item.title}
                  </h2>
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

              {/* ── Action bar (text labels) ── */}
              <div className="flex items-center gap-1 px-6 pb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  title="Favorite"
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
                  className="gap-1.5 text-muted-foreground"
                >
                  <Pin
                    className={
                      item.isPinned
                        ? "size-4 text-foreground"
                        : "size-4"
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
                  <span className="text-xs">
                    {copied ? "Copied!" : "Copy"}
                  </span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  title="Edit"
                  className="gap-1.5 text-muted-foreground"
                >
                  <Pencil className="size-4" />
                  <span className="text-xs">Edit</span>
                </Button>
                <div className="flex-1" />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  title="Delete"
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              {/* ── Divider ── */}
              <div className="mx-6 border-t border-border" />

              {/* ── Body sections ── */}
              <div className="flex-1 space-y-6 px-6 pt-6 pb-6">
                {/* Description */}
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

                {/* Content */}
                {item.content && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-foreground">
                      Content
                    </h3>
                    <ContentBlock content={item.content} />
                  </div>
                )}

                {/* URL */}
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

                {/* File info */}
                {item.fileName && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-foreground">
                      File
                    </h3>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-4">
                      <File className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate text-sm text-foreground">
                        {item.fileName}
                      </span>
                      {item.fileSize && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          ({formatFileSize(item.fileSize)})
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium text-foreground">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Collections */}
                {item.collections.length > 0 && (
                  <div>
                    <div className="mb-2 flex items-center gap-1.5">
                      <FolderOpen className="size-3.5 text-muted-foreground" />
                      <h3 className="text-sm font-medium text-foreground">
                        Collections
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.collections.map((col) => (
                        <span
                          key={col.id}
                          className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                        >
                          {col.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details */}
                <div>
                  <div className="mb-3 flex items-center gap-1.5">
                    <Clock className="size-3.5 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-foreground">
                      Details
                    </h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-foreground">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Updated</span>
                      <span className="text-foreground">
                        {formatDate(item.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
