"use client";

import { showContent } from "@/lib/item-type-helpers";
import { ContentFieldRenderer } from "@/components/items/ContentFieldRenderer";
import type { EditState } from "./useItemDrawerActions";
import type { ItemDetail } from "@/lib/db/items";

interface ItemContentSectionProps {
  item: ItemDetail;
  isEditing: boolean;
  editState: EditState | null;
  onContentChange: (val: string) => void;
  isPro?: boolean;
  onAcceptOptimized?: (optimizedContent: string) => void;
}

export function ItemContentSection({
  item,
  isEditing,
  editState,
  onContentChange,
  isPro,
  onAcceptOptimized,
}: ItemContentSectionProps) {
  const typeName = item.itemType.name;

  if (!showContent(typeName)) return null;

  if (isEditing && editState) {
    return (
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Content
        </label>
        <ContentFieldRenderer
          typeName={typeName}
          value={editState.content}
          language={editState.language || undefined}
          onChange={onContentChange}
          rows={8}
        />
      </div>
    );
  }

  if (!isEditing && item.content) {
    return (
      <div>
        <h3 className="mb-2 text-sm font-medium text-foreground">Content</h3>
        <ContentFieldRenderer
          typeName={typeName}
          value={item.content}
          language={item.language ?? undefined}
          showExplainButton
          showOptimizeButton
          isPro={isPro}
          title={item.title}
          itemId={item.id}
          onAcceptOptimized={onAcceptOptimized}
        />
      </div>
    );
  }

  return null;
}
