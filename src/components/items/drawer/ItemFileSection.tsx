"use client";

import { Download, File } from "lucide-react";
import { formatFileSize } from "@/lib/utils";
import type { ItemDetail } from "@/lib/db/items";

interface ItemFileSectionProps {
  item: ItemDetail;
}

export function ItemFileSection({ item }: ItemFileSectionProps) {
  if (!item.fileUrl) return null;

  const typeName = item.itemType.name.toLowerCase();

  if (typeName === "image") {
    return (
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Image</h3>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/download/${item.fileUrl}?inline=1`}
          alt={item.fileName ?? item.title}
          className="max-h-72 w-full rounded-lg border border-border object-contain"
        />
        {item.fileName && (
          <div className="mt-2 flex items-center justify-between">
            <span className="truncate text-xs text-muted-foreground">
              {item.fileName}
              {item.fileSize && ` · ${formatFileSize(item.fileSize)}`}
            </span>
            <a
              href={`/api/download/${item.fileUrl}`}
              download={item.fileName}
              className="ml-2 flex shrink-0 items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Download className="size-3" />
              Download
            </a>
          </div>
        )}
      </div>
    );
  }

  if (typeName === "file") {
    return (
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">File</h3>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-4">
          <File className="size-4 shrink-0 text-muted-foreground" />
          <span className="min-w-0 flex-1 truncate text-sm text-foreground">
            {item.fileName ?? "file"}
          </span>
          {item.fileSize && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatFileSize(item.fileSize)}
            </span>
          )}
          <a
            href={`/api/download/${item.fileUrl}`}
            download={item.fileName ?? "download"}
            className="flex shrink-0 items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Download className="size-3" />
            Download
          </a>
        </div>
      </div>
    );
  }

  return null;
}
