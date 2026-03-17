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
  FolderOpen,
  ChevronDown,
  Settings,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { items, collections, itemTypes, currentUser } from "@/lib/mock-data";

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

function getItemCountByType(typeId: string): number {
  return items.filter((item) => item.itemTypeId === typeId).length;
}

function getTypeSlug(name: string): string {
  return name.toLowerCase() + "s";
}

const favoriteCollections = collections.filter((c) => c.isFavorite);
const recentCollections = [...collections]
  .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  .slice(0, 5);

const navLinks = [
  { label: "Favorites", icon: Star, href: "/dashboard" },
  { label: "Recent", icon: Clock, href: "/dashboard" },
];

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const [collectionsOpen, setCollectionsOpen] = useState(true);

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
          {/* Nav links */}
          <div className="space-y-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                  collapsed && "justify-center px-2"
                )}
              >
                <link.icon className="size-4 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            ))}
          </div>

          {/* Item Types */}
          <div className="mt-6">
            {!collapsed && (
              <h3 className="mb-2 px-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Item Types
              </h3>
            )}
            <div className="space-y-0.5">
              {itemTypes.map((type) => {
                const Icon = iconMap[type.icon];
                const count = getItemCountByType(type.id);
                const isPro = type.name === "File" || type.name === "Image";

                return (
                  <Link
                    key={type.id}
                    href={`/items/${getTypeSlug(type.name)}`}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    {Icon && (
                      <Icon
                        className="size-4 shrink-0"
                        style={{ color: type.color }}
                      />
                    )}
                    {!collapsed && (
                      <>
                        <span className="flex-1">{type.name + "s"}</span>
                        {isPro ? (
                          <span
                            className="rounded px-1.5 py-0.5 text-[10px] font-semibold leading-none"
                            style={{
                              backgroundColor: type.color + "20",
                              color: type.color,
                            }}
                          >
                            PRO
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {count}
                          </span>
                        )}
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
                {recentCollections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/collections/${collection.id}`}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                      collapsed && "justify-center px-2"
                    )}
                  >
                    <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{collection.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {collection.itemIds.length}
                        </span>
                      </>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>

      {/* User avatar area */}
      <div className="border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-3",
            collapsed && "justify-center"
          )}
        >
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-sm text-sidebar-foreground">
                {currentUser.name}
              </span>
              <button className="text-muted-foreground hover:text-sidebar-foreground transition-colors">
                <Settings className="size-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
