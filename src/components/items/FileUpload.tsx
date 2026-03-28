"use client";

import { useRef, useState } from "react";
import { Upload, X, File, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { IMAGE_CONSTRAINTS, FILE_CONSTRAINTS, validateUploadByItemType } from "@/lib/upload-validation";
import { cn, formatFileSize } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────

export type UploadedFile = {
  key: string;
  fileName: string;
  fileSize: number;
  contentType: string;
};

interface FileUploadProps {
  itemTypeName: "file" | "image";
  onUpload: (uploaded: UploadedFile) => void;
  onClear: () => void;
  uploaded: UploadedFile | null;
}

// ─── Component ────────────────────────────────────────────────

export function FileUpload({ itemTypeName, onUpload, onClear, uploaded }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const accept =
    itemTypeName === "image" ? IMAGE_CONSTRAINTS.accept : FILE_CONSTRAINTS.accept;

  const Icon = itemTypeName === "image" ? ImageIcon : File;

  function handleFile(file: File) {
    setError(null);

    const validation = validateUploadByItemType(itemTypeName, {
      type: file.type,
      size: file.size,
    });

    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("itemType", itemTypeName);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      setProgress(null);
      if (xhr.status === 200) {
        try {
          const data = JSON.parse(xhr.responseText) as UploadedFile;
          onUpload(data);
        } catch {
          setError("Upload failed: invalid server response");
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText) as { error?: string };
          setError(data.error ?? "Upload failed");
        } catch {
          setError("Upload failed");
        }
      }
    };

    xhr.onerror = () => {
      setProgress(null);
      setError("Upload failed: network error");
    };

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
    setProgress(0);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected after clearing
    e.target.value = "";
  }

  // ── Uploaded state ──────────────────────────────────────────

  if (uploaded) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
        <CheckCircle2 className="size-5 shrink-0 text-green-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">
            {uploaded.fileName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(uploaded.fileSize)}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  // ── Drop zone ────────────────────────────────────────────────

  return (
    <div className="space-y-2">
      <button
        type="button"
        className={cn(
          "relative flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50 hover:bg-muted/20"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {progress !== null ? (
          <>
            <div className="size-8 text-muted-foreground">
              <Upload className="size-8 animate-bounce" />
            </div>
            <p className="text-sm text-muted-foreground">
              Uploading… {progress}%
            </p>
            <div className="absolute bottom-0 left-0 h-1 rounded-b-lg bg-primary transition-all" style={{ width: `${progress}%` }} />
          </>
        ) : (
          <>
            <Icon className="size-8 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop file here or click to browse
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {itemTypeName === "image"
                  ? "PNG, JPG, GIF, WebP, SVG — max 5 MB"
                  : "PDF, TXT, MD, JSON, YAML, XML, CSV, TOML — max 10 MB"}
              </p>
            </div>
          </>
        )}
      </button>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
