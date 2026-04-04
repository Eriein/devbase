"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Star } from "lucide-react";
import { sortItems, sortCollections, type SortOption } from "@/lib/sorting";
import type { DashboardItem } from "@/lib/db/items";
import type { CollectionWithTypes } from "@/lib/db/collections";
import { FavoriteItemRow } from "@/components/favorites/FavoriteItemRow";
import { FavoriteCollectionRow } from "@/components/favorites/FavoriteCollectionRow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "date-desc", label: "Date (Newest)" },
  { value: "date-asc", label: "Date (Oldest)" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "type", label: "Type" },
];

function getSortLabel(value: SortOption): string {
  return SORT_OPTIONS.find((opt) => opt.value === value)?.label ?? "Sort by";
}

export function FavoritesClient({
  initialItems,
  initialCollections,
}: {
  initialItems: DashboardItem[];
  initialCollections: CollectionWithTypes[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const itemsSort = (searchParams.get("itemsSort") as SortOption) || "date-desc";
  const collectionsSort = (searchParams.get("collectionsSort") as SortOption) || "date-desc";

  const handleItemsSortChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("itemsSort", value);
    router.push(`/favorites?${params.toString()}`);
  };

  const handleCollectionsSortChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("collectionsSort", value);
    router.push(`/favorites?${params.toString()}`);
  };

  const sortedItems = sortItems(initialItems, itemsSort);
  const sortedCollections = sortCollections(initialCollections, collectionsSort);

  const isEmpty = sortedItems.length === 0 && sortedCollections.length === 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Star className="size-5 fill-amber-400 text-amber-400" />
        <h1 className="text-xl font-semibold text-foreground">Favorites</h1>
        <span className="text-sm text-muted-foreground">
          {sortedItems.length + sortedCollections.length} total
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
          {sortedItems.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Items
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {sortedItems.length}
                  </span>
                </div>
                <Select value={itemsSort} onValueChange={handleItemsSortChange}>
                  <SelectTrigger className="h-8 w-40 justify-between">
                    <span className="text-sm">{getSortLabel(itemsSort)}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border border-border">
                {sortedItems.map((item) => (
                  <FavoriteItemRow key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {sortedCollections.length > 0 && (
            <section>
              <div className="mb-2 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Collections
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    {sortedCollections.length}
                  </span>
                </div>
                <Select value={collectionsSort} onValueChange={handleCollectionsSortChange}>
                  <SelectTrigger className="h-8 w-40 justify-between">
                    <span className="text-sm">{getSortLabel(collectionsSort)}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="rounded-lg border border-border">
                {sortedCollections.map((col) => (
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
