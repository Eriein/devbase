import {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link as LinkIcon,
} from "lucide-react";
import type { ComponentType, CSSProperties } from "react";

export const iconMap: Record<
  string,
  ComponentType<{ className?: string; style?: CSSProperties }>
> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

export function showContent(typeName: string): boolean {
  return ["snippet", "prompt", "command", "note"].includes(typeName.toLowerCase());
}

export function showLanguage(typeName: string): boolean {
  return ["snippet", "command"].includes(typeName.toLowerCase());
}

export function isCodeType(typeName: string): boolean {
  return ["snippet", "command"].includes(typeName.toLowerCase());
}

export function isMarkdownType(typeName: string): boolean {
  return ["note", "prompt"].includes(typeName.toLowerCase());
}

export function showUrl(typeName: string): boolean {
  return typeName.toLowerCase() === "link";
}

export function isFileType(typeName: string): boolean {
  return typeName.toLowerCase() === "file";
}

export function isImageType(typeName: string): boolean {
  return typeName.toLowerCase() === "image";
}

export function needsFileUpload(typeName: string): boolean {
  return isFileType(typeName) || isImageType(typeName);
}
