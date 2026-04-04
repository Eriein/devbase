"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

function FeatureRow({ label, included }: { label: string; included: boolean }) {
  return (
    <li
      className={`flex items-center gap-3 py-2.5 border-b border-border last:border-0 text-sm ${
        included ? "text-muted-foreground" : "text-muted-foreground/50"
      }`}
    >
      {included ? (
        <Check className="size-4 text-green-500 shrink-0" />
      ) : (
        <X className="size-4 text-muted-foreground/40 shrink-0" />
      )}
      {label}
    </li>
  );
}

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const proMonthly = isYearly ? 6 : 8;

  return (
    <section id="pricing" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-3">Simple, Transparent Pricing</h2>
        <p className="text-muted-foreground text-center text-lg mb-8">
          Start free, upgrade when you&apos;re ready
        </p>

        <div className="flex items-center justify-center gap-3 mb-12">
          <Label htmlFor="billing-toggle" className="text-sm font-medium text-muted-foreground">
            Monthly
          </Label>
          <Switch id="billing-toggle" checked={isYearly} onCheckedChange={setIsYearly} />
          <Label htmlFor="billing-toggle" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            Yearly
            <span className="bg-green-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Save 25%
            </span>
          </Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free */}
          <div className="bg-card border border-border rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-muted-foreground mb-3">Free</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-semibold text-muted-foreground">$</span>
                <span className="text-6xl font-extrabold">0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">Perfect for getting started</p>
            </div>
            <ul className="mb-8">
              {FREE_FEATURES.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </ul>
            <Link href="/register" className={cn(buttonVariants({ variant: "outline" }), "w-full justify-center")}>
              Get Started
            </Link>
          </div>

          {/* Pro */}
          <div className="bg-card border-2 border-blue-500 rounded-2xl p-8 relative shadow-[0_0_40px_rgba(59,130,246,0.2)]">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-400 text-white border-0 text-xs font-semibold uppercase tracking-wide px-4">
              Most Popular
            </Badge>
            <div className="text-center mb-8">
              <h3 className="text-lg font-semibold text-muted-foreground mb-3">Pro</h3>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl font-semibold text-muted-foreground">$</span>
                <span className="text-6xl font-extrabold">{proMonthly}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <p className="text-muted-foreground text-sm mt-1">
                {isYearly ? "Billed $72/year" : "For serious developers"}
              </p>
            </div>
            <ul className="mb-8">
              {PRO_FEATURES.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </ul>
            <Link
              href="/register"
              className={cn(
                buttonVariants(),
                "w-full justify-center bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white border-0"
              )}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
