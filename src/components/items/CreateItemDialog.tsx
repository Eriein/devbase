"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeEditor } from "@/components/items/CodeEditor";
import { MarkdownEditor } from "@/components/items/MarkdownEditor";
import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link as LinkIcon,
  File as FileIcon,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { createItem } from "@/lib/actions/items";
import type { SidebarItemType } from "@/lib/db/item-types";
import { FileUpload } from "@/components/items/FileUpload";
import type { UploadedFile } from "@/components/items/FileUpload";

// ─── Constants ────────────────────────────────────────────────

const CREATABLE_TYPES = ["snippet", "prompt", "command", "note", "link", "file", "image"];

const iconMap: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  Link: LinkIcon,
  File: FileIcon,
  Image: ImageIcon,
};

function showContent(typeName: string) {
  return ["snippet", "prompt", "command", "note"].includes(
    typeName.toLowerCase()
  );
}

function showLanguage(typeName: string) {
  return ["snippet", "command"].includes(typeName.toLowerCase());
}

function isCodeType(typeName: string) {
  return ["snippet", "command"].includes(typeName.toLowerCase());
}

function isMarkdownType(typeName: string) {
  return ["note", "prompt"].includes(typeName.toLowerCase());
}

function showUrl(typeName: string) {
  return typeName.toLowerCase() === "link";
}

function isFileType(typeName: string) {
  return typeName.toLowerCase() === "file";
}

function isImageType(typeName: string) {
  return typeName.toLowerCase() === "image";
}

function needsFileUpload(typeName: string) {
  return isFileType(typeName) || isImageType(typeName);
}

// ─── Form state ───────────────────────────────────────────────

type FormState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tagsRaw: string;
};

function emptyForm(): FormState {
  return {
    title: "",
    description: "",
    content: "",
    url: "",
    language: "",
    tagsRaw: "",
  };
}

// ─── Component ────────────────────────────────────────────────

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemTypes: SidebarItemType[];
  initialTypeId?: string;
}

export function CreateItemDialog({
  open,
  onOpenChange,
  itemTypes,
  initialTypeId,
}: CreateItemDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const creatableTypes = itemTypes.filter((t) =>
    CREATABLE_TYPES.includes(t.name.toLowerCase())
  );

  const [selectedTypeId, setSelectedTypeId] = useState<string>(
    creatableTypes[0]?.id ?? ""
  );
  const [form, setForm] = useState<FormState>(emptyForm);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const selectedType = creatableTypes.find((t) => t.id === selectedTypeId);

  // Reset form and apply preselected type each time the dialog opens
  useEffect(() => {
    if (open) {
      setForm(emptyForm);
      setUploadedFile(null);
      setSelectedTypeId(initialTypeId ?? creatableTypes[0]?.id ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setForm(emptyForm);
      setUploadedFile(null);
      setSelectedTypeId(creatableTypes[0]?.id ?? "");
    }
    onOpenChange(next);
  }

  function patch(field: keyof FormState) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit() {
    if (!selectedType) return;

    const tags = form.tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    startTransition(async () => {
      const result = await createItem({
        itemTypeId: selectedType.id,
        typeName: selectedType.name,
        title: form.title,
        description: form.description || null,
        content: form.content || null,
        url: form.url || null,
        language: form.language || null,
        tags,
        fileUrl: uploadedFile?.key ?? null,
        fileName: uploadedFile?.fileName ?? null,
        fileSize: uploadedFile?.fileSize ?? null,
      });

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Item created");
      handleOpenChange(false);
      router.refresh();
    });
  }

  const isLinkType = selectedType ? showUrl(selectedType.name) : false;
  const isUploadType = selectedType ? needsFileUpload(selectedType.name) : false;

  const canSubmit =
    form.title.trim().length > 0 &&
    (!isLinkType || form.url.trim().length > 0) &&
    (!isUploadType || uploadedFile !== null) &&
    !isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Item</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type selector */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Type
            </p>
            <div className="flex flex-wrap gap-2">
              {creatableTypes.map((type) => {
                const Icon = iconMap[type.icon];
                const isSelected = type.id === selectedTypeId;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => {
                      setSelectedTypeId(type.id);
                      setUploadedFile(null);
                    }}
                    className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                    style={
                      isSelected
                        ? {
                            backgroundColor: type.color + "20",
                            borderColor: type.color + "60",
                            color: type.color,
                          }
                        : {
                            borderColor: "var(--border)",
                            color: "var(--muted-foreground)",
                          }
                    }
                  >
                    {Icon && <Icon className="size-3" />}
                    {type.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.title}
              onChange={patch("title")}
              placeholder="Item title"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Description
            </label>
            <Textarea
              value={form.description}
              onChange={patch("description")}
              placeholder="Optional description"
              rows={2}
            />
          </div>

          {/* File upload — file, image types */}
          {selectedType && needsFileUpload(selectedType.name) && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                File <span className="text-destructive">*</span>
              </label>
              <FileUpload
                itemTypeName={
                  isImageType(selectedType.name) ? "image" : "file"
                }
                uploaded={uploadedFile}
                onUpload={setUploadedFile}
                onClear={() => setUploadedFile(null)}
              />
            </div>
          )}

          {/* Content — snippet, prompt, command, note */}
          {selectedType && showContent(selectedType.name) && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Content
              </label>
              {isCodeType(selectedType.name) ? (
                <CodeEditor
                  value={form.content}
                  language={form.language || undefined}
                  onChange={(val) =>
                    setForm((prev) => ({ ...prev, content: val }))
                  }
                />
              ) : isMarkdownType(selectedType.name) ? (
                <MarkdownEditor
                  value={form.content}
                  onChange={(val) =>
                    setForm((prev) => ({ ...prev, content: val }))
                  }
                />
              ) : (
                <Textarea
                  value={form.content}
                  onChange={patch("content")}
                  placeholder="Content"
                  rows={5}
                />
              )}
            </div>
          )}

          {/* URL — link only */}
          {selectedType && showUrl(selectedType.name) && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                URL <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.url}
                onChange={patch("url")}
                placeholder="https://..."
                type="url"
              />
            </div>
          )}

          {/* Language — snippet, command */}
          {selectedType && showLanguage(selectedType.name) && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-foreground">
                Language
              </label>
              <Input
                value={form.language}
                onChange={patch("language")}
                placeholder="e.g. typescript"
              />
            </div>
          )}

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
              Tags
            </label>
            <Input
              value={form.tagsRaw}
              onChange={patch("tagsRaw")}
              placeholder="react, hooks, typescript"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Comma-separated
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            size="sm"
          >
            {isPending ? "Creating…" : "Create item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
