import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isAtItemLimit,
  isAtCollectionLimit,
  itemLimitMessage,
  collectionLimitMessage,
} from "@/lib/usage-limits";
import { FREE_ITEMS_LIMIT, FREE_COLLECTIONS_LIMIT } from "@/lib/constants";

export type SessionGuard =
  | { ok: true; userId: string; isPro: boolean }
  | { ok: false; error: string };

export async function requireSession(): Promise<SessionGuard> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated" };
  }
  return {
    ok: true,
    userId: session.user.id,
    isPro: session.user.isPro ?? false,
  };
}

export async function checkItemLimit(
  userId: string,
  isPro: boolean
): Promise<string | null> {
  if (isPro) return null;
  const count = await prisma.item.count({ where: { userId } });
  if (isAtItemLimit(false, count)) {
    return itemLimitMessage(FREE_ITEMS_LIMIT);
  }
  return null;
}

export async function checkCollectionLimit(
  userId: string,
  isPro: boolean
): Promise<string | null> {
  if (isPro) return null;
  const count = await prisma.collection.count({ where: { userId } });
  if (isAtCollectionLimit(false, count)) {
    return collectionLimitMessage(FREE_COLLECTIONS_LIMIT);
  }
  return null;
}
