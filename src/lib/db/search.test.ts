import { describe, it, expect } from "vitest";
import { buildContentPreview } from "./search";

describe("buildContentPreview", () => {
  it("returns content when both content and description are present", () => {
    expect(buildContentPreview("content text", "description text")).toBe("content text");
  });

  it("falls back to description when content is null", () => {
    expect(buildContentPreview(null, "description text")).toBe("description text");
  });

  it("returns null when both are null", () => {
    expect(buildContentPreview(null, null)).toBeNull();
  });

  it("truncates content to 100 characters by default", () => {
    const long = "a".repeat(150);
    expect(buildContentPreview(long, null)).toBe("a".repeat(100));
  });

  it("truncates description to 100 characters when content is null", () => {
    const long = "b".repeat(150);
    expect(buildContentPreview(null, long)).toBe("b".repeat(100));
  });

  it("respects custom maxLength", () => {
    expect(buildContentPreview("hello world", null, 5)).toBe("hello");
  });

  it("returns short content unchanged", () => {
    expect(buildContentPreview("short", "desc")).toBe("short");
  });
});
