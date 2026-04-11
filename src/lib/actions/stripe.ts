"use server";

import { requireSession } from "@/lib/actions/guards";
import { stripe, STRIPE_PRICES, validateCheckoutEligibility } from "@/lib/stripe";
import type { StripePlan } from "@/lib/stripe";
import { getUserStripeInfo } from "@/lib/db/subscriptions";

export type CheckoutResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function createCheckoutSession(
  plan: StripePlan
): Promise<CheckoutResult> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  const user = await getUserStripeInfo(s.userId);
  if (!user) return { success: false, error: "User not found" };

  const eligibility = validateCheckoutEligibility(plan, user.isPro);
  if (!eligibility.ok) return { success: false, error: eligibility.error };

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return { success: false, error: "App URL not configured" };
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: STRIPE_PRICES[eligibility.plan], quantity: 1 }],
      success_url: `${appUrl}/settings?upgrade=success`,
      cancel_url: `${appUrl}/settings?upgrade=cancelled`,
      customer: user.stripeCustomerId ?? undefined,
      metadata: { userId: s.userId },
      subscription_data: { metadata: { userId: s.userId } },
    });

    if (!checkoutSession.url) return { success: false, error: "No checkout URL" };
    return { success: true, url: checkoutSession.url };
  } catch (err) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: `Failed to create checkout session: ${message}` };
  }
}

export async function createBillingPortalSession(): Promise<CheckoutResult> {
  const s = await requireSession();
  if (!s.ok) return { success: false, error: s.error };

  const user = await getUserStripeInfo(s.userId);
  if (!user?.stripeCustomerId) return { success: false, error: "No billing account" };

  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
      return { success: false, error: "App URL not configured" };
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${appUrl}/settings`,
    });
    return { success: true, url: portalSession.url };
  } catch {
    return { success: false, error: "Failed to open billing portal" };
  }
}
