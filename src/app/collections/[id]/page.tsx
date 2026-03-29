import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { auth } from "@/auth";
import { getCollectionById } from "@/lib/db/collections";
import { iconMap } from "@/lib/item-type-helpers";
import { ItemCard } from "@/components/items/ItemCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) notFound();

  const collection = await getCollectionById(id, session.user.id);
  if (!collection) notFound();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 rounded-md p-2"
          style={{ backgroundColor: collection.dominantColor + "20" }}
        >
          <div className="flex items-center gap-1">
            {collection.typeIcons.length > 0
              ? collection.typeIcons.slice(0, 1).map((type) => {
                  const Icon = iconMap[type.icon];
                  return Icon ? (
                    <Icon
                      key={type.id}
                      className="size-5"
                      style={{ color: collection.dominantColor }}
                    />
                  ) : null;
                })
              : null}
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">
              {collection.name}
            </h1>
            {collection.isFavorite && (
              <Star className="size-4 fill-amber-400 text-amber-400" />
            )}
          </div>
          {collection.description && (
            <p className="mt-1 text-sm text-muted-foreground">
              {collection.description}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {collection.itemCount}{" "}
            {collection.itemCount === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Items */}
      {collection.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">
            No items in this collection yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {collection.items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
