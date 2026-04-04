import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { FavoriteItemRow } from "@/components/favorites/FavoriteItemRow";
import { FavoriteCollectionRow } from "@/components/favorites/FavoriteCollectionRow";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const userId = session.user.id;

  const [items, collections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
  ]);

  const isEmpty = items.length === 0 && collections.length === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Star className="size-5 fill-amber-400 text-amber-400" />
        <h1 className="text-xl font-semibold text-foreground">Favorites</h1>
        <span className="text-sm text-muted-foreground">
          {items.length + collections.length} total
        </span>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20">
          <Star className="mb-3 size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No favorites yet.</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Star items and collections to find them here.
          </p>
        </div>
      ) : (
        <>
          {/* Items section */}
          {items.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-2 px-4">
                <span className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Items
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {items.length}
                </span>
              </div>
              <div className="rounded-lg border border-border">
                {items.map((item) => (
                  <FavoriteItemRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {/* Collections section */}
          {collections.length > 0 && (
            <section>
              <div className="mb-2 flex items-center gap-2 px-4">
                <span className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Collections
                </span>
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {collections.length}
                </span>
              </div>
              <div className="rounded-lg border border-border">
                {collections.map((col) => (
                  <FavoriteCollectionRow key={col.id} collection={col} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
