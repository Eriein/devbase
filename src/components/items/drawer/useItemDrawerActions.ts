"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ItemDetail } from "@/lib/db/items";
import { updateItem, deleteItem } from "@/lib/actions/items";

// ─── Types ────────────────────────────────────────────────────

export type EditState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tagsRaw: string;
};

export function itemToEditState(item: ItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    url: item.url ?? "",
    language: item.language ?? "",
    tagsRaw: item.tags.map((t) => t.name).join(", "),
  };
}

// ─── Hook ─────────────────────────────────────────────────────

export function useItemDrawerActions(
  item: ItemDetail | null,
  setItem: (item: ItemDetail) => void,
  onClose: () => void
) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCopy = () => {
    const text = item?.content ?? item?.url ?? "";
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditStart = () => {
    if (!item) return;
    setEditState(itemToEditState(item));
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditState(null);
  };

  const handleDelete = () => {
    if (!item) return;
    startTransition(async () => {
      const result = await deleteItem(item.id);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Item deleted");
      onClose();
      router.refresh();
    });
  };

  const handleSave = () => {
    if (!item || !editState) return;

    const tags = editState.tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      const result = await updateItem(item.id, {
        title: editState.title,
        description: editState.description || null,
        content: editState.content || null,
        url: editState.url || null,
        language: editState.language || null,
        tags,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      setItem(result.data);
      setIsEditing(false);
      setEditState(null);
      toast.success("Item updated");
      router.refresh();
    });
  };

  const patch =
    (field: keyof EditState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setEditState((prev) => prev && { ...prev, [field]: e.target.value });

  const resetEditState = () => {
    setIsEditing(false);
    setEditState(null);
  };

  return {
    copied,
    isEditing,
    editState,
    isPending,
    setEditState,
    handleCopy,
    handleEditStart,
    handleEditCancel,
    handleDelete,
    handleSave,
    patch,
    resetEditState,
  };
}
