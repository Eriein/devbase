"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
  Star,
  Clock,
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/UserAvatar";
import { signOutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import type { SidebarItemType } from "@/lib/db/item-types";
import type { CollectionWithTypes } from "@/lib/db/collections";

// ─── Types ────────────────────────────────────────────────────

export interface SidebarData {
  sidebarItemTypes: SidebarItemType[];
  sidebarCollections: CollectionWithTypes[];
  userName: string;
  userImage: string | null;
}

interface SidebarProps extends SidebarData {
  collapsed: boolean;
}

// ─── Icon map ─────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────

const PRO_TYPES = new Set(["file", "image"]);

// ─── Component ────────────────────────────────────────────────

export function Sidebar({
  collapsed,
  sidebarItemTypes,
  sidebarCollections,
  userName,
  userImage,
}: SidebarProps) {
  const [collectionsOpen, setCollectionsOpen] = useState(true);

  const sortedCollections = [...sidebarCollections].sort(
    (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
  );

  const favoriteCollections = sortedCollections.filter((c) => c.isFavorite).slice(0, 5);
  const recentCollections = sortedCollections.slice(0, 5);

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Code2 className="size-4" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground">
            DevStash
          </span>
        )}
      </div>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className={cn("py-3", collapsed ? "px-2" : "px-3")}>
          {/* Nav links - moved inside Collections */}
          {/* Item Types */}
          <div className="mt-6">
            {!collapsed && (
              <h3 className="mb-2 px-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Item Types
              </h3>
            )}
            <div className="space-y-0.5">
              {sidebarItemTypes.map((type) => {
                const Icon = iconMap[type.icon];
                const isPro = PRO_TYPES.has(type.name.toLowerCase());

                return (
                  <Link
                    key={type.id}
                    href={`/items/${type.name.toLowerCase()}s`}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    {Icon && (
                      <Icon className="size-4 shrink-0" style={{ color: type.color }} />
                    )}
                    {!collapsed && (
                      <>
                        <span className="flex-1 capitalize">{type.name}s</span>
                        <span className="flex items-center gap-1.5">
                          {isPro && (
                            <Badge
                              variant="outline"
                              className="h-auto px-1.5 py-0.5 text-[10px] font-semibold"
                              style={{
                                backgroundColor: type.color + "20",
                                color: type.color,
                                borderColor: type.color + "40",
                              }}
                            >
                              PRO
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {type.itemCount}
                          </span>
                        </span>
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Collections */}
          <div className="mt-6">
            {!collapsed && (
              <button
                onClick={() => setCollectionsOpen((prev) => !prev)}
                className="mb-2 flex w-full items-center justify-between px-2.5 cursor-pointer"
              >
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Collections
                </h3>
                <ChevronDown
                  className={cn(
                    "size-3.5 text-muted-foreground transition-transform duration-200",
                    !collectionsOpen && "-rotate-90"
                  )}
                />
              </button>
            )}
            {collectionsOpen && (
              <div className="space-y-0.5">
                {/* Favorites Section */}
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
                  {!collapsed && favoriteCollections.length > 0 && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                      {favoriteCollections.map((collection) => (
                        <Link
                          key={collection.id}
                          href={`/collections/${collection.id}`}
                          className="flex items-center gap-3 rounded-md px-2.5 py-1 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        >
                          <span
                            className="size-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: collection.dominantColor }}
                          />
                          <span className="flex-1 truncate">{collection.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Section */}
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
                  {!collapsed && recentCollections.length > 0 && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                      {recentCollections.map((collection) => (
                        <Link
                          key={collection.id}
                          href={`/collections/${collection.id}`}
                          className="flex items-center gap-3 rounded-md px-2.5 py-1 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                        >
                          <span
                            className="size-1.5 shrink-0 rounded-full"
                            style={{ backgroundColor: collection.dominantColor }}
                          />
                          <span className="flex-1 truncate">{collection.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                <div className="my-1.5 border-t border-border" />
                {sidebarCollections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    {/* Colored circle dot based on dominant item type */}
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: collection.dominantColor }}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{collection.name}</span>
                        {collection.isFavorite ? (
                          <Star className="size-3 shrink-0 fill-amber-400 text-amber-400" />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {collection.itemCount}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                ))}
                {/* View all collections link */}
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
        </div>
      </ScrollArea>

      {/* User avatar area */}
      <div className="border-t border-border p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent cursor-pointer outline-none",
              collapsed && "justify-center px-0"
            )}
          >
            <UserAvatar name={userName} image={userImage} />
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-left text-sm text-sidebar-foreground">
                  {userName}
                </span>
                <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" sideOffset={8} className="min-w-52">
            {/* User info header */}
            <div className="flex items-center gap-2.5 px-1.5 py-1.5">
              <UserAvatar name={userName} image={userImage} className="size-8" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{userName}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => (window.location.href = "/profile")}
            >
              <User className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={signOutAction}>
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
              >
                <button type="submit" className="flex w-full items-center gap-1.5">
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
