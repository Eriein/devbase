"use client";

import Link from "next/link";
import type { ComponentType, CSSProperties, MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { formatItemCount } from "@/lib/sidebar-helpers";

// ─── Types ────────────────────────────────────────────────────

type IconComponent = ComponentType<{
  className?: string;
  style?: CSSProperties;
}>;

interface SidebarItemRowProps {
  href: string;
  icon: IconComponent;
  label: string;
  /** CSS color string used for the left rail, glow, and icon */
  color: string;
  count?: number;
  /** Marks the row as a Pro feature; renders a PRO tag when locked */
  isPro?: boolean;
  /** When true (Pro type + non-Pro user), row is dimmed and redirects to /upgrade */
  isLocked?: boolean;
  isActive: boolean;
  collapsed: boolean;
}

// ─── Component ────────────────────────────────────────────────

/**
 * A single item-type row in the sidebar. Owns the 2px left accent rail,
 * the icon, the label, and the trailing column. The accent rail is the
 * signature piece: it's the active-state indicator AND the hover
 * indicator, using the type's own color so the sidebar reads as a
 * distributed-color nav instead of a single-primary one.
 */
export function SidebarItemRow({
  href,
  icon: Icon,
  label,
  color,
  count,
  isPro = false,
  isLocked = false,
  isActive,
  collapsed,
}: SidebarItemRowProps) {
  const handleLockedClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isLocked) {
      e.preventDefault();
      window.location.href = "/upgrade";
    }
  };

  // CSS vars let us drive rail + glow from the type color without
  // inline style objects on every element
  const style = { "--row-accent": color } as CSSProperties;

  return (
    <Link
      href={isLocked ? "#" : href}
      onClick={handleLockedClick}
      aria-current={isActive ? "page" : undefined}
      title={collapsed ? label : undefined}
      style={style}
      className={cn(
        // Layout
        "group relative flex h-8 items-center gap-3 rounded-md text-[13px] transition-colors",
        collapsed ? "justify-center px-0" : "pl-3 pr-2.5",
        // Idle
        "text-sidebar-foreground/75",
        // Hover
        "hover:bg-sidebar-accent/40 hover:text-sidebar-foreground",
        // Active
        isActive && "bg-sidebar-accent font-medium text-sidebar-foreground",
        // Locked
        isLocked && "cursor-not-allowed opacity-50",
      )}
    >
      {/* Accent rail — 2px bar pinned to the left edge, colored via CSS var */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-r-sm",
          "origin-center scale-y-0 transition-transform duration-200 ease-out",
          "group-hover:scale-y-100",
          isActive && "scale-y-100",
        )}
        style={{
          backgroundColor: "var(--row-accent)",
          boxShadow: isActive
            ? "0 0 12px color-mix(in oklab, var(--row-accent) 35%, transparent)"
            : undefined,
        }}
      />

      <Icon
        className="size-4 shrink-0"
        style={{ color: "var(--row-accent)" }}
      />

      {!collapsed && (
        <>
          <span className="flex-1 truncate capitalize">{label}</span>
          <span
            className={cn(
              "font-mono text-[11px] tabular-nums",
              isActive
                ? "text-sidebar-foreground/80"
                : "text-muted-foreground/60",
            )}
          >
            {isLocked ? (
              <span
                className="font-semibold tracking-[0.1em]"
                style={{ color: "var(--row-accent)" }}
              >
                PRO
              </span>
            ) : isPro && count === undefined ? (
              "—"
            ) : (
              formatItemCount(count ?? 0)
            )}
          </span>
        </>
      )}
    </Link>
  );
}
