import { prisma } from "@/lib/prisma";
import type { CreateCollectionInput } from "@/lib/collections-validation";
import type { DashboardItem } from "@/lib/db/items";
import { mapItem, itemSelect } from "@/lib/db/items";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";

export type CollectionWithTypes = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  updatedAt: Date;
  itemCount: number;
  // Unique item types present in this collection, sorted by count desc
  typeIcons: {
    id: string;
    icon: string;
    color: string;
    name: string;
  }[];
  // Border color = most-used item type color
  dominantColor: string;
};

export type CollectionDetail = CollectionWithTypes & {
  items: DashboardItem[];
  total: number;
};

// ─── Pure helpers ─────────────────────────────────────────────

type ItemTypeEntry = { id: string; icon: string; color: string; name: string };

export function computeTypeStats(itemTypes: ItemTypeEntry[]): {
  typeIcons: ItemTypeEntry[];
  dominantColor: string;
} {
  const counts = new Map<string, ItemTypeEntry & { count: number }>();
  for (const t of itemTypes) {
    const existing = counts.get(t.id);
    if (existing) {
      existing.count++;
    } else {
      counts.set(t.id, { ...t, count: 1 });
    }
  }
  const sorted = [...counts.values()].sort((a, b) => b.count - a.count);
  return {
    typeIcons: sorted.slice(0, 4).map(({ id, icon, color, name }) => ({ id, icon, color, name })),
    dominantColor: sorted[0]?.color ?? "#6b7280",
  };
}

// ─── Queries ──────────────────────────────────────────────────

export async function getRecentCollections(
  userId: string,
  limit?: number
): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    ...(limit !== undefined && { take: limit }),
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      updatedAt: true,
      items: {
        select: {
          item: {
            select: {
              itemType: { select: { id: true, icon: true, color: true, name: true } },
            },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const { typeIcons, dominantColor } = computeTypeStats(
      col.items.map(({ item }) => item.itemType)
    );
    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      updatedAt: col.updatedAt,
      itemCount: col.items.length,
      typeIcons,
      dominantColor,
    };
  });
}

export async function getAllCollections(
  userId: string
): Promise<CollectionWithTypes[]> {
  return getRecentCollections(userId);
}

export async function getFavoriteCollections(
  userId: string
): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId, isFavorite: true },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      updatedAt: true,
      items: {
        select: {
          item: {
            select: {
              itemType: { select: { id: true, icon: true, color: true, name: true } },
            },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    const { typeIcons, dominantColor } = computeTypeStats(
      col.items.map(({ item }) => item.itemType)
    );
    return {
      id: col.id,
      name: col.name,
      description: col.description,
      isFavorite: col.isFavorite,
      updatedAt: col.updatedAt,
      itemCount: col.items.length,
      typeIcons,
      dominantColor,
    };
  });
}

export async function getCollectionById(
  id: string,
  userId: string,
  page = 1
): Promise<CollectionDetail | null> {
  // First verify ownership and get metadata + total count
  const col = await prisma.collection.findFirst({
    where: { id, userId },
    select: {
      id: true,
      name: true,
      description: true,
      isFavorite: true,
      updatedAt: true,
      _count: { select: { items: true } },
    },
  });
  if (!col) return null;

  const skip = (page - 1) * COLLECTIONS_PER_PAGE;

  // Lightweight type rows (all items, just type info for dominant color)
  // + paginated full item rows — fetched in parallel
  const [typeRows, pageRows] = await Promise.all([
    prisma.itemCollection.findMany({
      where: { collectionId: id },
      select: {
        item: {
          select: {
            itemType: { select: { id: true, icon: true, color: true, name: true } },
          },
        },
      },
    }),
    prisma.itemCollection.findMany({
      where: { collectionId: id },
      orderBy: { item: { updatedAt: "desc" } },
      skip,
      take: COLLECTIONS_PER_PAGE,
      select: { item: { select: itemSelect } },
    }),
  ]);

  const { typeIcons, dominantColor } = computeTypeStats(
    typeRows.map(({ item }) => item.itemType)
  );

  return {
    id: col.id,
    name: col.name,
    description: col.description,
    isFavorite: col.isFavorite,
    updatedAt: col.updatedAt,
    itemCount: col._count.items,
    total: col._count.items,
    typeIcons,
    dominantColor,
    items: pageRows.map(({ item }) => mapItem(item)),
  };
}

export async function createCollection(
  userId: string,
  input: CreateCollectionInput
) {
  return prisma.collection.create({
    data: {
      userId,
      name: input.name,
      description: input.description ?? null,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
}

export async function updateCollection(
  id: string,
  userId: string,
  input: CreateCollectionInput
) {
  return prisma.collection.updateMany({
    where: { id, userId },
    data: {
      name: input.name,
      description: input.description ?? null,
    },
  });
}

export async function deleteCollection(id: string, userId: string) {
  // ItemCollection rows cascade-delete automatically via DB constraint
  return prisma.collection.deleteMany({ where: { id, userId } });
}

export async function getUserCollections(
  userId: string
): Promise<{ id: string; name: string }[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function toggleCollectionFavorite(
  id: string,
  userId: string
): Promise<boolean | null> {
  const col = await prisma.collection.findFirst({
    where: { id, userId },
    select: { isFavorite: true },
  });
  if (!col) return null;

  const newValue = !col.isFavorite;
  await prisma.collection.updateMany({
    where: { id, userId },
    data: { isFavorite: newValue },
  });
  return newValue;
}

export async function getCollectionStats(userId: string) {
  const [totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalCollections, favoriteCollections };
}
