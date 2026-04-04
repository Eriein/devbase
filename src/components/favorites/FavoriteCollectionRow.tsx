"use client";

import Link from "next/link";
import { Folder } from "lucide-react";
import type { CollectionWithTypes } from "@/lib/db/collections";

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function FavoriteCollectionRow({ collection }: { collection: CollectionWithTypes }) {
  return (
    <Link
      href={`/collections/${collection.id}`}
      className="group flex items-center gap-3 border-b border-border/50 px-4 py-2 font-mono text-sm transition-colors last:border-b-0 hover:bg-muted/40"
    >
      <Folder className="size-4 shrink-0 text-muted-foreground" />

      <span className="min-w-0 flex-1 truncate text-foreground">
        {collection.name}
      </span>

      <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-muted text-muted-foreground">
        {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
      </span>

      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {formatDate(collection.updatedAt)}
      </span>
    </Link>
  );
}
