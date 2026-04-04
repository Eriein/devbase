import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { iconMap } from "@/lib/item-type-helpers";
import { getItemsByTypePaginated, getItemTypeBySlug } from "@/lib/db/items";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { parsePage } from "@/lib/utils";
import { ItemCard } from "@/components/items/ItemCard";
import { ImageThumbnailCard } from "@/components/items/ImageThumbnailCard";
import { FileListRow } from "@/components/items/FileListRow";
import { NewItemButton } from "@/components/items/NewItemButton";
import { Pagination } from "@/components/ui/Pagination";

interface PageProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function ItemsByTypePage({ params, searchParams }: PageProps) {
  const { type } = await params;
  const { page: pageParam } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) notFound();

  const itemType = await getItemTypeBySlug(type);
  if (!itemType) notFound();

  const page = parsePage(pageParam);
  const { items, total } = await getItemsByTypePaginated(session.user.id, itemType.id, page);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

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
          {total} {total === 1 ? "item" : "items"}
        </span>
        <div className="flex-1" />
        <NewItemButton
          typeId={itemType.id}
          typeName={typeName}
          color={itemType.color}
        />
      </div>

      {total === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">
            No {type} yet. Create your first one!
          </p>
        </div>
      ) : itemType.name === "image" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ImageThumbnailCard key={item.id} item={item} />
          ))}
        </div>
      ) : itemType.name === "file" ? (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <FileListRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
