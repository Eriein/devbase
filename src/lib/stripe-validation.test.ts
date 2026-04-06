import { describe, it, expect } from "vitest";
import {
  isValidPlan,
  validateCheckoutEligibility,
  shouldCancelSubscription,
} from "./stripe-validation";

describe("isValidPlan", () => {
  it("returns true for monthly", () => {
    expect(isValidPlan("monthly")).toBe(true);
  });

  it("returns true for yearly", () => {
    expect(isValidPlan("yearly")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidPlan("")).toBe(false);
  });

  it("returns false for unknown plan", () => {
    expect(isValidPlan("weekly")).toBe(false);
  });

  it("returns false for annual (not a valid key)", () => {
    expect(isValidPlan("annual")).toBe(false);
  });
});

describe("validateCheckoutEligibility", () => {
  it("returns ok with plan for valid monthly plan", () => {
    const result = validateCheckoutEligibility("monthly", false);
    expect(result).toEqual({ ok: true, plan: "monthly" });
  });

  it("returns ok with plan for valid yearly plan", () => {
    const result = validateCheckoutEligibility("yearly", false);
    expect(result).toEqual({ ok: true, plan: "yearly" });
  });

  it("returns error for invalid plan", () => {
    const result = validateCheckoutEligibility("weekly", false);
    expect(result).toEqual({ ok: false, error: "Invalid plan" });
  });

  it("returns error for empty plan string", () => {
    const result = validateCheckoutEligibility("", false);
    expect(result).toEqual({ ok: false, error: "Invalid plan" });
  });

  it("returns error when user is already Pro", () => {
    const result = validateCheckoutEligibility("monthly", true);
    expect(result).toEqual({ ok: false, error: "Already subscribed" });
  });

  it("checks plan validity before Pro status", () => {
    const result = validateCheckoutEligibility("invalid", true);
    expect(result).toEqual({ ok: false, error: "Invalid plan" });
  });
});

describe("shouldCancelSubscription", () => {
  it("returns true for canceled", () => {
    expect(shouldCancelSubscription("canceled")).toBe(true);
  });

  it("returns true for unpaid", () => {
    expect(shouldCancelSubscription("unpaid")).toBe(true);
  });

  it("returns true for past_due", () => {
    expect(shouldCancelSubscription("past_due")).toBe(true);
  });

  it("returns false for active", () => {
    expect(shouldCancelSubscription("active")).toBe(false);
  });

  it("returns false for trialing", () => {
    expect(shouldCancelSubscription("trialing")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(shouldCancelSubscription("")).toBe(false);
  });
});
