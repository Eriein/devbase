"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { showLanguage, showUrl } from "@/lib/item-type-helpers";
import { ItemContentSection } from "./ItemContentSection";
import { CollectionMultiSelect } from "@/components/items/CollectionMultiSelect";
import { LanguageSelect } from "@/components/items/LanguageSelect";
import type { EditState } from "./useItemDrawerActions";
import type { ItemDetail } from "@/lib/db/items";

interface ItemDrawerEditFormProps {
  item: ItemDetail;
  editState: EditState;
  patch: (
    field: keyof EditState
  ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onContentChange: (val: string) => void;
  onLanguageChange: (val: string) => void;
  onCollectionIdsChange: (ids: string[]) => void;
}

export function ItemDrawerEditForm({
  item,
  editState,
  patch,
  onContentChange,
  onLanguageChange,
  onCollectionIdsChange,
}: ItemDrawerEditFormProps) {
  const typeName = item.itemType.name;

  return (
    <>
      {/* Description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Description
        </label>
        <Textarea
          value={editState.description}
          onChange={patch("description")}
          placeholder="Optional description"
          rows={3}
        />
      </div>

      {/* Language (before content so highlighting is active) */}
      {showLanguage(typeName) && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            Language
          </label>
          <LanguageSelect
            value={editState.language}
            onChange={onLanguageChange}
          />
        </div>
      )}

      {/* Content */}
      <ItemContentSection
        item={item}
        isEditing={true}
        editState={editState}
        onContentChange={onContentChange}
      />

      {/* URL */}
      {showUrl(typeName) && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">
            URL
          </label>
          <Input
            value={editState.url}
            onChange={patch("url")}
            placeholder="https://..."
            type="url"
          />
        </div>
      )}

      {/* Collections */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Collections
        </label>
        <CollectionMultiSelect
          value={editState.collectionIds}
          onChange={onCollectionIdsChange}
        />
      </div>
    </>
  );
}
