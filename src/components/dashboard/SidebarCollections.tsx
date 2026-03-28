"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Clock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollectionLink } from "./CollectionLink";
import type { CollectionWithTypes } from "@/lib/db/collections";

interface SidebarCollectionsProps {
  collections: CollectionWithTypes[];
  collapsed: boolean;
}

export function SidebarCollections({
  collections,
  collapsed,
}: SidebarCollectionsProps) {
  const [open, setOpen] = useState(true);

  const sorted = [...collections].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );
  const favorites = sorted.filter((c) => c.isFavorite).slice(0, 5);
  const recent = sorted.slice(0, 5);

  return (
    <div className="mt-6">
      {!collapsed && (
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="mb-2 flex w-full items-center justify-between px-2.5 cursor-pointer"
        >
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Collections
          </h3>
          <ChevronDown
            className={cn(
              "size-3.5 text-muted-foreground transition-transform duration-200",
              !open && "-rotate-90"
            )}
          />
        </button>
      )}

      {open && (
        <div className="space-y-0.5">
          {/* Favorites */}
          <div>
            <Link
              href="/dashboard?filter=favorites"
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                collapsed && "justify-center px-2"
              )}
            >
              <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />
              {!collapsed && <span>Favorites</span>}
            </Link>
            {!collapsed && favorites.length > 0 && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                {favorites.map((c) => (
                  <CollectionLink
                    key={c.id}
                    href={`/collections/${c.id}`}
                    color={c.dominantColor}
                    name={c.name}
                    dotSize="sm"
                    className="py-1 text-xs text-sidebar-foreground/70"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Recent */}
          <div>
            <Link
              href="/dashboard?filter=recent"
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                collapsed && "justify-center px-2"
              )}
            >
              <Clock className="size-4 shrink-0" />
              {!collapsed && <span>Recent</span>}
            </Link>
            {!collapsed && recent.length > 0 && (
              <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                {recent.map((c) => (
                  <CollectionLink
                    key={c.id}
                    href={`/collections/${c.id}`}
                    color={c.dominantColor}
                    name={c.name}
                    dotSize="sm"
                    className="py-1 text-xs text-sidebar-foreground/70"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="my-1.5 border-t border-border" />

          {/* All collections */}
          {collections.map((c) => (
            <CollectionLink
              key={c.id}
              href={`/collections/${c.id}`}
              color={c.dominantColor}
              name={c.name}
              collapsed={collapsed}
              trailing={
                c.isFavorite ? (
                  <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {c.itemCount}
                  </span>
                )
              }
            />
          ))}

          {!collapsed && (
            <Link
              href="/collections"
              className="flex items-center gap-3 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              View all collections
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
