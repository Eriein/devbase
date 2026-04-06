const VALID_PLANS = ["monthly", "yearly"] as const;
export type StripePlan = (typeof VALID_PLANS)[number];

export function isValidPlan(plan: string): plan is StripePlan {
  return (VALID_PLANS as readonly string[]).includes(plan);
}

export type CheckoutEligibility =
  | { ok: true; plan: StripePlan }
  | { ok: false; error: string };

export function validateCheckoutEligibility(
  plan: string,
  isPro: boolean
): CheckoutEligibility {
  if (!isValidPlan(plan)) return { ok: false, error: "Invalid plan" };
  if (isPro) return { ok: false, error: "Already subscribed" };
  return { ok: true, plan };
}

const CANCELLATION_STATUSES = ["canceled", "unpaid", "past_due"] as const;

export function shouldCancelSubscription(status: string): boolean {
  return (CANCELLATION_STATUSES as readonly string[]).includes(status);
}
