import { z } from "zod";

// ─── Create schema ─────────────────────────────────────────────

export const createItemSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required"),
    itemTypeId: z.string().min(1, "Type is required"),
    typeName: z.string(), // used for conditional URL validation
    description: z.string().nullable().optional(),
    content: z.string().nullable().optional(),
    url: z
      .union([z.literal(""), z.url("Must be a valid URL")])
      .nullable()
      .optional()
      .transform((v) => (v === "" ? null : v)),
    language: z.string().nullable().optional(),
    tags: z.array(z.string().trim().min(1)),
    fileUrl: z.string().nullable().optional(),
    fileName: z.string().nullable().optional(),
    fileSize: z.number().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.typeName.toLowerCase() === "link" && !data.url) {
      ctx.addIssue({
        code: "custom",
        path: ["url"],
        message: "URL is required for link items",
      });
    }
    const isFileType = ["file", "image"].includes(data.typeName.toLowerCase());
    if (isFileType && !data.fileUrl) {
      ctx.addIssue({
        code: "custom",
        path: ["fileUrl"],
        message: "A file must be uploaded for this item type",
      });
    }
  });

export type CreateItemInput = z.infer<typeof createItemSchema>;

export function validateCreateItem(
  input: unknown
): { ok: true; data: CreateItemInput } | { ok: false; error: string } {
  const parsed = createItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  return { ok: true, data: parsed.data };
}

// ─── Schema ───────────────────────────────────────────────────

export const updateItemSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
  url: z
    .union([z.literal(""), z.url("Must be a valid URL")])
    .nullable()
    .optional()
    .transform((v) => (v === "" ? null : v)),
  language: z.string().nullable().optional(),
  tags: z.array(z.string().trim().min(1)),
});

export type UpdateItemInput = z.infer<typeof updateItemSchema>;

// ─── Pure validation helper ───────────────────────────────────

export function validateUpdateItem(
  input: unknown
): { ok: true; data: UpdateItemInput } | { ok: false; error: string } {
  const parsed = updateItemSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0].message };
  }
  return { ok: true, data: parsed.data };
}
