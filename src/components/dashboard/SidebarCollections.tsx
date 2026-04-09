"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { Star, Clock, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { sortCollectionsForSidebar } from "@/lib/sidebar-helpers";
import { CollectionLink } from "./CollectionLink";
import { SidebarSectionHeader } from "./SidebarSectionHeader";
import type { CollectionWithTypes } from "@/lib/db/collections";

// ─── Types ────────────────────────────────────────────────────

interface SidebarCollectionsProps {
  collections: CollectionWithTypes[];
  collapsed: boolean;
}

// ─── Component ────────────────────────────────────────────────

export function SidebarCollections({
  collections,
  collapsed,
}: SidebarCollectionsProps) {
  const { favorites, recent, all } = sortCollectionsForSidebar(collections);

  return (
    <>
      <SidebarSectionHeader
        label="Collections"
        collapsed={collapsed}
        action={
          !collapsed ? (
            <Link
              href="/collections"
              aria-label="View all collections"
              className="flex size-4 items-center justify-center rounded-sm text-muted-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
            >
              <Plus className="size-3" />
            </Link>
          ) : undefined
        }
      />

      <div className={cn("space-y-0.5", collapsed && "flex flex-col items-center")}>
        {/* Favorites group */}
        <CollapsibleGroup
          icon={
            <Star className="size-4 shrink-0 fill-amber-400 text-amber-400" />
          }
          label="Favorites"
          href="/dashboard?filter=favorites"
          items={favorites}
          collapsed={collapsed}
        />

        {/* Recent group */}
        <CollapsibleGroup
          icon={<Clock className="size-4 shrink-0 text-muted-foreground" />}
          label="Recent"
          href="/dashboard?filter=recent"
          items={recent}
          collapsed={collapsed}
        />

        {/* All collections (flat list) */}
        {all.map((c) => (
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
                <span className="font-mono text-[11px] tabular-nums text-muted-foreground/60">
                  {c.itemCount}
                </span>
              )
            }
          />
        ))}

        {!collapsed && all.length > 0 && (
          <Link
            href="/collections"
            className="flex items-center gap-3 rounded-md px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-sidebar-accent/40 hover:text-sidebar-foreground transition-colors"
          >
            View all collections
          </Link>
        )}
      </div>
    </>
  );
}

// ─── Collapsible group ────────────────────────────────────────

interface CollapsibleGroupProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  items: CollectionWithTypes[];
  collapsed: boolean;
}

/**
 * A clickable group header (Favorites / Recent) with a collapsible
 * children panel. The chevron toggles the panel; the label itself
 * navigates to the filtered dashboard view. Children animate via the
 * grid-rows trick so height transitions smoothly.
 */
function CollapsibleGroup({
  icon,
  label,
  href,
  items,
  collapsed,
}: CollapsibleGroupProps) {
  const [open, setOpen] = useState(true);
  const panelId = useId();

  if (collapsed) {
    // In collapsed mode, render just the navigable icon — no chevron,
    // no children, no group affordance.
    return (
      <Link
        href={href}
        title={label}
        className="flex h-8 w-full items-center justify-center rounded-md text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground transition-colors"
      >
        {icon}
      </Link>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        <Link
          href={href}
          className="flex h-8 flex-1 items-center gap-3 rounded-md px-3 text-[13px] font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground transition-colors"
        >
          {icon}
          <span className="flex-1 truncate">{label}</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={`Toggle ${label}`}
          className="flex size-6 items-center justify-center rounded-sm text-muted-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground transition-colors"
        >
          <ChevronDown
            className={cn(
              "size-3.5 transition-transform duration-200",
              !open && "-rotate-90",
            )}
          />
        </button>
      </div>

      {/* Grid-rows trick: animates height between 0fr and 1fr */}
      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          {items.length > 0 && (
            <div className="ml-7 mt-0.5 space-y-0.5">
              {items.map((c) => (
                <CollectionLink
                  key={c.id}
                  href={`/collections/${c.id}`}
                  color={c.dominantColor}
                  name={c.name}
                  dotSize="sm"
                  className="py-1 text-[12px] text-sidebar-foreground/65"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
