import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Pin,
  Star,
} from "lucide-react";
import type { DashboardItem } from "@/lib/db/items";

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

function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function ItemCard({ item }: { item: DashboardItem }) {
  const { itemType } = item;
  const Icon = iconMap[itemType.icon];
  const previewContent = item.content ?? item.url ?? item.fileUrl ?? "";

  return (
    <div
      className="relative cursor-pointer overflow-hidden rounded-lg border border-border bg-card transition-colors hover:bg-card/80"
      style={{ borderLeftWidth: "3px", borderLeftColor: itemType.color }}
    >
      <div className="p-5">
        {/* Header */}
        <div className="mb-3 flex items-start gap-2">
          {Icon && (
            <Icon className="mt-0.5 size-4 shrink-0" style={{ color: itemType.color }} />
          )}
          <span className="line-clamp-1 flex-1 text-sm font-medium leading-tight text-foreground">
            {item.title}
          </span>
          {item.isPinned && <Pin className="size-3 shrink-0 text-muted-foreground" />}
          {item.isFavorite && (
            <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
          )}
        </div>

        {/* Content preview */}
        {previewContent && (
          <div className="mb-3 rounded bg-muted/50 px-2.5 py-2">
            <p className="line-clamp-3 break-all whitespace-pre-wrap font-mono text-xs text-muted-foreground">
              {previewContent}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 2).map((tag) => (
              <span
                key={tag.id}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag.name}
              </span>
            ))}
          </div>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {timeAgo(item.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
