import { describe, it, expect } from "vitest";
import {
  validateExplainCodeInput,
  buildExplainPromptText,
  parseExplanationResponse,
} from "./ai-explain-validation";
import { AI_MAX_CONTENT_LENGTH } from "./constants";

// ─── validateExplainCodeInput ───────────────────────────────

describe("validateExplainCodeInput", () => {
  it("accepts snippet with content", () => {
    const result = validateExplainCodeInput({
      content: "const x = 1;",
      itemTypeName: "snippet",
    });
    expect(result.ok).toBe(true);
  });

  it("accepts command with content", () => {
    const result = validateExplainCodeInput({
      content: "ls -la",
      itemTypeName: "command",
    });
    expect(result.ok).toBe(true);
  });

  it("is case-insensitive on itemTypeName", () => {
    const result = validateExplainCodeInput({
      content: "echo hi",
      itemTypeName: "Command",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects note type", () => {
    const result = validateExplainCodeInput({
      content: "some text",
      itemTypeName: "note",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/snippet|command/i);
    }
  });

  it("rejects prompt type", () => {
    const result = validateExplainCodeInput({
      content: "do X",
      itemTypeName: "prompt",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects link type", () => {
    const result = validateExplainCodeInput({
      content: "https://example.com",
      itemTypeName: "link",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects empty content", () => {
    const result = validateExplainCodeInput({
      content: "",
      itemTypeName: "snippet",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects whitespace-only content", () => {
    const result = validateExplainCodeInput({
      content: "   \n   ",
      itemTypeName: "snippet",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects missing content", () => {
    const result = validateExplainCodeInput({ itemTypeName: "snippet" });
    expect(result.ok).toBe(false);
  });

  it("rejects missing itemTypeName", () => {
    const result = validateExplainCodeInput({ content: "const x = 1;" });
    expect(result.ok).toBe(false);
  });

  it("rejects empty itemTypeName", () => {
    const result = validateExplainCodeInput({
      content: "const x = 1;",
      itemTypeName: "",
    });
    expect(result.ok).toBe(false);
  });

  it("rejects non-object input", () => {
    const result = validateExplainCodeInput("nope");
    expect(result.ok).toBe(false);
  });
});

// ─── buildExplainPromptText ─────────────────────────────────

describe("buildExplainPromptText", () => {
  it("always includes item type lowercased", () => {
    const result = buildExplainPromptText({
      content: "const x = 1;",
      itemTypeName: "Snippet",
    });
    expect(result).toContain("Type: snippet");
  });

  it("includes language when provided", () => {
    const result = buildExplainPromptText({
      content: "const x = 1;",
      language: "typescript",
      itemTypeName: "snippet",
    });
    expect(result).toContain("Language: typescript");
  });

  it("includes title when provided", () => {
    const result = buildExplainPromptText({
      title: "Declare constant",
      content: "const x = 1;",
      itemTypeName: "snippet",
    });
    expect(result).toContain("Title: Declare constant");
  });

  it("always includes content after a newline", () => {
    const result = buildExplainPromptText({
      content: "const x = 1;\nconsole.log(x);",
      itemTypeName: "snippet",
    });
    expect(result).toContain("Content:\nconst x = 1;\nconsole.log(x);");
  });

  it("truncates content exceeding AI_MAX_CONTENT_LENGTH", () => {
    const longContent = "a".repeat(AI_MAX_CONTENT_LENGTH + 500);
    const result = buildExplainPromptText({
      content: longContent,
      itemTypeName: "snippet",
    });
    expect(result).toContain("a".repeat(AI_MAX_CONTENT_LENGTH) + "...");
    expect(result).not.toContain("a".repeat(AI_MAX_CONTENT_LENGTH + 1));
  });

  it("does not truncate content at exactly AI_MAX_CONTENT_LENGTH", () => {
    const exact = "b".repeat(AI_MAX_CONTENT_LENGTH);
    const result = buildExplainPromptText({
      content: exact,
      itemTypeName: "snippet",
    });
    expect(result).toContain(exact);
    expect(result).not.toContain("...");
  });

  it("skips null / empty language and title", () => {
    const result = buildExplainPromptText({
      title: null,
      language: "   ",
      content: "ls -la",
      itemTypeName: "command",
    });
    expect(result).not.toContain("Language:");
    expect(result).not.toContain("Title:");
    expect(result).toContain("Type: command");
    expect(result).toContain("Content:\nls -la");
  });

  it("orders fields: type, language, title, content", () => {
    const result = buildExplainPromptText({
      title: "Move files",
      language: "bash",
      content: "mv a b",
      itemTypeName: "command",
    });
    const typeIdx = result.indexOf("Type:");
    const langIdx = result.indexOf("Language:");
    const titleIdx = result.indexOf("Title:");
    const contentIdx = result.indexOf("Content:");
    expect(typeIdx).toBeLessThan(langIdx);
    expect(langIdx).toBeLessThan(titleIdx);
    expect(titleIdx).toBeLessThan(contentIdx);
  });
});

// ─── parseExplanationResponse ───────────────────────────────

describe("parseExplanationResponse", () => {
  it("returns plain markdown untouched", () => {
    const input =
      "This snippet declares a constant `x` and logs it.\n\nIt uses **const** to make x immutable.";
    expect(parseExplanationResponse(input)).toBe(input);
  });

  it("trims surrounding whitespace", () => {
    const result = parseExplanationResponse("  Hello world.  ");
    expect(result).toBe("Hello world.");
  });

  it('parses {"explanation": "..."} JSON wrappers', () => {
    const result = parseExplanationResponse(
      '{"explanation": "This command lists files."}'
    );
    expect(result).toBe("This command lists files.");
  });

  it("falls through when JSON object has no explanation field", () => {
    const result = parseExplanationResponse('{"foo": "bar"}');
    expect(result).toBe('{"foo": "bar"}');
  });

  it("strips a bare ``` fenced code block", () => {
    const result = parseExplanationResponse(
      "```\nThis is the explanation.\n```"
    );
    expect(result).toBe("This is the explanation.");
  });

  it("strips a ```markdown fenced code block", () => {
    const result = parseExplanationResponse(
      "```markdown\nThis is the explanation.\n\nSecond paragraph.\n```"
    );
    expect(result).toBe("This is the explanation.\n\nSecond paragraph.");
  });

  it("strips a leading 'Explanation:' label", () => {
    const result = parseExplanationResponse(
      "Explanation: This snippet returns true."
    );
    expect(result).toBe("This snippet returns true.");
  });

  it("strips a leading 'explanation -' label", () => {
    const result = parseExplanationResponse(
      "explanation - This snippet returns true."
    );
    expect(result).toBe("This snippet returns true.");
  });

  it("preserves internal fenced code blocks (only strips outer fence)", () => {
    const result = parseExplanationResponse(
      "The snippet does this:\n\n```js\nconst x = 1;\n```\n\nThat's it."
    );
    expect(result).toContain("```js");
    expect(result).toContain("const x = 1;");
    expect(result).toContain("That's it.");
  });

  it("does NOT sentence-cap multi-sentence explanations", () => {
    const input =
      "First sentence. Second sentence. Third sentence. Fourth sentence.";
    const result = parseExplanationResponse(input);
    expect(result).toBe(input);
  });

  it("returns empty string for empty input", () => {
    expect(parseExplanationResponse("")).toBe("");
    expect(parseExplanationResponse("   ")).toBe("");
  });

  it("handles JSON wrapper with fenced markdown inside", () => {
    const result = parseExplanationResponse(
      '{"explanation": "```\\nInner content.\\n```"}'
    );
    expect(result).toBe("Inner content.");
  });
});
