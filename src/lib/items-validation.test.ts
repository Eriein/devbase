import { describe, it, expect } from "vitest";
import { validateUpdateItem } from "./items-validation";

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
