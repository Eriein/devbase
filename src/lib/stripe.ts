import Stripe from "stripe";

export { isValidPlan, validateCheckoutEligibility, shouldCancelSubscription } from "@/lib/stripe-validation";
export type { StripePlan, CheckoutEligibility } from "@/lib/stripe-validation";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export const STRIPE_PRICES = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;
