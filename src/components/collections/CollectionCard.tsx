import { Star } from "lucide-react";
import { iconMap } from "@/lib/item-type-helpers";
import type { CollectionWithTypes } from "@/lib/db/collections";

interface CollectionCardProps {
  collection: CollectionWithTypes;
}

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <div
      className="flex h-44 cursor-pointer flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:bg-card/80"
      style={{ borderLeftWidth: "3px", borderLeftColor: collection.dominantColor }}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-foreground">{collection.name}</h3>
        {collection.isFavorite && (
          <Star className="size-3.5 shrink-0 fill-amber-400 text-amber-400" />
        )}
      </div>
      {collection.description && (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {collection.description}
        </p>
      )}
      <div className="mt-auto flex items-center justify-between pt-4">
        <div className="flex items-center gap-1.5">
          {collection.typeIcons.map((type) => {
            const Icon = iconMap[type.icon];
            return Icon ? (
              <div
                key={type.id}
                className="rounded p-1.5"
                style={{ backgroundColor: type.color + "20" }}
                title={type.name}
              >
                <Icon className="size-3.5" style={{ color: type.color }} />
              </div>
            ) : null;
          })}
        </div>
        <span className="text-xs text-muted-foreground">
          {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
        </span>
      </div>
    </div>
  );
}
