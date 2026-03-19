import { describe, it, expect } from "vitest";
import { buildRateLimitError } from "./rate-limit";

describe("buildRateLimitError", () => {
  it("returns error with minutes until reset", () => {
    const result = buildRateLimitError("127.0.0.1", 120);
    expect(result.error).toContain("try again in");
    expect(result.minutesUntilReset).toBe(2);
  });

  it("rounds up partial minutes", () => {
    const result = buildRateLimitError("127.0.0.1", 90);
    expect(result.minutesUntilReset).toBe(2);
  });
});
