"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  signInWithCredentials,
  signInWithGitHub,
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
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2.5 text-sm text-green-400">
          Account created successfully! You can now sign in.
        </div>
      )}

      {reset && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-2.5 text-sm text-green-400">
          Password reset successfully! You can now sign in with your new password.
        </div>
      )}

      {/* GitHub OAuth */}
      <form action={() => signInWithGitHub(callbackUrl)}>
        <Button
          variant="outline"
          className="w-full gap-2.5 border-border/60 bg-transparent hover:bg-muted/50"
          size="lg"
          type="submit"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Continue with GitHub
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60">or</span>
        <div className="h-px flex-1 bg-border/50" />
      </div>

      {/* Credentials form */}
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        {state.error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
            {state.error}
          </div>
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
