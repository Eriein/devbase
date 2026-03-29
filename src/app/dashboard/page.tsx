import {
  FolderOpen,
  Pin,
  Star,
  Clock,
  Package,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getRecentCollections, getCollectionStats } from "@/lib/db/collections";
import { getPinnedItems, getRecentItems, getItemStats } from "@/lib/db/items";
import { ItemCard } from "@/components/items/ItemCard";
import { CollectionCard } from "@/components/collections/CollectionCard";
import { StatsGrid } from "@/components/dashboard/StatsGrid";

// ─── Page ─────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const userId = session.user.id;

  const [recentCollections, collectionStats, pinnedItems, recentItems, itemStats] =
    await Promise.all([
      getRecentCollections(userId, 6),
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
      <StatsGrid stats={stats} />

      {/* Collections */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Collections</h2>
          <Link
            href="/collections"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recentCollections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <CollectionCard collection={collection} />
            </Link>
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

