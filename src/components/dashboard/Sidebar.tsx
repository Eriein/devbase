"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Code2 } from "lucide-react";
import { iconMap } from "@/lib/item-type-helpers";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientOnly } from "@/components/ClientOnly";
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
  isPro: boolean;
}

// ─── Component ────────────────────────────────────────────────

export function Sidebar({
  collapsed,
  sidebarItemTypes,
  sidebarCollections,
  userName,
  userImage,
  isPro,
}: SidebarProps) {
  const pathname = usePathname();

  const isItemTypeActive = (typeName: string) => {
    const basePath = `/items/${typeName.toLowerCase()}s`;
    return pathname.startsWith(basePath);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <Link
        href="/dashboard"
        className={cn(
          "flex h-14 items-center gap-2 border-b border-border px-4 transition-colors hover:bg-muted/50",
          pathname === "/dashboard" && "bg-sidebar-accent"
        )}
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
      <ClientOnly fallback={<div className="flex-1" />}>
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
                  const href = type.isPro && !isPro ? "#" : `/items/${type.name.toLowerCase()}s`;
                  const isActive = isItemTypeActive(type.name);

                  return (
                    <Link
                      key={type.id}
                      href={href}
                      onClick={(e) => {
                        if (type.isPro && !isPro) {
                          e.preventDefault();
                          window.location.href = "/upgrade";
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-foreground font-medium"
                          : "text-sidebar-foreground/80",
                        collapsed && "justify-center px-2",
                        type.isPro && !isPro && "cursor-not-allowed opacity-50"
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
                            {type.isPro && !isPro && (
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
      </ClientOnly>

      {/* User dropdown */}
      <UserMenuDropdown
        userName={userName}
        userImage={userImage}
        collapsed={collapsed}
      />
    </div>
  );
}
