import { describe, it, expect } from "vitest";
import {
  validateAutoTagsInput,
  buildTagPromptText,
  parseTagsResponse,
  MAX_TAGS,
} from "./ai-tags-validation";
import { AI_MAX_CONTENT_LENGTH } from "./constants";

// ─── validateAutoTagsInput ──────────────────────────────────

describe("validateAutoTagsInput", () => {
  it("accepts valid input with title only", () => {
    const result = validateAutoTagsInput({ title: "My Snippet" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("My Snippet");
    }
  });

  it("accepts valid input with all fields", () => {
    const result = validateAutoTagsInput({
      title: "My Snippet",
      content: "const x = 1;",
      description: "A simple snippet",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.title).toBe("My Snippet");
      expect(result.data.content).toBe("const x = 1;");
      expect(result.data.description).toBe("A simple snippet");
    }
  });

  it("accepts null content and description", () => {
    const result = validateAutoTagsInput({
      title: "My Snippet",
      content: null,
      description: null,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects missing title", () => {
    const result = validateAutoTagsInput({ content: "some code" });
    expect(result.ok).toBe(false);
  });

  it("rejects empty title", () => {
    const result = validateAutoTagsInput({ title: "" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBeDefined();
    }
  });

  it("rejects non-object input", () => {
    const result = validateAutoTagsInput("not an object");
    expect(result.ok).toBe(false);
  });
});

// ─── buildTagPromptText ─────────────────────────────────────

describe("buildTagPromptText", () => {
  it("includes only title when no content or description", () => {
    const result = buildTagPromptText({ title: "useDebounce Hook" });
    expect(result).toBe("Title: useDebounce Hook");
  });

  it("includes title and description", () => {
    const result = buildTagPromptText({
      title: "useDebounce Hook",
      description: "A custom React hook",
    });
    expect(result).toBe(
      "Title: useDebounce Hook\nDescription: A custom React hook"
    );
  });

  it("includes title, description, and content", () => {
    const result = buildTagPromptText({
      title: "useDebounce Hook",
      description: "A custom React hook",
      content: "export function useDebounce() {}",
    });
    expect(result).toContain("Title: useDebounce Hook");
    expect(result).toContain("Description: A custom React hook");
    expect(result).toContain("Content: export function useDebounce() {}");
  });

  it("truncates content exceeding AI_MAX_CONTENT_LENGTH", () => {
    const longContent = "a".repeat(AI_MAX_CONTENT_LENGTH + 500);
    const result = buildTagPromptText({
      title: "Long Content",
      content: longContent,
    });
    expect(result).toContain("Content: " + "a".repeat(AI_MAX_CONTENT_LENGTH) + "...");
    expect(result).not.toContain("a".repeat(AI_MAX_CONTENT_LENGTH + 1));
  });

  it("does not truncate content at exactly AI_MAX_CONTENT_LENGTH", () => {
    const exactContent = "b".repeat(AI_MAX_CONTENT_LENGTH);
    const result = buildTagPromptText({
      title: "Exact",
      content: exactContent,
    });
    expect(result).toContain("Content: " + exactContent);
    expect(result).not.toContain("...");
  });

  it("skips null content and description", () => {
    const result = buildTagPromptText({
      title: "Title Only",
      content: null,
      description: null,
    });
    expect(result).toBe("Title: Title Only");
    expect(result).not.toContain("Content:");
    expect(result).not.toContain("Description:");
  });
});

// ─── parseTagsResponse ──────────────────────────────────────

describe("parseTagsResponse", () => {
  it("parses {tags: [...]} format", () => {
    const result = parseTagsResponse('{"tags": ["react", "hooks", "typescript"]}');
    expect(result).toEqual(["react", "hooks", "typescript"]);
  });

  it("parses bare [...] array format", () => {
    const result = parseTagsResponse('["react", "hooks"]');
    expect(result).toEqual(["react", "hooks"]);
  });

  it("normalizes tags to lowercase", () => {
    const result = parseTagsResponse('{"tags": ["React", "TypeScript", "HOOKS"]}');
    expect(result).toEqual(["react", "typescript", "hooks"]);
  });

  it("trims whitespace from tags", () => {
    const result = parseTagsResponse('{"tags": [" react ", " hooks "]}');
    expect(result).toEqual(["react", "hooks"]);
  });

  it("filters out empty strings", () => {
    const result = parseTagsResponse('{"tags": ["react", "", "  ", "hooks"]}');
    expect(result).toEqual(["react", "hooks"]);
  });

  it("filters out non-string values", () => {
    const result = parseTagsResponse('{"tags": ["react", 42, null, true, "hooks"]}');
    expect(result).toEqual(["react", "hooks"]);
  });

  it("limits to MAX_TAGS", () => {
    const tags = Array.from({ length: 10 }, (_, i) => `tag${i}`);
    const result = parseTagsResponse(JSON.stringify({ tags }));
    expect(result).toHaveLength(MAX_TAGS);
    expect(result).toEqual(tags.slice(0, MAX_TAGS));
  });

  it("returns empty array for invalid JSON", () => {
    expect(parseTagsResponse("not json")).toEqual([]);
  });

  it("returns empty array for unexpected object shape", () => {
    expect(parseTagsResponse('{"labels": ["a", "b"]}')).toEqual([]);
  });

  it("returns empty array for empty tags array", () => {
    expect(parseTagsResponse('{"tags": []}')).toEqual([]);
  });

  it("returns empty array for null input", () => {
    expect(parseTagsResponse("null")).toEqual([]);
  });
});
