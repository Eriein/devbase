"use client";

import { useState, useEffect } from "react";
import { FolderOpen, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type Collection = { id: string; name: string };

// ─── Pure helpers ─────────────────────────────────────────────

export function formatCollectionLabel(
  selectedIds: string[],
  collections: Collection[]
): string {
  if (selectedIds.length === 0) return "None";
  if (selectedIds.length === 1) {
    return collections.find((c) => c.id === selectedIds[0])?.name ?? "1 collection";
  }
  return `${selectedIds.length} collections`;
}

interface CollectionMultiSelectProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

export function CollectionMultiSelect({
  value,
  onChange,
}: CollectionMultiSelectProps) {
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCollections(data);
      })
      .catch(() => {});
  }, []);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  }

  const label = formatCollectionLabel(value, collections);

  if (collections.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No collections yet.</p>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between font-normal text-sm"
          />
        }
      >
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <FolderOpen className="size-3.5" />
          {label}
        </span>
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {collections.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={value.includes(col.id)}
            onCheckedChange={() => toggle(col.id)}
          >
            {col.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
