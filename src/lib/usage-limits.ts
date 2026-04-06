import { FREE_ITEMS_LIMIT, FREE_COLLECTIONS_LIMIT } from "@/lib/constants";

export function isAtItemLimit(isPro: boolean, itemCount: number): boolean {
  if (isPro) return false;
  return itemCount >= FREE_ITEMS_LIMIT;
}

export function isAtCollectionLimit(isPro: boolean, collectionCount: number): boolean {
  if (isPro) return false;
  return collectionCount >= FREE_COLLECTIONS_LIMIT;
}

export function canUploadFiles(isPro: boolean): boolean {
  return isPro;
}

export function canUseAI(isPro: boolean): boolean {
  return isPro;
}

export function canExport(isPro: boolean): boolean {
  return isPro;
}

export function canCreateCustomTypes(isPro: boolean): boolean {
  return isPro;
}

export function itemLimitMessage(limit: number): string {
  return `Free plan is limited to ${limit} items. Upgrade to Pro for unlimited items.`;
}

export function collectionLimitMessage(limit: number): string {
  return `Free plan is limited to ${limit} collections. Upgrade to Pro for unlimited collections.`;
}
