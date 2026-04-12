import { describe, it, expect } from "vitest";
import { cn, trimOrNull, formatDate, formatLongDate, timeAgo } from "./utils";

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

describe("formatDate", () => {
  it("formats date as short date", () => {
    const result = formatDate(new Date("2026-04-15T12:00:00"));
    expect(result).toContain("Apr");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });

  it("handles Date objects", () => {
    const result = formatDate(new Date("2026-04-15T12:00:00"));
    expect(result).toContain("Apr");
  });
});

describe("formatLongDate", () => {
  it("formats date with full month name", () => {
    const result = formatLongDate(new Date("2026-04-15T12:00:00"));
    expect(result).toContain("April");
    expect(result).toContain("15");
    expect(result).toContain("2026");
  });
});

describe("timeAgo", () => {
  it("returns minutes for < 1 hour", () => {
    const now = new Date();
    const result = timeAgo(new Date(now.getTime() - 30 * 60000));
    expect(result).toBe("30m ago");
  });

  it("returns hours for < 24 hours", () => {
    const now = new Date();
    const result = timeAgo(new Date(now.getTime() - 5 * 60 * 60000));
    expect(result).toBe("5h ago");
  });

  it("returns days for >= 24 hours", () => {
    const result = timeAgo("2026-04-01");
    expect(result).toMatch(/\d+d ago/);
  });
});
