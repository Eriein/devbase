import { Search, Plus, FolderPlus, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopBarProps {
  onToggleSidebar: () => void;
  onNewItem?: () => void;
  onNewCollection?: () => void;
}

export function TopBar({ onToggleSidebar, onNewItem, onNewCollection }: TopBarProps) {
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
        <Button variant="outline" size="sm" className="gap-2">
          <Search className="size-3.5" />
          <span>Search</span>
          <kbd className="pointer-events-none ml-1 hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block">
            ⌘K
          </kbd>
        </Button>
      </div>
      <div className="flex items-center justify-end gap-2">
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
