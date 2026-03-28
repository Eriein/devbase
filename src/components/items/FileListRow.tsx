"use client";

import { Download, File, FileText, FileImage, FileCode, FileArchive } from "lucide-react";
import type { DashboardItem } from "@/lib/db/items";
import { useItemDrawer } from "./ItemDrawerProvider";
import { formatFileSize } from "@/lib/utils";

function fileIcon(fileName: string | null) {
  const ext = fileName?.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return FileImage;
  if (["ts", "tsx", "js", "jsx", "py", "go", "rs", "json", "yaml", "yml"].includes(ext)) return FileCode;
  if (["zip", "tar", "gz", "rar", "7z"].includes(ext)) return FileArchive;
  if (["md", "txt", "pdf", "doc", "docx"].includes(ext)) return FileText;
  return File;
}


function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function FileListRow({ item }: { item: DashboardItem }) {
  const { openDrawer } = useItemDrawer();
  const Icon = fileIcon(item.fileName);

  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (!item.fileUrl) return;
    const a = document.createElement("a");
    a.href = `/api/download/${item.fileUrl}`;
    a.download = item.fileName ?? "download";
    a.click();
  }

  return (
    <div
      className="group flex cursor-pointer items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
      onClick={() => openDrawer(item.id)}
    >
      {/* File icon */}
      <Icon className="size-5 shrink-0 text-muted-foreground" />

      {/* Name + meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
        {item.fileName && (
          <p className="truncate text-xs text-muted-foreground">{item.fileName}</p>
        )}
      </div>

      {/* Size + date — hidden on mobile, stacked on sm */}
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-muted-foreground">{formatFileSize(item.fileSize)}</p>
        <p className="text-xs text-muted-foreground">{formatDate(item.updatedAt)}</p>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        disabled={!item.fileUrl}
        className="shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        aria-label="Download file"
      >
        <Download className="size-4" />
      </button>
    </div>
  );
}
