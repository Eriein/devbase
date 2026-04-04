import {
  Package,
  FolderOpen,
  Mail,
  Calendar,
} from "lucide-react";
import { iconMap } from "@/lib/item-type-helpers";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserAvatar } from "@/components/UserAvatar";
import { getProfileUser, getItemTypeBreakdown } from "@/lib/db/profile";
import { getItemStats } from "@/lib/db/items";
import { getCollectionStats } from "@/lib/db/collections";

// ─── Page ─────────────────────────────────────────────────────

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");
  const userId = session.user.id;

  const [user, itemTypeBreakdown, itemStats, collectionStats] =
    await Promise.all([
      getProfileUser(userId),
      getItemTypeBreakdown(userId),
      getItemStats(userId),
      getCollectionStats(userId),
    ]);

  if (!user) return null;

  const joinDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(user.createdAt);

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your profile and usage stats.
        </p>
      </div>

      {/* User Info */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          <UserAvatar
            name={user.name}
            image={user.image}
            className="size-16 text-lg"
          />
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {user.name ?? "Unnamed User"}
              </h2>
              <div className="mt-1.5 flex flex-col gap-1.5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
                <span className="flex items-center gap-1.5">
                  <Mail className="size-3.5" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Joined {joinDate}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Stats */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">
          Usage Stats
        </h2>

        {/* Overview cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Items</span>
              <div
                className="rounded-md p-1.5"
                style={{ backgroundColor: "#3b82f620" }}
              >
                <Package className="size-4" style={{ color: "#3b82f6" }} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {itemStats.totalItems}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Collections</span>
              <div
                className="rounded-md p-1.5"
                style={{ backgroundColor: "#8b5cf620" }}
              >
                <FolderOpen className="size-4" style={{ color: "#8b5cf6" }} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {collectionStats.totalCollections}
            </p>
          </div>
        </div>

        {/* Item type breakdown */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-medium text-foreground">
            Items by Type
          </h3>
          <div className="space-y-3">
            {itemTypeBreakdown.map((type) => {
              const Icon = iconMap[type.icon];
              return (
                <div key={type.name} className="flex items-center gap-3">
                  <div
                    className="rounded-md p-1.5"
                    style={{ backgroundColor: type.color + "20" }}
                  >
                    {Icon && (
                      <Icon
                        className="size-4"
                        style={{ color: type.color }}
                      />
                    )}
                  </div>
                  <span className="flex-1 text-sm text-foreground">
                    {type.name}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {type.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
}
