import type { CollectionWithTypes } from "@/lib/db/collections";

// ─── Types ────────────────────────────────────────────────────

export interface SortedCollections {
  favorites: CollectionWithTypes[];
  recent: CollectionWithTypes[];
  all: CollectionWithTypes[];
}

// ─── Pure helpers ─────────────────────────────────────────────

/**
 * Returns true when the given pathname is viewing the listing page for
 * an item type. Matches the route convention /items/{typeName}s used by
 * the Sidebar — e.g. type "snippet" → /items/snippets.
 *
 * Root `/dashboard` intentionally returns false for all types so the
 * dashboard link itself owns the active state.
 */
export function isItemTypeActive(
  pathname: string,
  typeName: string,
): boolean {
  if (!pathname || !typeName) return false;
  const basePath = `/items/${typeName.toLowerCase()}s`;
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
}

/**
 * Splits the sidebar's collection list into three views in a single
 * pass: a date-sorted copy, the favorites subset (capped), and the
 * recent subset (capped). Pure — does not mutate input.
 */
export function sortCollectionsForSidebar(
  collections: CollectionWithTypes[],
  { favoritesLimit = 5, recentLimit = 5 }: {
    favoritesLimit?: number;
    recentLimit?: number;
  } = {},
): SortedCollections {
  const sorted = [...collections].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
  );
  const favorites = sorted.filter((c) => c.isFavorite).slice(0, favoritesLimit);
  const recent = sorted.slice(0, recentLimit);
  return { favorites, recent, all: sorted };
}

/**
 * Formats an item count for the sidebar's right-aligned numeric column.
 * Caps at 999+ so the tabular-nums column width never overflows.
 */
export function formatItemCount(count: number): string {
  if (!Number.isFinite(count) || count < 0) return "0";
  if (count > 999) return "999+";
  return String(Math.floor(count));
}
