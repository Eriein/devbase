import { Search, Plus, FolderPlus, PanelLeft, Star } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onToggleSidebar: () => void;
  onNewItem?: () => void;
  onNewCollection?: () => void;
  onOpenSearch?: () => void;
}

export function TopBar({ onToggleSidebar, onNewItem, onNewCollection, onOpenSearch }: TopBarProps) {
  return (
    <header className="grid h-14 grid-cols-3 items-center border-b border-border px-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={onToggleSidebar}>
          <PanelLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-base font-semibold leading-tight">Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Your developer knowledge hub
          </p>
        </div>
      </div>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" className="gap-2" onClick={onOpenSearch}>
          <Search className="size-3.5" />
          <span>Search</span>
          <span className="pointer-events-none ml-1 hidden items-center gap-1 sm:flex">
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              ⌘K
            </kbd>
            <span className="text-[10px] text-muted-foreground">/</span>
            <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Ctrl K
            </kbd>
          </span>
        </Button>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Link
          href="/favorites"
          aria-label="Favorites"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <Star className="size-4" />
        </Link>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={onNewItem}>
          <Plus className="size-3.5" />
          <span>New Item</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-1.5" onClick={onNewCollection}>
          <FolderPlus className="size-3.5" />
          <span>New Collection</span>
        </Button>
      </div>
    </header>
  );
}
