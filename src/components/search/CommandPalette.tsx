"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useItemDrawer } from "@/components/items/ItemDrawerProvider";
import { iconMap } from "@/lib/item-type-helpers";
import type { SearchData } from "@/lib/db/search";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [data, setData] = useState<SearchData | null>(null);
  const { openDrawer } = useItemDrawer();
  const router = useRouter();

  // Fetch search data once on mount
  useEffect(() => {
    fetch("/api/search")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => {});
  }, []);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onOpenChange]);

  const handleSelectItem = useCallback(
    (itemId: string) => {
      onOpenChange(false);
      openDrawer(itemId);
    },
    [onOpenChange, openDrawer]
  );

  const handleSelectCollection = useCallback(
    (collectionId: string) => {
      onOpenChange(false);
      router.push(`/collections/${collectionId}`);
    },
    [onOpenChange, router]
  );

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search"
      description="Search items and collections"
      className="sm:max-w-2xl"
    >
      <Command>
      <CommandInput placeholder="Search items and collections..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {data && data.items.length > 0 && (
          <CommandGroup heading="Items">
            {data.items.map((item) => {
              const Icon = iconMap[item.itemType.icon] ?? FolderOpen;
              return (
                <CommandItem
                  key={item.id}
                  value={`${item.title} ${item.itemType.name}`}
                  onSelect={() => handleSelectItem(item.id)}
                >
                  <Icon
                    className="size-4 shrink-0"
                    style={{ color: item.itemType.color }}
                  />
                  <span className="flex-1 truncate">{item.title}</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {item.itemType.name}
                  </span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}

        {data && data.items.length > 0 && data.collections.length > 0 && (
          <CommandSeparator />
        )}

        {data && data.collections.length > 0 && (
          <CommandGroup heading="Collections">
            {data.collections.map((col) => (
              <CommandItem
                key={col.id}
                value={`${col.name} collection`}
                onSelect={() => handleSelectCollection(col.id)}
              >
                <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 truncate">{col.name}</span>
                <span className="text-xs text-muted-foreground">
                  {col.itemCount} {col.itemCount === 1 ? "item" : "items"}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
      </Command>
    </CommandDialog>
  );
}
