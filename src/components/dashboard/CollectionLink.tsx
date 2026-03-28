"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

// ─── Shared collection link shape used across Favorites, Recent, and list ────

interface CollectionLinkProps {
  href: string;
  color?: string;
  name: string;
  /** Dot size variant: "sm" for sub-list items, "md" for main list */
  dotSize?: "sm" | "md";
  collapsed?: boolean;
  /** Extra element to render after the name (e.g. star icon or count) */
  trailing?: React.ReactNode;
  className?: string;
}

export function CollectionLink({
  href,
  color,
  name,
  dotSize = "md",
  collapsed = false,
  trailing,
  className,
}: CollectionLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors",
        collapsed && "justify-center px-2",
        className
      )}
    >
      {color && (
        <span
          className={cn(
            "shrink-0 rounded-full",
            dotSize === "sm" ? "size-1.5" : "size-2"
          )}
          style={{ backgroundColor: color }}
        />
      )}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{name}</span>
          {trailing}
        </>
      )}
    </Link>
  );
}
