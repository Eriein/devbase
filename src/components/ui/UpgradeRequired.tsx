"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  createCheckoutSession,
} from "@/lib/actions/stripe";
import { useState } from "react";
import { toast } from "sonner";
import type { StripePlan } from "@/lib/stripe";

interface UpgradeRequiredProps {
  feature: string;
}

export function UpgradeRequired({ feature }: UpgradeRequiredProps) {
  const [loading, setLoading] = useState<StripePlan | null>(null);

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

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-24">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Lock className="size-8 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">
        Upgrade to Pro
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {feature} are available for Pro users. Upgrade now to unlock unlimited
        file uploads, image storage, and more.
      </p>
      <div className="flex gap-3">
        <Button
          disabled={!!loading}
          onClick={() => handleUpgrade("monthly")}
        >
          {loading === "monthly" ? "Loading..." : "$8 / month"}
        </Button>
        <Button
          variant="outline"
          disabled={!!loading}
          onClick={() => handleUpgrade("yearly")}
        >
          {loading === "yearly" ? "Loading..." : "$72 / year"}
        </Button>
      </div>
    </div>
  );
}
