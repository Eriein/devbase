"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormBanner } from "@/components/ui/FormBanner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthProviders } from "./OAuthProviders";
import {
  signInWithCredentials,
  type AuthState,
} from "@/lib/actions/auth";

export function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const verify = searchParams.get("verify") === "true";
  const verified = searchParams.get("verified") === "true";
  const registered = searchParams.get("registered") === "true";
  const reset = searchParams.get("reset") === "true";
  const resend = searchParams.get("resend") === "true";

  const toastShown = useRef(false);
  const [resendEmail, setResendEmail] = useState("");
  const [resendPending, setResendPending] = useState(false);

  useEffect(() => {
    if (verified && !toastShown.current) {
      toastShown.current = true;
      toast.success("Email verified! You can now sign in.");
    }
  }, [verified]);

  useEffect(() => {
    if (resend && !toastShown.current) {
      toastShown.current = true;
      toast.success("Verification email sent! Check your inbox.");
    }
  }, [resend]);

  const handleResendVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendPending(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to send verification email");
      } else {
        toast.success("Verification email sent! Check your inbox.");
        setResendEmail("");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setResendPending(false);
    }
  };

  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signInWithCredentials,
    {}
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Sign in to your account
        </p>
      </div>

      {verify && (
        <div className="space-y-3 rounded-lg border border-blue-500/30 bg-blue-500/5 px-3 py-2.5">
          <p className="text-sm text-blue-400">
            Check your email for a verification link. Once verified, you can sign in.
          </p>
          <form onSubmit={handleResendVerification} className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email to resend"
              value={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              className="h-8 text-xs bg-background/50"
            />
            <Button type="submit" size="sm" variant="outline" disabled={resendPending || !resendEmail} className="h-8 text-xs">
              {resendPending ? "Sending..." : "Resend"}
            </Button>
          </form>
        </div>
      )}

      {registered && (
        <FormBanner variant="success">
          Account created successfully! You can now sign in.
        </FormBanner>
      )}

      {reset && (
        <FormBanner variant="success">
          Password reset successfully! You can now sign in with your new password.
        </FormBanner>
      )}

      <OAuthProviders callbackUrl={callbackUrl} />

      {/* Credentials form */}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs text-muted-foreground">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="h-9 bg-background/50"
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        No account?{" "}
        <Link
          href="/register"
          className="text-foreground underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
