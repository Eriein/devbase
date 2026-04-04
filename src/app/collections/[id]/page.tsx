import { notFound } from "next/navigation";
import { Star, ImageIcon, Paperclip } from "lucide-react";
import { auth } from "@/auth";
import { getCollectionById } from "@/lib/db/collections";
import { COLLECTIONS_PER_PAGE } from "@/lib/constants";
import { parsePage } from "@/lib/utils";
import { iconMap, isImageType, isFileType } from "@/lib/item-type-helpers";
import { ItemCard } from "@/components/items/ItemCard";
import { ImageThumbnailCard } from "@/components/items/ImageThumbnailCard";
import { FileListRow } from "@/components/items/FileListRow";
import { CollectionActions } from "@/components/collections/CollectionActions";
import { Pagination } from "@/components/ui/Pagination";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CollectionDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) notFound();

  const page = parsePage(pageParam);
  const collection = await getCollectionById(id, session.user.id, page);
  if (!collection) notFound();

  const totalPages = Math.ceil(collection.total / COLLECTIONS_PER_PAGE);

  const images = collection.items.filter((i) => isImageType(i.itemType.name));
  const files  = collection.items.filter((i) => isFileType(i.itemType.name));
  const rest   = collection.items.filter(
    (i) => !isImageType(i.itemType.name) && !isFileType(i.itemType.name)
  );

  const hasMediaSections = images.length > 0 || files.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div
          className="mt-0.5 rounded-md p-2"
          style={{ backgroundColor: collection.dominantColor + "20" }}
        >
          {collection.typeIcons.slice(0, 1).map((type) => {
            const Icon = iconMap[type.icon];
            return Icon ? (
              <Icon
                key={type.id}
                className="size-5"
                style={{ color: collection.dominantColor }}
              />
            ) : null;
          })}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-foreground">
                {collection.name}
              </h1>
              {collection.isFavorite && (
                <Star className="size-4 fill-amber-400 text-amber-400" />
              )}
            </div>
            <CollectionActions
              id={collection.id}
              name={collection.name}
              description={collection.description}
            />
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

      {/* Empty state */}
      {collection.total === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">
            No items in this collection yet.
          </p>
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="size-4 text-muted-foreground" />
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Images
            </h2>
            <span className="text-xs text-muted-foreground">{images.length}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((item) => (
              <ImageThumbnailCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Files */}
      {files.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Paperclip className="size-4 text-muted-foreground" />
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Files
            </h2>
            <span className="text-xs text-muted-foreground">{files.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {files.map((item) => (
              <FileListRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      {/* Everything else */}
      {rest.length > 0 && (
        <section className="space-y-3">
          {hasMediaSections && (
            <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Items
            </h2>
          )}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
