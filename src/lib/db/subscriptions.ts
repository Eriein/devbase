import { prisma } from "@/lib/prisma";

export async function getUserStripeInfo(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      isPro: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
    },
  });
}

export async function activateProSubscription(
  userId: string,
  customerId: string,
  subscriptionId: string
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      isPro: true,
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
    },
  });
}

export async function cancelProSubscription(subscriptionId: string) {
  return prisma.user.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: { isPro: false, stripeSubscriptionId: null },
  });
}

export async function getUserByStripeCustomerId(customerId: string) {
  return prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true, isPro: true, stripeSubscriptionId: true },
  });
}
