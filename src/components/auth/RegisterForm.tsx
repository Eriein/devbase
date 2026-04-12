"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormBanner } from "@/components/ui/FormBanner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OAuthProviders } from "./OAuthProviders";
import { register, type AuthState } from "@/lib/actions/auth";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    register,
    {}
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-tight">Create an account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Start organizing your dev knowledge
        </p>
      </div>

      <OAuthProviders />

      <form action={formAction} className="space-y-4">
        {state.error && (
          <FormBanner variant="error">
            {state.error}
          </FormBanner>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs text-muted-foreground">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Jane Doe"
            required
            className="h-9 bg-background/50"
          />
        </div>

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
          <Label htmlFor="password" className="text-xs text-muted-foreground">
            Password
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
          <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">
            Confirm password
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

        <Button type="submit" className="w-full" size="lg" disabled={pending}>
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <p className="text-center text-[13px] text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="text-foreground underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
