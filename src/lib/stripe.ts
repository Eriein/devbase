import Stripe from "stripe";

export { isValidPlan, validateCheckoutEligibility, shouldCancelSubscription } from "@/lib/stripe-validation";
export type { StripePlan, CheckoutEligibility } from "@/lib/stripe-validation";

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

export const stripe = new Stripe(secretKey, {
  apiVersion: "2025-03-31.basil",
});

const priceIdMonthly = process.env.STRIPE_PRICE_ID_MONTHLY;
const priceIdYearly = process.env.STRIPE_PRICE_ID_YEARLY;

if (!priceIdMonthly || !priceIdYearly) {
  throw new Error("STRIPE_PRICE_ID_MONTHLY or STRIPE_PRICE_ID_YEARLY is not set");
}

export const STRIPE_PRICES = {
  monthly: priceIdMonthly,
  yearly: priceIdYearly,
} as const;
