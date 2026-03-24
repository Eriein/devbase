import { describe, it, expect } from "vitest";
import { validateCreateItem, validateUpdateItem } from "./items-validation";

// ─── validateCreateItem ───────────────────────────────────────

const validSnippet = {
  title: "My Snippet",
  itemTypeId: "type-1",
  typeName: "Snippet",
  description: null,
  content: null,
  url: null,
  language: null,
  tags: [],
};

const validLink = {
  title: "Cool Link",
  itemTypeId: "type-5",
  typeName: "Link",
  description: null,
  content: null,
  url: "https://example.com",
  language: null,
  tags: [],
};

describe("validateCreateItem", () => {
  it("accepts a minimal valid snippet", () => {
    const result = validateCreateItem(validSnippet);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("My Snippet");
      expect(result.data.itemTypeId).toBe("type-1");
    }
  });

  it("accepts a valid link with URL", () => {
    const result = validateCreateItem(validLink);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.url).toBe("https://example.com");
    }
  });

  it("rejects link type when URL is missing", () => {
    const result = validateCreateItem({ ...validLink, url: null });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/url.*required/i);
    }
  });

  it("rejects link type when URL is empty string", () => {
    const result = validateCreateItem({ ...validLink, url: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/url.*required/i);
    }
  });

  it("accepts non-link type without URL", () => {
    const result = validateCreateItem({ ...validSnippet, typeName: "Prompt", url: null });
    expect(result.ok).toBe(true);
  });

  it("rejects an invalid URL", () => {
    const result = validateCreateItem({ ...validLink, url: "not-a-url" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/url/i);
    }
  });

  it("transforms empty string URL to null for non-link types", () => {
    const result = validateCreateItem({ ...validSnippet, url: "" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.url).toBeNull();
    }
  });

  it("rejects empty title", () => {
    const result = validateCreateItem({ ...validSnippet, title: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/title/i);
    }
  });

  it("rejects whitespace-only title", () => {
    const result = validateCreateItem({ ...validSnippet, title: "   " });
    expect(result.ok).toBe(false);
  });

  it("trims title before validation", () => {
    const result = validateCreateItem({ ...validSnippet, title: "  My Hook  " });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("My Hook");
    }
  });

  it("rejects missing itemTypeId", () => {
    const result = validateCreateItem({ ...validSnippet, itemTypeId: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/type/i);
    }
  });

  it("accepts tags array", () => {
    const result = validateCreateItem({ ...validSnippet, tags: ["react", "hooks"] });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.tags).toEqual(["react", "hooks"]);
    }
  });

  it("is case-insensitive for link typeName check", () => {
    const result = validateCreateItem({ ...validLink, typeName: "LINK", url: null });
    expect(result.ok).toBe(false);
  });
});

// ─── Fixtures ─────────────────────────────────────────────────

const validBase = {
  title: "My Snippet",
  description: null,
  content: null,
  url: null,
  language: null,
  tags: [],
};

// ─── validateUpdateItem ───────────────────────────────────────

describe("validateUpdateItem", () => {
  it("accepts a minimal valid input", () => {
    const result = validateUpdateItem(validBase);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("My Snippet");
      expect(result.data.tags).toEqual([]);
    }
  });

  it("accepts full input with all fields", () => {
    const result = validateUpdateItem({
      title: "React Hook",
      description: "A custom hook",
      content: "export function useX() {}",
      url: null,
      language: "typescript",
      tags: ["react", "hooks"],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.language).toBe("typescript");
      expect(result.data.tags).toEqual(["react", "hooks"]);
    }
  });

  it("rejects empty title", () => {
    const result = validateUpdateItem({ ...validBase, title: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/title/i);
    }
  });

  it("rejects whitespace-only title", () => {
    const result = validateUpdateItem({ ...validBase, title: "   " });
    expect(result.ok).toBe(false);
  });

  it("trims title before validation", () => {
    const result = validateUpdateItem({ ...validBase, title: "  My Hook  " });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("My Hook");
    }
  });

  it("accepts a valid URL", () => {
    const result = validateUpdateItem({
      ...validBase,
      url: "https://example.com",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.url).toBe("https://example.com");
    }
  });

  it("rejects an invalid URL", () => {
    const result = validateUpdateItem({ ...validBase, url: "not-a-url" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/url/i);
    }
  });

  it("transforms empty string URL to null", () => {
    const result = validateUpdateItem({ ...validBase, url: "" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.url).toBeNull();
    }
  });

  it("accepts empty tags array", () => {
    const result = validateUpdateItem({ ...validBase, tags: [] });
    expect(result.ok).toBe(true);
  });

  it("accepts valid tags array", () => {
    const result = validateUpdateItem({
      ...validBase,
      tags: ["typescript", "react"],
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.tags).toEqual(["typescript", "react"]);
    }
  });

  it("rejects missing title field", () => {
    const { title: _, ...withoutTitle } = validBase;
    const result = validateUpdateItem(withoutTitle);
    expect(result.ok).toBe(false);
  });
});
