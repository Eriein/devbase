"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, ArrowLeft, Zap, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { createCheckoutSession } from "@/lib/actions/stripe";
import type { StripePlan } from "@/lib/stripe";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  { label: "50 items", included: true },
  { label: "3 collections", included: true },
  { label: "Basic search", included: true },
  { label: "File storage (100MB)", included: true },
  { label: "AI-powered features", included: false },
  { label: "Unlimited collections", included: false },
  { label: "Priority support", included: false },
  { label: "10GB storage", included: false },
];

const PRO_FEATURES = [
  { label: "Unlimited items", included: true },
  { label: "Unlimited collections", included: true },
  { label: "AI-powered features", included: true },
  { label: "Advanced search", included: true },
  { label: "File storage (10GB)", included: true },
  { label: "Priority support", included: true },
  { label: "Export data", included: true },
  { label: "API access", included: true },
];

function FeatureRow({ label, included, delay }: { label: string; included: boolean; delay: number }) {
  return (
    <li
      className="upgrade-feature-row flex items-center gap-3 py-2.5 text-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      {included ? (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/15">
          <Check className="size-3 text-blue-400" />
        </span>
      ) : (
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted/50">
          <X className="size-3 text-muted-foreground/40" />
        </span>
      )}
      <span className={included ? "text-foreground/80" : "text-muted-foreground/40"}>
        {label}
      </span>
    </li>
  );
}

function ProFeatureRow({ label, delay }: { label: string; delay: number }) {
  return (
    <li
      className="upgrade-feature-row flex items-center gap-3 py-2.5 text-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
        <Check className="size-3 text-blue-400" />
      </span>
      <span className="text-foreground/90">{label}</span>
    </li>
  );
}

export function PricingClient() {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState<StripePlan | null>(null);
  const proMonthly = isYearly ? 6 : 8;

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
    <div className="upgrade-page min-h-screen bg-background relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="pointer-events-none absolute inset-0 upgrade-bg" />

      {/* Header */}
      <div className="relative border-b border-border/50">
        <div className="max-w-5xl mx-auto px-6 pt-8 pb-12">
          <Link
            href="/dashboard"
            className="upgrade-animate inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to dashboard
          </Link>
          <h1
            className="upgrade-animate text-4xl md:text-5xl font-extrabold mt-6 leading-tight"
            style={{ animationDelay: "60ms" }}
          >
            Unlock the full{" "}
            <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
              power
            </span>
          </h1>
          <p
            className="upgrade-animate text-muted-foreground text-lg mt-2 max-w-md"
            style={{ animationDelay: "120ms" }}
          >
            You&apos;re on the Free plan. Upgrade to Pro for unlimited everything.
          </p>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="relative max-w-5xl mx-auto px-6 py-16">
        {/* Billing Toggle */}
        <div
          className="upgrade-animate flex items-center justify-center mb-14"
          style={{ animationDelay: "180ms" }}
        >
          <div className="inline-flex items-center rounded-full border border-border bg-card/50 p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all",
                !isYearly
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-all flex items-center gap-2",
                isYearly
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
              <span className="rounded-full bg-green-500/90 text-white text-[10px] font-bold px-2 py-0.5 leading-none">
                -25%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto items-start">
          {/* Free (Current Plan) */}
          <div
            className="upgrade-animate rounded-2xl border border-border/60 bg-card/40 p-8 relative"
            style={{ animationDelay: "240ms" }}
          >
            <Badge className="mb-6 bg-muted/80 text-muted-foreground border-0 text-[10px] font-semibold uppercase tracking-widest px-3">
              Current Plan
            </Badge>
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-muted-foreground">Free</h3>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-extrabold text-muted-foreground">$0</span>
              <span className="text-muted-foreground/60 text-sm">/month</span>
            </div>
            <p className="text-muted-foreground/60 text-xs mb-8">
              Great for getting started
            </p>
            <ul className="mb-8 space-y-0.5">
              {FREE_FEATURES.map((f, i) => (
                <FeatureRow key={f.label} {...f} delay={300 + i * 40} />
              ))}
            </ul>
            <Button variant="outline" disabled className="w-full justify-center opacity-50">
              Current Plan
            </Button>
          </div>

          {/* Pro — the star of the show */}
          <div
            className="upgrade-animate upgrade-pro-card relative"
            style={{ animationDelay: "300ms" }}
          >
            {/* Animated border glow */}
            <div className="absolute -inset-px rounded-2xl upgrade-border-glow" />

            <div className="relative rounded-2xl bg-card p-8 z-10">
              {/* Floating badge */}
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-500 to-blue-400 text-white border-0 text-[10px] font-bold uppercase tracking-widest px-4 py-1 shadow-[0_4px_12px_rgba(59,130,246,0.4)]">
                  Recommended
                </Badge>
              </div>

              <div className="flex items-center gap-2 mb-6 mt-2">
                <Sparkles className="size-4 text-blue-400" />
                <h3 className="text-lg font-semibold text-foreground">Pro</h3>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <span
                  className="text-5xl font-extrabold tabular-nums"
                  key={proMonthly}
                >
                  ${proMonthly}
                </span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <p className="text-muted-foreground text-xs mb-8">
                {isYearly ? (
                  <>Billed <span className="text-foreground/80 font-medium">$72/year</span></>
                ) : (
                  "For serious developers"
                )}
              </p>

              <ul className="mb-8 space-y-0.5">
                {PRO_FEATURES.map((f, i) => (
                  <ProFeatureRow key={f.label} label={f.label} delay={360 + i * 40} />
                ))}
              </ul>

              <div className="flex flex-col gap-2.5">
                <Button
                  className="w-full justify-center bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white border-0 shadow-[0_2px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_2px_28px_rgba(59,130,246,0.5)] transition-shadow h-10 text-sm font-semibold"
                  disabled={!!loading}
                  onClick={() => handleUpgrade(isYearly ? "yearly" : "monthly")}
                >
                  {loading ? (
                    "Redirecting..."
                  ) : isYearly ? (
                    "Upgrade — $72/year"
                  ) : (
                    "Upgrade — $8/month"
                  )}
                </Button>
                {!isYearly && (
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setIsYearly(true)}
                    disabled={!!loading}
                  >
                    or save 25% with yearly billing
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div
          className="upgrade-animate flex items-center justify-center gap-8 mt-16 text-xs text-muted-foreground/60"
          style={{ animationDelay: "600ms" }}
        >
          <span className="flex items-center gap-1.5">
            <Shield className="size-3.5" />
            Cancel anytime
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="size-3.5" />
            Instant activation
          </span>
        </div>
      </div>
    </div>
  );
}
