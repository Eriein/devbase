import { prisma } from "@/lib/prisma";

export type DashboardItem = {
  id: string;
  title: string;
  contentType: string;
  content: string | null;
  fileUrl: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: Date;
  itemType: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  tags: { id: string; name: string }[];
};

const itemSelect = {
  id: true,
  title: true,
  contentType: true,
  content: true,
  fileUrl: true,
  url: true,
  isFavorite: true,
  isPinned: true,
  updatedAt: true,
  itemType: {
    select: { id: true, name: true, icon: true, color: true },
  },
  tags: {
    select: { tag: { select: { id: true, name: true } } },
  },
} as const;

function mapItem(raw: {
  id: string;
  title: string;
  contentType: string;
  content: string | null;
  fileUrl: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: Date;
  itemType: { id: string; name: string; icon: string; color: string };
  tags: { tag: { id: string; name: string } }[];
}): DashboardItem {
  return {
    ...raw,
    tags: raw.tags.map((t) => t.tag),
  };
}

export async function getPinnedItems(userId: string): Promise<DashboardItem[]> {
  const rows = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { updatedAt: "desc" },
    select: itemSelect,
  });
  return rows.map(mapItem);
}

export async function getRecentItems(userId: string, limit = 10): Promise<DashboardItem[]> {
  const rows = await prisma.item.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: itemSelect,
  });
  return rows.map(mapItem);
}

export async function getItemStats(userId: string) {
  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);
  return { totalItems, favoriteItems };
}
