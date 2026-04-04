import type { DashboardItem } from "@/lib/db/items";
import type { CollectionWithTypes } from "@/lib/db/collections";

export type SortOption = "name-asc" | "date-desc" | "date-asc" | "type";

export function sortItems(items: DashboardItem[], sort: SortOption): DashboardItem[] {
  const sorted = [...items];
  switch (sort) {
    case "name-asc":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "date-desc":
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    case "date-asc":
      return sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    case "type":
      return sorted.sort((a, b) => a.itemType.name.localeCompare(b.itemType.name));
    default:
      return sorted;
  }
}

export function sortCollections(
  collections: CollectionWithTypes[],
  sort: SortOption
): CollectionWithTypes[] {
  const sorted = [...collections];
  switch (sort) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "date-desc":
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    case "date-asc":
      return sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    case "type":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}
