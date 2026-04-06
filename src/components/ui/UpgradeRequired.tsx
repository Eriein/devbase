"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface UpgradeRequiredProps {
  feature: string;
}

export function UpgradeRequired({ feature }: UpgradeRequiredProps) {
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
      <Link href="/upgrade">
        <Button>
          Upgrade Now
        </Button>
      </Link>
    </div>
  );
}
