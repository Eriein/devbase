"use client";

import type { DashboardItem } from "@/lib/db/items";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { iconMap } from "@/lib/item-type-helpers";

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function FavoriteItemRow({ item }: { item: DashboardItem }) {
  const { openDrawer } = useItemDrawer();
  const { itemType } = item;
  const Icon = iconMap[itemType.icon];

  return (
    <div
      className="group flex cursor-pointer items-center gap-3 border-b border-border/50 px-4 py-2 font-mono text-sm transition-colors last:border-b-0 hover:bg-muted/40"
      onClick={() => openDrawer(item.id)}
    >
      {Icon && (
        <Icon className="size-4 shrink-0" style={{ color: itemType.color }} />
      )}

      <span className="min-w-0 flex-1 truncate text-foreground">
        {item.title}
      </span>

      <span
        className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide"
        style={{
          backgroundColor: itemType.color + "20",
          color: itemType.color,
        }}
      >
        {itemType.name}
      </span>

      <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
        {formatDate(item.updatedAt)}
      </span>
    </div>
  );
}
