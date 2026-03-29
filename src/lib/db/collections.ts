import { prisma } from "@/lib/prisma";
import type { CreateCollectionInput } from "@/lib/collections-validation";

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

export async function getRecentCollections(
  userId: string,
  limit = 6
): Promise<CollectionWithTypes[]> {
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    take: limit,
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
              itemType: {
                select: {
                  id: true,
                  icon: true,
                  color: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return collections.map((col) => {
    // Count occurrences of each item type
    const typeCounts = new Map<string, { id: string; icon: string; color: string; name: string; count: number }>();

    for (const { item } of col.items) {
      const t = item.itemType;
      const existing = typeCounts.get(t.id);
      if (existing) {
        existing.count++;
      } else {
        typeCounts.set(t.id, { id: t.id, icon: t.icon, color: t.color, name: t.name, count: 1 });
      }
    }

    const sortedTypes = [...typeCounts.values()].sort((a, b) => b.count - a.count);
    const dominantColor = sortedTypes[0]?.color ?? "#6b7280";
    const typeIcons = sortedTypes.slice(0, 4).map(({ id, icon, color, name }) => ({ id, icon, color, name }));

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

export async function getUserCollections(
  userId: string
): Promise<{ id: string; name: string }[]> {
  return prisma.collection.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

export async function getCollectionStats(userId: string) {
  const [totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.count({ where: { userId } }),
    prisma.collection.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalCollections, favoriteCollections };
}
