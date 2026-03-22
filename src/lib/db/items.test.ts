import { describe, it, expect } from "vitest";
import { mapItem, mapItemDetail } from "./items";

// ─── Fixtures ─────────────────────────────────────────────────

const baseRaw = {
  id: "item-1",
  title: "Test Item",
  contentType: "text",
  content: "some content",
  fileUrl: null,
  url: null,
  isFavorite: false,
  isPinned: true,
  updatedAt: new Date("2026-01-15"),
  itemType: { id: "type-1", name: "Snippet", icon: "Code", color: "#3b82f6" },
  tags: [
    { tag: { id: "tag-1", name: "react" } },
    { tag: { id: "tag-2", name: "hooks" } },
  ],
};

const detailRaw = {
  ...baseRaw,
  description: "A test snippet",
  language: "typescript",
  fileName: null,
  fileSize: null,
  createdAt: new Date("2026-01-10"),
  collections: [
    { collection: { id: "col-1", name: "React Patterns" } },
    { collection: { id: "col-2", name: "AI Workflows" } },
  ],
};

// ─── mapItem ──────────────────────────────────────────────────

describe("mapItem", () => {
  it("flattens join-table tags into plain objects", () => {
    const result = mapItem(baseRaw);

    expect(result.tags).toEqual([
      { id: "tag-1", name: "react" },
      { id: "tag-2", name: "hooks" },
    ]);
  });

  it("preserves all other fields unchanged", () => {
    const result = mapItem(baseRaw);

    expect(result.id).toBe("item-1");
    expect(result.title).toBe("Test Item");
    expect(result.isPinned).toBe(true);
    expect(result.isFavorite).toBe(false);
    expect(result.itemType.name).toBe("Snippet");
  });

  it("handles empty tags array", () => {
    const result = mapItem({ ...baseRaw, tags: [] });
    expect(result.tags).toEqual([]);
  });
});

// ─── mapItemDetail ────────────────────────────────────────────

describe("mapItemDetail", () => {
  it("flattens both tags and collections join tables", () => {
    const result = mapItemDetail(detailRaw);

    expect(result.tags).toEqual([
      { id: "tag-1", name: "react" },
      { id: "tag-2", name: "hooks" },
    ]);
    expect(result.collections).toEqual([
      { id: "col-1", name: "React Patterns" },
      { id: "col-2", name: "AI Workflows" },
    ]);
  });

  it("includes detail-specific fields", () => {
    const result = mapItemDetail(detailRaw);

    expect(result.description).toBe("A test snippet");
    expect(result.language).toBe("typescript");
    expect(result.createdAt).toEqual(new Date("2026-01-10"));
  });

  it("handles empty collections and tags", () => {
    const result = mapItemDetail({
      ...detailRaw,
      tags: [],
      collections: [],
    });

    expect(result.tags).toEqual([]);
    expect(result.collections).toEqual([]);
  });

  it("handles null optional fields", () => {
    const result = mapItemDetail({
      ...detailRaw,
      description: null,
      language: null,
      content: null,
    });

    expect(result.description).toBeNull();
    expect(result.language).toBeNull();
    expect(result.content).toBeNull();
  });
});
