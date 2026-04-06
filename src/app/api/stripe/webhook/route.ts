import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe, shouldCancelSubscription } from "@/lib/stripe";
import {
  activateProSubscription,
  cancelProSubscription,
  getUserByStripeCustomerId,
} from "@/lib/db/subscriptions";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Stripe webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (!userId || !session.customer || !session.subscription) break;

        await activateProSubscription(
          userId,
          session.customer as string,
          session.subscription as string
        );
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.status === "active") {
          const user = await getUserByStripeCustomerId(sub.customer as string);
          if (user && !user.isPro) {
            await activateProSubscription(user.id, sub.customer as string, sub.id);
          }
        } else if (shouldCancelSubscription(sub.status)) {
          await cancelProSubscription(sub.id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await cancelProSubscription(sub.id);
        break;
      }
    }
  } catch (err) {
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
