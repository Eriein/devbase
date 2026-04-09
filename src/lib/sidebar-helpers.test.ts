import { describe, it, expect } from "vitest";
import {
  isItemTypeActive,
  sortCollectionsForSidebar,
  formatItemCount,
} from "./sidebar-helpers";
import type { CollectionWithTypes } from "@/lib/db/collections";

// ─── isItemTypeActive ─────────────────────────────────────────

describe("isItemTypeActive", () => {
  it("matches the exact type listing path", () => {
    expect(isItemTypeActive("/items/snippets", "snippet")).toBe(true);
  });

  it("matches a deeper path under the type listing", () => {
    expect(isItemTypeActive("/items/snippets/abc-123", "snippet")).toBe(true);
  });

  it("does not match a different type whose name is a prefix", () => {
    // /items/notes should NOT match "note" when we're on /items/notebooks
    expect(isItemTypeActive("/items/notebooks", "note")).toBe(false);
  });

  it("does not match the dashboard root", () => {
    expect(isItemTypeActive("/dashboard", "snippet")).toBe(false);
  });

  it("is case-insensitive for the type name", () => {
    expect(isItemTypeActive("/items/snippets", "Snippet")).toBe(true);
    expect(isItemTypeActive("/items/snippets", "SNIPPET")).toBe(true);
  });

  it("returns false for empty inputs", () => {
    expect(isItemTypeActive("", "snippet")).toBe(false);
    expect(isItemTypeActive("/items/snippets", "")).toBe(false);
  });

  it("does not match a sibling /items/<other> path", () => {
    expect(isItemTypeActive("/items/prompts", "snippet")).toBe(false);
  });
});

// ─── sortCollectionsForSidebar ────────────────────────────────

function makeCollection(
  id: string,
  isFavorite: boolean,
  daysAgo: number,
): CollectionWithTypes {
  return {
    id,
    name: `Collection ${id}`,
    description: null,
    isFavorite,
    updatedAt: new Date(2026, 0, 10 - daysAgo),
    itemCount: 1,
    typeIcons: [],
    dominantColor: "#888",
  };
}

describe("sortCollectionsForSidebar", () => {
  it("returns empty arrays for an empty input", () => {
    const result = sortCollectionsForSidebar([]);
    expect(result.favorites).toEqual([]);
    expect(result.recent).toEqual([]);
    expect(result.all).toEqual([]);
  });

  it("sorts by updatedAt descending", () => {
    const input = [
      makeCollection("old", false, 5),
      makeCollection("new", false, 0),
      makeCollection("mid", false, 2),
    ];
    const result = sortCollectionsForSidebar(input);
    expect(result.all.map((c) => c.id)).toEqual(["new", "mid", "old"]);
  });

  it("extracts only favorites into the favorites slot", () => {
    const input = [
      makeCollection("a", true, 0),
      makeCollection("b", false, 1),
      makeCollection("c", true, 2),
    ];
    const result = sortCollectionsForSidebar(input);
    expect(result.favorites.map((c) => c.id)).toEqual(["a", "c"]);
  });

  it("respects favoritesLimit and recentLimit", () => {
    const input = Array.from({ length: 10 }, (_, i) =>
      makeCollection(`c${i}`, true, i),
    );
    const result = sortCollectionsForSidebar(input, {
      favoritesLimit: 3,
      recentLimit: 4,
    });
    expect(result.favorites).toHaveLength(3);
    expect(result.recent).toHaveLength(4);
  });

  it("does not mutate the input array", () => {
    const input = [
      makeCollection("a", false, 2),
      makeCollection("b", false, 0),
    ];
    const originalOrder = input.map((c) => c.id);
    sortCollectionsForSidebar(input);
    expect(input.map((c) => c.id)).toEqual(originalOrder);
  });
});

// ─── formatItemCount ──────────────────────────────────────────

describe("formatItemCount", () => {
  it("formats zero", () => {
    expect(formatItemCount(0)).toBe("0");
  });

  it("formats small counts as plain numbers", () => {
    expect(formatItemCount(7)).toBe("7");
    expect(formatItemCount(123)).toBe("123");
  });

  it("formats 999 as 999", () => {
    expect(formatItemCount(999)).toBe("999");
  });

  it("caps counts above 999 to 999+", () => {
    expect(formatItemCount(1000)).toBe("999+");
    expect(formatItemCount(50_000)).toBe("999+");
  });

  it("handles negative numbers by returning 0", () => {
    expect(formatItemCount(-5)).toBe("0");
  });

  it("handles non-finite numbers by returning 0", () => {
    expect(formatItemCount(Number.NaN)).toBe("0");
    expect(formatItemCount(Number.POSITIVE_INFINITY)).toBe("0");
  });

  it("floors fractional counts", () => {
    expect(formatItemCount(12.7)).toBe("12");
  });
});
