import { describe, it, expect } from "vitest";
import { validateToggleItemFavoriteInput, validateToggleCollectionFavoriteInput } from "./favorites-validation";

describe("validateToggleItemFavoriteInput", () => {
  it("accepts a valid item ID", () => {
    const result = validateToggleItemFavoriteInput({ itemId: "item-123" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.itemId).toBe("item-123");
    }
  });

  it("rejects empty item ID", () => {
    const result = validateToggleItemFavoriteInput("");
    expect(result.ok).toBe(false);
  });

  it("rejects whitespace-only item ID", () => {
    const result = validateToggleItemFavoriteInput("   ");
    expect(result.ok).toBe(false);
  });
});

describe("validateToggleCollectionFavoriteInput", () => {
  it("accepts a valid collection ID", () => {
    const result = validateToggleCollectionFavoriteInput({ id: "col-456" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe("col-456");
    }
  });

  it("rejects empty collection ID", () => {
    const result = validateToggleCollectionFavoriteInput("");
    expect(result.ok).toBe(false);
  });
});
