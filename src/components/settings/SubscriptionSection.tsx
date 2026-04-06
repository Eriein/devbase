"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  createCheckoutSession,
  createBillingPortalSession,
} from "@/lib/actions/stripe";
import { FREE_ITEMS_LIMIT, FREE_COLLECTIONS_LIMIT } from "@/lib/constants";
import type { StripePlan } from "@/lib/stripe";

interface SubscriptionSectionProps {
  isPro: boolean;
  hasStripeCustomer: boolean;
  itemCount: number;
  collectionCount: number;
}

export function SubscriptionSection({
  isPro,
  hasStripeCustomer,
  itemCount,
  collectionCount,
}: SubscriptionSectionProps) {
  const [loading, setLoading] = useState<StripePlan | "portal" | null>(null);

  async function handleUpgrade(plan: StripePlan) {
    setLoading(plan);
    const result = await createCheckoutSession(plan);
    if (result.success) {
      window.location.href = result.url;
    } else {
      toast.error(result.error);
      setLoading(null);
    }
  }

  async function handleManage() {
    setLoading("portal");
    const result = await createBillingPortalSession();
    if (result.success) {
      window.location.href = result.url;
    } else {
      toast.error(result.error);
      setLoading(null);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-foreground">Subscription</h3>
        <Badge variant={isPro ? "default" : "secondary"}>
          {isPro ? "Pro" : "Free"}
        </Badge>
      </div>

      {/* Usage */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <UsageBar
          label="Items"
          current={itemCount}
          limit={isPro ? null : FREE_ITEMS_LIMIT}
        />
        <UsageBar
          label="Collections"
          current={collectionCount}
          limit={isPro ? null : FREE_COLLECTIONS_LIMIT}
        />
      </div>

      {isPro ? (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            You have an active Pro subscription.
          </p>
          {hasStripeCustomer && (
            <Button
              className="mt-4 cursor-pointer"
              variant="outline"
              size="sm"
              disabled={loading === "portal"}
              onClick={handleManage}
            >
              {loading === "portal" ? "Loading..." : "Manage Billing"}
            </Button>
          )}
        </>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted-foreground">
            Upgrade to Pro for unlimited items, file uploads, AI features, and
            more.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              className="cursor-pointer"
              size="sm"
              disabled={!!loading}
              onClick={() => handleUpgrade("monthly")}
            >
              {loading === "monthly" ? "Loading..." : "$8 / month"}
            </Button>
            <Button
              className="cursor-pointer"
              size="sm"
              variant="outline"
              disabled={!!loading}
              onClick={() => handleUpgrade("yearly")}
            >
              {loading === "yearly" ? "Loading..." : "$72 / year (25% off)"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function UsageBar({
  label,
  current,
  limit,
}: {
  label: string;
  current: number;
  limit: number | null;
}) {
  const percentage = limit ? Math.min((current / limit) * 100, 100) : 0;
  const isAtLimit = limit !== null && current >= limit;

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={isAtLimit ? "font-medium text-destructive" : "text-foreground"}>
          {limit !== null ? `${current}/${limit}` : `${current}`}
          {limit === null && (
            <span className="ml-1 text-xs text-muted-foreground">Unlimited</span>
          )}
        </span>
      </div>
      {limit !== null && (
        <div className="mt-1.5 h-1.5 rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              isAtLimit ? "bg-destructive" : "bg-primary"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}
