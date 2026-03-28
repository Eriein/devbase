"use client";

import { Pin, Star } from "lucide-react";
import type { DashboardItem } from "@/lib/db/items";
import { useItemDrawer } from "./ItemDrawerProvider";

export function ImageThumbnailCard({ item }: { item: DashboardItem }) {
  const { openDrawer } = useItemDrawer();

  return (
    <div
      className="group cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-card/80"
      onClick={() => openDrawer(item.id)}
    >
      {/* Thumbnail */}
      <div className="aspect-video overflow-hidden bg-muted">
        {item.fileUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/api/download/${item.fileUrl}?inline=1`}
            alt={item.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="size-full" />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="flex-1 truncate text-sm font-medium text-foreground">
          {item.title}
        </span>
        {item.isPinned && <Pin className="size-3 shrink-0 text-muted-foreground" />}
        {item.isFavorite && (
          <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
        )}
      </div>
    </div>
  );
}
