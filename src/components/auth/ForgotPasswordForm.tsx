"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormBanner } from "@/components/ui/FormBanner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword, type AuthState } from "@/lib/actions/auth";

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState<
    AuthState & { success?: boolean },
    FormData
  >(forgotPassword, {});

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Forgot password?
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {state.success ? (
        <div className="space-y-4">
          <FormBanner variant="success">
            If an account exists with that email, we sent a password reset link.
            Check your inbox.
          </FormBanner>
          <p className="text-center text-[13px] text-muted-foreground">
            <Link
              href="/sign-in"
              className="text-foreground underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      ) : (
        <>
          <form action={formAction} className="space-y-4">
            {state.error && (
              <FormBanner variant="error">
                {state.error}
              </FormBanner>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="h-9 bg-background/50"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={pending}
            >
              {pending ? "Sending..." : "Send reset link"}
            </Button>
          </form>

          <p className="text-center text-[13px] text-muted-foreground">
            Remember your password?{" "}
            <Link
              href="/sign-in"
              className="text-foreground underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
