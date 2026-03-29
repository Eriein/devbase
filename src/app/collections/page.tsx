import Link from "next/link";
import { redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { auth } from "@/auth";
import { getAllCollections } from "@/lib/db/collections";
import { CollectionCard } from "@/components/collections/CollectionCard";

export default async function CollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const collections = await getAllCollections(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-md p-2" style={{ backgroundColor: "#8b5cf620" }}>
          <FolderOpen className="size-5" style={{ color: "#8b5cf6" }} />
        </div>
        <h1 className="text-xl font-semibold text-foreground">Collections</h1>
        <span className="text-sm text-muted-foreground">
          {collections.length} {collections.length === 1 ? "collection" : "collections"}
        </span>
      </div>

      {collections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16">
          <p className="text-sm text-muted-foreground">
            No collections yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <CollectionCard collection={collection} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
