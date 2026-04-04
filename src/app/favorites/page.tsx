import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { getFavoriteItems } from "@/lib/db/items";
import { getFavoriteCollections } from "@/lib/db/collections";
import { FavoritesClient } from "@/components/favorites/FavoritesClient";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user?.id) notFound();

  const userId = session.user.id;

  const [items, collections] = await Promise.all([
    getFavoriteItems(userId),
    getFavoriteCollections(userId),
  ]);

  return <FavoritesClient initialItems={items} initialCollections={collections} />;
}
