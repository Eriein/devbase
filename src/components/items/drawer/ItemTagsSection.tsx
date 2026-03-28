"use client";

import { Input } from "@/components/ui/input";
import type { ItemDetail } from "@/lib/db/items";
import type { EditState } from "./useItemDrawerActions";

interface ItemTagsSectionProps {
  item: ItemDetail;
  isEditing: boolean;
  editState: EditState | null;
  onPatch: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ItemTagsSection({
  item,
  isEditing,
  editState,
  onPatch,
}: ItemTagsSectionProps) {
  if (isEditing && editState) {
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Tags
        </label>
        <Input
          value={editState.tagsRaw}
          onChange={onPatch}
          placeholder="react, hooks, typescript"
        />
        <p className="mt-1 text-xs text-muted-foreground">Comma-separated</p>
      </div>
    );
  }

  if (!isEditing && item.tags.length > 0) {
    return (
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Tags</h3>
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
