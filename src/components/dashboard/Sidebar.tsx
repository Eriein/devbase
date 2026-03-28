"use client";

import Link from "next/link";
import { Code2 } from "lucide-react";
import { iconMap } from "@/lib/item-type-helpers";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { SidebarItemType } from "@/lib/db/item-types";
import type { CollectionWithTypes } from "@/lib/db/collections";
import { SidebarCollections } from "./SidebarCollections";
import { UserMenuDropdown } from "./UserMenuDropdown";

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
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <Link
        href="/dashboard"
        className="flex h-14 items-center gap-2 border-b border-border px-4 transition-colors hover:bg-muted/50"
      >
        <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Code2 className="size-4" />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground">
            DevStash
          </span>
        )}
      </Link>

      {/* Scrollable content */}
      <ScrollArea className="flex-1">
        <div className={cn("py-3", collapsed ? "px-2" : "px-3")}>
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
                      <Icon
                        className="size-4 shrink-0"
                        style={{ color: type.color }}
                      />
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
          <SidebarCollections
            collections={sidebarCollections}
            collapsed={collapsed}
          />
        </div>
      </ScrollArea>

      {/* User dropdown */}
      <UserMenuDropdown
        userName={userName}
        userImage={userImage}
        collapsed={collapsed}
      />
    </div>
  );
}
