import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────

interface SidebarSectionHeaderProps {
  /** Label rendered in Geist Mono uppercase */
  label: string;
  /** When true, renders only a short hairline rule (no label) */
  collapsed: boolean;
  /** Optional trailing slot — e.g. a "+" new-item affordance */
  action?: ReactNode;
  /** Extra className passed to the wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────

/**
 * Composite sidebar section header: left rule + mono label + right slot.
 * Used as an anchor for "Library" and "Collections" sections so they
 * stop blending together the way matching `<h3>` labels did before.
 *
 * In collapsed mode, the label is replaced by a short centered hairline
 * rule that keeps the vertical rhythm without spelling anything out.
 */
export function SidebarSectionHeader({
  label,
  collapsed,
  action,
  className,
}: SidebarSectionHeaderProps) {
  if (collapsed) {
    return (
      <div
        className={cn("flex justify-center py-3", className)}
        aria-hidden="true"
      >
        <span className="h-px w-6 bg-border/60" />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 px-3 pt-5 pb-2", className)}>
      <h2 className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground/70">
        {label}
      </h2>
      <span className="h-px flex-1 bg-border/60" aria-hidden="true" />
      {action}
    </div>
  );
}
