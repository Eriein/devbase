"use server";

import { auth } from "@/auth";
import { stripe, STRIPE_PRICES, validateCheckoutEligibility } from "@/lib/stripe";
import type { StripePlan } from "@/lib/stripe";
import { getUserStripeInfo } from "@/lib/db/subscriptions";

export type CheckoutResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function createCheckoutSession(
  plan: StripePlan
): Promise<CheckoutResult> {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const user = await getUserStripeInfo(session.user.id);
  if (!user) return { success: false, error: "User not found" };

  const eligibility = validateCheckoutEligibility(plan, user.isPro);
  if (!eligibility.ok) return { success: false, error: eligibility.error };

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: STRIPE_PRICES[eligibility.plan], quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgrade=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?upgrade=cancelled`,
      customer: user.stripeCustomerId ?? undefined,
      metadata: { userId: session.user.id },
      subscription_data: { metadata: { userId: session.user.id } },
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
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Not authenticated" };

  const user = await getUserStripeInfo(session.user.id);
  if (!user?.stripeCustomerId) return { success: false, error: "No billing account" };

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
    });
    return { success: true, url: portalSession.url };
  } catch {
    return { success: false, error: "Failed to open billing portal" };
  }
}
