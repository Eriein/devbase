import { prisma } from "@/lib/prisma";

export type DashboardItem = {
  id: string;
  title: string;
  contentType: string;
  content: string | null;
  description: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
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
  description: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
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

export function mapItem(raw: {
  id: string;
  title: string;
  contentType: string;
  content: string | null;
  description: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
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

export async function getItemsByType(
  userId: string,
  typeId: string
): Promise<DashboardItem[]> {
  const rows = await prisma.item.findMany({
    where: { userId, itemTypeId: typeId },
    orderBy: { createdAt: "desc" },
    select: itemSelect,
  });
  return rows.map(mapItem);
}

export async function getItemTypeBySlug(slug: string) {
  const name = slug.endsWith("s") ? slug.slice(0, -1) : slug;
  return prisma.itemType.findFirst({
    where: { name, isSystem: true, userId: null },
    select: { id: true, name: true, icon: true, color: true },
  });
}

// ─── Full detail (for drawer) ────────────────────────────────

export type ItemDetail = DashboardItem & {
  description: string | null;
  language: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  collections: { id: string; name: string }[];
};

const itemDetailSelect = {
  ...itemSelect,
  description: true,
  language: true,
  fileName: true,
  fileSize: true,
  createdAt: true,
  collections: {
    select: { collection: { select: { id: true, name: true } } },
  },
} as const;

export function mapItemDetail(raw: {
  id: string;
  title: string;
  contentType: string;
  content: string | null;
  fileUrl: string | null;
  url: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  updatedAt: Date;
  description: string | null;
  language: string | null;
  fileName: string | null;
  fileSize: number | null;
  createdAt: Date;
  itemType: { id: string; name: string; icon: string; color: string };
  tags: { tag: { id: string; name: string } }[];
  collections: { collection: { id: string; name: string } }[];
}): ItemDetail {
  return {
    ...raw,
    tags: raw.tags.map((t) => t.tag),
    collections: raw.collections.map((c) => c.collection),
  };
}

export async function getItemById(
  userId: string,
  itemId: string
): Promise<ItemDetail | null> {
  const row = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: itemDetailSelect,
  });
  return row ? mapItemDetail(row) : null;
}

// ─── Update item ─────────────────────────────────────────────

export type UpdateItemData = {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
};

export async function updateItem(
  userId: string,
  itemId: string,
  data: UpdateItemData
): Promise<ItemDetail | null> {
  const row = await prisma.item.update({
    where: { id: itemId, userId },
    data: {
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      tags: {
        deleteMany: {},
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    select: itemDetailSelect,
  });
  return mapItemDetail(row);
}

// ─── Create item ─────────────────────────────────────────────

export type CreateItemData = {
  itemTypeId: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  contentType?: string;
};

export async function createItem(
  userId: string,
  data: CreateItemData
): Promise<ItemDetail> {
  const row = await prisma.item.create({
    data: {
      userId,
      itemTypeId: data.itemTypeId,
      contentType: data.contentType ?? "text",
      title: data.title,
      description: data.description,
      content: data.content,
      url: data.url,
      language: data.language,
      fileUrl: data.fileUrl ?? null,
      fileName: data.fileName ?? null,
      fileSize: data.fileSize ?? null,
      tags: {
        create: data.tags.map((name) => ({
          tag: {
            connectOrCreate: {
              where: { name },
              create: { name },
            },
          },
        })),
      },
    },
    select: itemDetailSelect,
  });
  return mapItemDetail(row);
}

// ─── Delete item ─────────────────────────────────────────────

export async function getItemFileKey(
  userId: string,
  itemId: string
): Promise<string | null> {
  const item = await prisma.item.findFirst({
    where: { id: itemId, userId },
    select: { fileUrl: true },
  });
  return item?.fileUrl ?? null;
}

export async function deleteItem(
  userId: string,
  itemId: string
): Promise<boolean> {
  const deleted = await prisma.item.deleteMany({
    where: { id: itemId, userId },
  });
  return deleted.count > 0;
}

// ─── Stats ───────────────────────────────────────────────────

export async function getItemStats(userId: string) {
  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);
  return { totalItems, favoriteItems };
}
