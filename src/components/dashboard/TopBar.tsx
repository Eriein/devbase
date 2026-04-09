import { usePathname } from "next/navigation";
import { Search, Plus, FolderPlus, PanelLeft, Star } from "lucide-react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onToggleSidebar: () => void;
  onNewItem?: () => void;
  onNewCollection?: () => void;
  onOpenSearch?: () => void;
  isPro: boolean;
}

function getTitleFromPathname(pathname: string): { title: string; subtitle?: string } {
  if (pathname === "/dashboard" || pathname === "/") {
    return { title: "Dashboard", subtitle: "Your developer knowledge hub" };
  }
  if (pathname.startsWith("/items/")) {
    const type = pathname.split("/")[2];
    if (type) {
      return { title: type.charAt(0).toUpperCase() + type.slice(1) };
    }
  }
  if (pathname === "/collections") {
    return { title: "Collections" };
  }
  if (pathname.startsWith("/collections/")) {
    return { title: "Collection" };
  }
  if (pathname === "/favorites") {
    return { title: "Favorites" };
  }
  if (pathname === "/settings") {
    return { title: "Settings" };
  }
  if (pathname === "/profile") {
    return { title: "Profile" };
  }
  if (pathname === "/upgrade") {
    return { title: "Upgrade" };
  }
  return { title: "Dashboard" };
}

export function TopBar({ onToggleSidebar, onNewItem, onNewCollection, onOpenSearch, isPro }: TopBarProps) {
  const pathname = usePathname();
  const { title, subtitle } = getTitleFromPathname(pathname);
  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-6">
      {/* Left: sidebar toggle + title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon-sm" onClick={onToggleSidebar}>
          <PanelLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-base font-semibold leading-tight">{title}</h1>
          {subtitle && (
            <p className="hidden text-xs text-muted-foreground sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Center: search (hidden on mobile, shown on sm+) */}
      <div className="hidden sm:flex sm:flex-1 sm:justify-center">
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

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Search icon-only on mobile */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden"
          onClick={onOpenSearch}
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        <Link
          href="/favorites"
          aria-label="Favorites"
          className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
        >
          <Star className="size-4" />
        </Link>

        {/* Combined + dropdown on mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "sm:hidden")}
            aria-label="New"
          >
            <Plus className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onNewItem}>
              <Plus className="mr-2 size-3.5" />
              New Item
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onNewCollection}>
              <FolderPlus className="mr-2 size-3.5" />
              New Collection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Separate labeled buttons on sm+ */}
        {!isPro && (
          <Link
            href="/upgrade"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "hidden text-muted-foreground hover:text-foreground sm:flex"
            )}
          >
            Upgrade
          </Link>
        )}
        <Button variant="outline" size="sm" className="hidden gap-1.5 sm:flex" onClick={onNewItem}>
          <Plus className="size-3.5" />
          New Item
        </Button>
        <Button variant="ghost" size="sm" className="hidden gap-1.5 sm:flex" onClick={onNewCollection}>
          <FolderPlus className="size-3.5" />
          New Collection
        </Button>
      </div>
    </header>
  );
}
