"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormBanner } from "@/components/ui/FormBanner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword, type AuthState } from "@/lib/actions/auth";

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    resetPassword,
    {}
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Reset password
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your new password below
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="token" value={token} />

        {state.error && (
          <FormBanner variant="error">
            {state.error}
          </FormBanner>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs text-muted-foreground">
            New password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            className="h-9 bg-background/50"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="confirmPassword"
            className="text-xs text-muted-foreground"
          >
            Confirm new password
          </Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            minLength={8}
            className="h-9 bg-background/50"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={pending}
        >
          {pending ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        <Link
          href="/sign-in"
          className="text-foreground underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
