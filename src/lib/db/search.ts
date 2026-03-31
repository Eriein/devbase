import { prisma } from "@/lib/prisma";

export type SearchItem = {
  id: string;
  title: string;
  contentPreview: string | null;
  itemType: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
};

export type SearchCollection = {
  id: string;
  name: string;
  itemCount: number;
};

export type SearchData = {
  items: SearchItem[];
  collections: SearchCollection[];
};

// ─── Pure helpers ─────────────────────────────────────────────

export function buildContentPreview(
  content: string | null,
  description: string | null,
  maxLength = 100
): string | null {
  return content?.slice(0, maxLength) ?? description?.slice(0, maxLength) ?? null;
}

// ─── Query ────────────────────────────────────────────────────

export async function getSearchData(userId: string): Promise<SearchData> {
  const [rawItems, rawCollections] = await Promise.all([
    prisma.item.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        description: true,
        itemType: { select: { id: true, name: true, icon: true, color: true } },
      },
    }),
    prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        _count: { select: { items: true } },
      },
    }),
  ]);

  return {
    items: rawItems.map((item) => ({
      id: item.id,
      title: item.title,
      contentPreview: buildContentPreview(item.content, item.description),
      itemType: item.itemType,
    })),
    collections: rawCollections.map((col) => ({
      id: col.id,
      name: col.name,
      itemCount: col._count.items,
    })),
  };
}
