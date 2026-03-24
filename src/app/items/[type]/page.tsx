import { notFound } from "next/navigation";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
} from "lucide-react";
import { auth } from "@/auth";
import { getItemsByType, getItemTypeBySlug } from "@/lib/db/items";
import { ItemCard } from "@/components/items/ItemCard";
import { NewItemButton } from "@/components/items/NewItemButton";

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

interface PageProps {
  params: Promise<{ type: string }>;
}

export default async function ItemsByTypePage({ params }: PageProps) {
  const { type } = await params;

  const session = await auth();
  if (!session?.user?.id) notFound();

  const itemType = await getItemTypeBySlug(type);
  if (!itemType) notFound();

  const items = await getItemsByType(session.user.id, itemType.id);

  const typeName = type.charAt(0).toUpperCase() + type.slice(1);
  const Icon = iconMap[itemType.icon];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="rounded-md p-2"
          style={{ backgroundColor: itemType.color + "20" }}
        >
          {Icon && <Icon className="size-5" style={{ color: itemType.color }} />}
        </div>
        <h1 className="text-xl font-semibold text-foreground">{typeName}</h1>
        <span className="text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"}
        </span>
        <div className="flex-1" />
        <NewItemButton
          typeId={itemType.id}
          typeName={typeName}
          color={itemType.color}
        />
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">
            No {type} yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
