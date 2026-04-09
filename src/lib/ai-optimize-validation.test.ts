import { describe, it, expect } from "vitest";
import {
  validateOptimizePromptInput,
  buildOptimizePromptText,
  parseOptimizeResponse,
  MAX_CONTENT_LENGTH,
  OPTIMIZE_ITEM_TYPE,
} from "./ai-optimize-validation";

// ─── validateOptimizePromptInput ───────────────────────────────

describe("validateOptimizePromptInput", () => {
  it("accepts prompt with content", () => {
    const result = validateOptimizePromptInput({
      content: "Write a function to add two numbers",
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result.ok).toBe(true);
  });

  it("accepts Prompt with uppercase", () => {
    const result = validateOptimizePromptInput({
      content: "Create a React component",
      itemTypeName: "PROMPT",
      itemId: "123",
    });
    expect(result.ok).toBe(true);
  });

  it("accepts prompt with title", () => {
    const result = validateOptimizePromptInput({
      title: "Add function",
      content: "Write a function to add two numbers",
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects snippet type", () => {
    const result = validateOptimizePromptInput({
      content: "const x = 1;",
      itemTypeName: "snippet",
      itemId: "123",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/prompt/i);
    }
  });

  it("rejects command type", () => {
    const result = validateOptimizePromptInput({
      content: "ls -la",
      itemTypeName: "command",
      itemId: "123",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects note type", () => {
    const result = validateOptimizePromptInput({
      content: "some text",
      itemTypeName: "note",
      itemId: "123",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects empty content", () => {
    const result = validateOptimizePromptInput({
      content: "",
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects whitespace-only content", () => {
    const result = validateOptimizePromptInput({
      content: "   \n   ",
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects missing content", () => {
    const result = validateOptimizePromptInput({
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects missing itemTypeName", () => {
    const result = validateOptimizePromptInput({
      content: "Write a function",
      itemId: "123",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects empty itemTypeName", () => {
    const result = validateOptimizePromptInput({
      content: "Write a function",
      itemTypeName: "",
      itemId: "123",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects missing itemId", () => {
    const result = validateOptimizePromptInput({
      content: "Write a function",
      itemTypeName: "prompt",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects empty itemId", () => {
    const result = validateOptimizePromptInput({
      content: "Write a function",
      itemTypeName: "prompt",
      itemId: "",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects non-object input", () => {
    const result = validateOptimizePromptInput("nope");
    expect(result.ok).toBe(false);
  });

  it("rejects null input", () => {
    const result = validateOptimizePromptInput(null);
    expect(result.ok).toBe(false);
  });
});

// ─── buildOptimizePromptText ─────────────────────────────────

describe("buildOptimizePromptText", () => {
  it("includes optimization instructions", () => {
    const result = buildOptimizePromptText({
      content: "Write a function",
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result).toContain("more specific, clear, and actionable");
    expect(result).toContain("Add specific details");
  });

  it("includes title when provided", () => {
    const result = buildOptimizePromptText({
      title: "Add function",
      content: "Write a function to add two numbers",
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result).toContain("Title: Add function");
  });

  it("skips null/empty title", () => {
    const result = buildOptimizePromptText({
      title: null,
      content: "Write a function",
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result).not.toContain("Title:");
    expect(result).toContain("Original prompt:");
  });

  it("includes content after Original prompt label", () => {
    const result = buildOptimizePromptText({
      content: "Write a function to add two numbers",
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result).toContain("Original prompt:\nWrite a function to add two numbers");
  });

  it("truncates content exceeding MAX_CONTENT_LENGTH", () => {
    const longContent = "a".repeat(MAX_CONTENT_LENGTH + 500);
    const result = buildOptimizePromptText({
      content: longContent,
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result).toContain("a".repeat(MAX_CONTENT_LENGTH) + "...");
    expect(result).not.toContain("a".repeat(MAX_CONTENT_LENGTH + 1));
  });

  it("does not truncate content at exactly MAX_CONTENT_LENGTH", () => {
    const exact = "b".repeat(MAX_CONTENT_LENGTH);
    const result = buildOptimizePromptText({
      content: exact,
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result).toContain(exact);
    expect(result).not.toContain("...");
  });

  it("does not include itemTypeName in prompt (not relevant for optimization)", () => {
    const result = buildOptimizePromptText({
      content: "Write a function",
      itemTypeName: "prompt",
      itemId: "123",
    });
    expect(result).not.toContain("Type:");
  });
});

// ─── parseOptimizeResponse ────────────────────────────────────

describe("parseOptimizeResponse", () => {
  it("returns prompt text unchanged", () => {
    const input = "Write a function to add two numbers with clear variable names.";
    expect(parseOptimizeResponse(input)).toBe(input);
  });

  it("trims surrounding whitespace", () => {
    const result = parseOptimizeResponse("  Improved prompt.  ");
    expect(result).toBe("Improved prompt.");
  });

  it('parses {"optimized": "..."} JSON wrappers', () => {
    const result = parseOptimizeResponse(
      '{"optimized": "Write a function to add two numbers."}'
    );
    expect(result).toBe("Write a function to add two numbers.");
  });

  it('parses {"prompt": "..."} JSON wrappers', () => {
    const result = parseOptimizeResponse(
      '{"prompt": "Write a function to add two numbers."}'
    );
    expect(result).toBe("Write a function to add two numbers.");
  });

  it("falls through when JSON object has no optimized/prompt field", () => {
    const result = parseOptimizeResponse('{"foo": "bar"}');
    expect(result).toBe('{"foo": "bar"}');
  });

  it("strips a bare ``` fenced code block", () => {
    const result = parseOptimizeResponse(
      "```\nWrite a better prompt.\n```"
    );
    expect(result).toBe("Write a better prompt.");
  });

  it("strips a ```markdown fenced code block", () => {
    const result = parseOptimizeResponse(
      "```markdown\nOptimized version here.\n```"
    );
    expect(result).toBe("Optimized version here.");
  });

  it("strips a leading 'Optimized:' label", () => {
    const result = parseOptimizeResponse(
      "Optimized: Write a better prompt."
    );
    expect(result).toBe("Write a better prompt.");
  });

  it("strips a leading 'Optimized prompt:' label", () => {
    const result = parseOptimizeResponse(
      "Optimized prompt: Write a better prompt."
    );
    expect(result).toBe("Write a better prompt.");
  });

  it("strips a leading 'optimized -' label (lowercase)", () => {
    const result = parseOptimizeResponse(
      "optimized - Write a better prompt."
    );
    expect(result).toBe("Write a better prompt.");
  });

  it("strips straight double quotes", () => {
    const result = parseOptimizeResponse('"Write a better prompt."');
    expect(result).toBe("Write a better prompt.");
  });

  it("strips straight single quotes", () => {
    const result = parseOptimizeResponse("'Write a better prompt.'");
    expect(result).toBe("Write a better prompt.");
  });

  it("strips backtick quotes", () => {
    const result = parseOptimizeResponse("`Write a better prompt.`");
    expect(result).toBe("Write a better prompt.");
  });

  it("strips curly double quotes", () => {
    const result = parseOptimizeResponse("\u201cWrite a better prompt.\u201d");
    expect(result).toBe("Write a better prompt.");
  });

  it("strips curly single quotes", () => {
    const result = parseOptimizeResponse("\u2018Write a better prompt.\u2019");
    expect(result).toBe("Write a better prompt.");
  });

  it("returns empty string for empty input", () => {
    expect(parseOptimizeResponse("")).toBe("");
    expect(parseOptimizeResponse("   ")).toBe("");
  });

  it("handles JSON wrapper with content inside", () => {
    const result = parseOptimizeResponse(
      '{"optimized": "Improved prompt text."}'
    );
    expect(result).toBe("Improved prompt text.");
  });

  it("handles non-string input", () => {
    expect(parseOptimizeResponse(null)).toBe("");
    expect(parseOptimizeResponse(undefined)).toBe("");
    expect(parseOptimizeResponse(123 as unknown as string)).toBe("");
  });
});