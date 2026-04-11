import { describe, it, expect } from "vitest";
import { cn, trimOrNull } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("deduplicates conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("trimOrNull", () => {
  it("returns null for null", () => {
    expect(trimOrNull(null)).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(trimOrNull(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(trimOrNull("")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(trimOrNull("   \t\n")).toBeNull();
  });

  it("trims surrounding whitespace from a non-empty string", () => {
    expect(trimOrNull("  hello  ")).toBe("hello");
  });

  it("returns the value unchanged when already trimmed", () => {
    expect(trimOrNull("hello")).toBe("hello");
  });
});
