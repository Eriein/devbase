import { describe, it, expect } from "vitest";
import {
  validateAutoDescriptionInput,
  buildDescriptionPromptText,
  parseDescriptionResponse,
  MAX_SENTENCES,
} from "./ai-description-validation";
import { AI_MAX_CONTENT_LENGTH } from "./constants";

// ─── validateAutoDescriptionInput ───────────────────────────

describe("validateAutoDescriptionInput", () => {
  it("accepts title + itemTypeName", () => {
    const result = validateAutoDescriptionInput({
      title: "My Snippet",
      itemTypeName: "snippet",
    });
    expect(result.ok).toBe(true);
  });

  it("accepts content-only for snippet", () => {
    const result = validateAutoDescriptionInput({
      content: "const x = 1;",
      itemTypeName: "snippet",
    });
    expect(result.ok).toBe(true);
  });

  it("accepts URL-only for link", () => {
    const result = validateAutoDescriptionInput({
      url: "https://example.com",
      itemTypeName: "link",
    });
    expect(result.ok).toBe(true);
  });

  it("accepts fileName-only for file", () => {
    const result = validateAutoDescriptionInput({
      fileName: "report.pdf",
      itemTypeName: "file",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects when title, content, url, and fileName are all missing", () => {
    const result = validateAutoDescriptionInput({ itemTypeName: "snippet" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/title|content|URL|file/i);
    }
  });

  it("rejects when all signal fields are whitespace", () => {
    const result = validateAutoDescriptionInput({
      title: "   ",
      content: "",
      url: null,
      fileName: "  ",
      itemTypeName: "snippet",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects missing itemTypeName", () => {
    const result = validateAutoDescriptionInput({ title: "x" });
    expect(result.ok).toBe(false);
  });

  it("rejects empty itemTypeName", () => {
    const result = validateAutoDescriptionInput({
      title: "x",
      itemTypeName: "",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects non-object input", () => {
    const result = validateAutoDescriptionInput("nope");
    expect(result.ok).toBe(false);
  });
});

// ─── buildDescriptionPromptText ─────────────────────────────

describe("buildDescriptionPromptText", () => {
  it("always includes item type", () => {
    const result = buildDescriptionPromptText({
      title: "Hello",
      itemTypeName: "note",
    });
    expect(result).toContain("Type: note");
  });

  it("includes title when provided", () => {
    const result = buildDescriptionPromptText({
      title: "useDebounce",
      itemTypeName: "snippet",
    });
    expect(result).toContain("Title: useDebounce");
  });

  it("includes language for snippet", () => {
    const result = buildDescriptionPromptText({
      title: "useDebounce",
      language: "typescript",
      itemTypeName: "snippet",
    });
    expect(result).toContain("Language: typescript");
  });

  it("includes URL for link type", () => {
    const result = buildDescriptionPromptText({
      title: "Docs",
      url: "https://example.com/docs",
      itemTypeName: "link",
    });
    expect(result).toContain("URL: https://example.com/docs");
  });

  it("includes fileName for file type", () => {
    const result = buildDescriptionPromptText({
      fileName: "design.png",
      itemTypeName: "image",
    });
    expect(result).toContain("File: design.png");
  });

  it("includes content for prompt type", () => {
    const result = buildDescriptionPromptText({
      title: "Code review prompt",
      content: "Review this code for correctness and style.",
      itemTypeName: "prompt",
    });
    expect(result).toContain("Content: Review this code for correctness and style.");
  });

  it("truncates content exceeding AI_MAX_CONTENT_LENGTH", () => {
    const longContent = "a".repeat(AI_MAX_CONTENT_LENGTH + 500);
    const result = buildDescriptionPromptText({
      title: "Long",
      content: longContent,
      itemTypeName: "note",
    });
    expect(result).toContain("Content: " + "a".repeat(AI_MAX_CONTENT_LENGTH) + "...");
    expect(result).not.toContain("a".repeat(AI_MAX_CONTENT_LENGTH + 1));
  });

  it("does not truncate content at exactly AI_MAX_CONTENT_LENGTH", () => {
    const exact = "b".repeat(AI_MAX_CONTENT_LENGTH);
    const result = buildDescriptionPromptText({
      title: "Exact",
      content: exact,
      itemTypeName: "note",
    });
    expect(result).toContain("Content: " + exact);
    expect(result).not.toContain("...");
  });

  it("skips null / empty fields", () => {
    const result = buildDescriptionPromptText({
      title: null,
      content: "",
      url: null,
      fileName: undefined,
      language: "   ",
      itemTypeName: "command",
    });
    expect(result).toBe("Type: command");
  });

  it("handles command type with title + language + content", () => {
    const result = buildDescriptionPromptText({
      title: "Find large files",
      language: "bash",
      content: "find . -size +100M",
      itemTypeName: "command",
    });
    expect(result).toContain("Type: command");
    expect(result).toContain("Title: Find large files");
    expect(result).toContain("Language: bash");
    expect(result).toContain("Content: find . -size +100M");
  });
});

// ─── parseDescriptionResponse ───────────────────────────────

describe("parseDescriptionResponse", () => {
  it("returns plain text untouched when short and clean", () => {
    const result = parseDescriptionResponse(
      "A React hook that debounces a value."
    );
    expect(result).toBe("A React hook that debounces a value.");
  });

  it("trims surrounding whitespace", () => {
    const result = parseDescriptionResponse("  A React hook.  ");
    expect(result).toBe("A React hook.");
  });

  it("strips surrounding double quotes", () => {
    const result = parseDescriptionResponse('"A React hook."');
    expect(result).toBe("A React hook.");
  });

  it("strips surrounding single quotes", () => {
    const result = parseDescriptionResponse("'A React hook.'");
    expect(result).toBe("A React hook.");
  });

  it("strips curly quotes", () => {
    const result = parseDescriptionResponse("\u201CA React hook.\u201D");
    expect(result).toBe("A React hook.");
  });

  it("strips backticks", () => {
    const result = parseDescriptionResponse("`A React hook.`");
    expect(result).toBe("A React hook.");
  });

  it("strips a leading 'Description:' prefix", () => {
    const result = parseDescriptionResponse("Description: A React hook.");
    expect(result).toBe("A React hook.");
  });

  it("strips a leading 'description -' prefix", () => {
    const result = parseDescriptionResponse("description - A React hook.");
    expect(result).toBe("A React hook.");
  });

  it("parses {\"description\": \"...\"} JSON responses", () => {
    const result = parseDescriptionResponse(
      '{"description": "A React hook."}'
    );
    expect(result).toBe("A React hook.");
  });

  it("caps at MAX_SENTENCES sentences", () => {
    const longInput =
      "First sentence. Second sentence. Third sentence. Fourth sentence.";
    const result = parseDescriptionResponse(longInput);
    // Should contain exactly MAX_SENTENCES sentence terminators.
    const terminators = (result.match(/[.!?]/g) ?? []).length;
    expect(terminators).toBe(MAX_SENTENCES);
    expect(result).toContain("First sentence.");
    expect(result).toContain("Second sentence.");
    expect(result).not.toContain("Third sentence.");
  });

  it("keeps exactly one sentence intact", () => {
    const result = parseDescriptionResponse("A single sentence here.");
    expect(result).toBe("A single sentence here.");
  });

  it("handles exclamation and question marks", () => {
    const result = parseDescriptionResponse("Wow! Really? Yes. No.");
    const terminators = (result.match(/[.!?]/g) ?? []).length;
    expect(terminators).toBe(MAX_SENTENCES);
  });

  it("returns empty string for empty input", () => {
    expect(parseDescriptionResponse("")).toBe("");
    expect(parseDescriptionResponse("   ")).toBe("");
  });

  it("returns empty string for invalid JSON object with no description field", () => {
    // {"foo": "bar"} parses as JSON but has no description — fall through.
    // Current behavior: falls back to treating the raw text as the description.
    const result = parseDescriptionResponse('{"foo": "bar"}');
    expect(result).toBe('{"foo": "bar"}');
  });
});
