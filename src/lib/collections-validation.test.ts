import { describe, it, expect } from "vitest";
import { validateCreateCollection } from "./collections-validation";

// ─── validateCreateCollection ─────────────────────────────────

describe("validateCreateCollection", () => {
  it("accepts a valid name with no description", () => {
    const result = validateCreateCollection({ name: "React Patterns" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("React Patterns");
      expect(result.data.description).toBeUndefined();
    }
  });

  it("accepts a valid name with a description", () => {
    const result = validateCreateCollection({
      name: "AI Workflows",
      description: "Useful prompts and pipelines",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("AI Workflows");
      expect(result.data.description).toBe("Useful prompts and pipelines");
    }
  });

  it("accepts null description", () => {
    const result = validateCreateCollection({ name: "DevOps", description: null });
    expect(result.ok).toBe(true);
  });

  it("trims whitespace from name", () => {
    const result = validateCreateCollection({ name: "  Trimmed  " });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Trimmed");
    }
  });

  it("rejects empty name", () => {
    const result = validateCreateCollection({ name: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/name.*required/i);
    }
  });

  it("rejects whitespace-only name", () => {
    const result = validateCreateCollection({ name: "   " });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/name.*required/i);
    }
  });

  it("rejects name over 100 characters", () => {
    const result = validateCreateCollection({ name: "a".repeat(101) });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/too long/i);
    }
  });

  it("rejects description over 500 characters", () => {
    const result = validateCreateCollection({
      name: "Valid",
      description: "x".repeat(501),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/too long/i);
    }
  });

  it("rejects missing name field", () => {
    const result = validateCreateCollection({});
    expect(result.ok).toBe(false);
  });

  it("rejects non-string name", () => {
    const result = validateCreateCollection({ name: 42 });
    expect(result.ok).toBe(false);
  });
});
