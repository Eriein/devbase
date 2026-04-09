"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClientOnly } from "@/components/ClientOnly";
import { cn } from "@/lib/utils";
import { iconMap } from "@/lib/item-type-helpers";
import { isItemTypeActive } from "@/lib/sidebar-helpers";
import type { SidebarItemType } from "@/lib/db/item-types";
import type { CollectionWithTypes } from "@/lib/db/collections";
import { SidebarCollections } from "./SidebarCollections";
import { SidebarSectionHeader } from "./SidebarSectionHeader";
import { SidebarItemRow } from "./SidebarItemRow";
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

// ─── Brand mark ───────────────────────────────────────────────

function BrandMark({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <rect width="32" height="32" rx="8" fill="#3b82f6" />
      <path
        d="M8 12h16M8 16h12M8 20h8"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
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
  const isDashboardActive = pathname === "/dashboard";

  return (
    <div className="flex h-full flex-col">
      {/* Logo bar */}
      <Link
        href="/dashboard"
        aria-current={isDashboardActive ? "page" : undefined}
        className={cn(
          "flex h-16 items-center gap-3 border-b border-border transition-colors hover:bg-muted/30",
          collapsed ? "justify-center px-0" : "px-4",
          isDashboardActive && "bg-sidebar-accent/50",
        )}
      >
        <BrandMark size={collapsed ? 28 : 26} />
        {!collapsed && (
          <span className="font-mono text-[13px] font-medium tracking-[0.02em] text-sidebar-foreground">
            DevStash
          </span>
        )}
      </Link>

      {/* Scrollable content */}
      <ClientOnly fallback={<div className="flex-1" />}>
        <ScrollArea className="flex-1">
          <div className={cn(collapsed ? "px-2 pb-3" : "px-3 pb-3")}>
            {/* Library section */}
            <SidebarSectionHeader label="Library" collapsed={collapsed} />
            <div className={cn("space-y-0.5", collapsed && "flex flex-col items-center")}>
              {sidebarItemTypes.map((type) => {
                const Icon = iconMap[type.icon];
                if (!Icon) return null;
                const locked = type.isPro && !isPro;
                const href = locked
                  ? "#"
                  : `/items/${type.name.toLowerCase()}s`;

                return (
                  <SidebarItemRow
                    key={type.id}
                    href={href}
                    icon={Icon}
                    label={`${type.name}s`}
                    color={type.color}
                    count={type.itemCount}
                    isPro={type.isPro}
                    isLocked={locked}
                    isActive={isItemTypeActive(pathname, type.name)}
                    collapsed={collapsed}
                  />
                );
              })}
            </div>

            {/* Collections section */}
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
