import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  FolderOpen,
  Pin,
  Star,
  Clock,
  Package,
} from "lucide-react";
import { auth } from "@/auth";
import { getRecentCollections, getCollectionStats } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getItemStats, type DashboardItem } from "@/lib/db/items";

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

function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Page ─────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  const userId = session!.user!.id!;

  const [recentCollections, collectionStats, pinnedItems, recentItems, itemStats] =
    await Promise.all([
      getRecentCollections(userId),
      getCollectionStats(userId),
      getPinnedItems(userId),
      getRecentItems(userId),
      getItemStats(userId),
    ]);

  const stats = [
    { label: "Items", value: itemStats.totalItems, icon: Package, color: "#3b82f6" },
    { label: "Collections", value: collectionStats.totalCollections, icon: FolderOpen, color: "#8b5cf6" },
    { label: "Favorite Items", value: itemStats.favoriteItems, icon: Star, color: "#f59e0b" },
    { label: "Favorite Collections", value: collectionStats.favoriteCollections, icon: Star, color: "#ec4899" },
  ];

  return (
    <div className="space-y-10">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className="rounded-md p-1.5" style={{ backgroundColor: stat.color + "20" }}>
                <stat.icon className="size-4" style={{ color: stat.color }} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Collections */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Collections</h2>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all
          </button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recentCollections.map((collection) => (
            <div
              key={collection.id}
              className="flex h-44 cursor-pointer flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:bg-card/80"
              style={{ borderLeftWidth: "3px", borderLeftColor: collection.dominantColor }}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-foreground">{collection.name}</h3>
                {collection.isFavorite && (
                  <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
                )}
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
          ))}
        </div>
      </section>

      {/* Pinned Items — only shown if any exist */}
      {pinnedItems.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Pin className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Pinned</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pinnedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Items */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Recent Items</h2>
          </div>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all
          </button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recentItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Item Card ────────────────────────────────────────────────

function ItemCard({ item }: { item: DashboardItem }) {
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
