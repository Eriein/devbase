"use client";

import { Clock, FolderOpen } from "lucide-react";
import type { ItemDetail } from "@/lib/db/items";

function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

interface ItemMetadataSectionProps {
  item: ItemDetail;
}

export function ItemMetadataSection({ item }: ItemMetadataSectionProps) {
  return (
    <>
      {/* Collections */}
      {item.collections.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5">
            <FolderOpen className="size-3.5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Collections</h3>
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
          <h3 className="text-sm font-medium text-foreground">Details</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Created</span>
            <span className="text-foreground">{formatDate(item.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Updated</span>
            <span className="text-foreground">{formatDate(item.updatedAt)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
