"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormBanner } from "@/components/ui/FormBanner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword, type ProfileActionState } from "@/lib/actions/profile";

export function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    changePassword,
    {}
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <FormBanner variant="error">
          {state.error}
        </FormBanner>
      )}

      {state.success && (
        <FormBanner variant="success">
          Password updated successfully.
        </FormBanner>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="currentPassword" className="text-xs text-muted-foreground">
          Current password
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          placeholder="••••••••"
          required
          className="h-9 bg-background/50 max-w-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="newPassword" className="text-xs text-muted-foreground">
          New password
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
          className="h-9 bg-background/50 max-w-sm"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword" className="text-xs text-muted-foreground">
          Confirm new password
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          minLength={8}
          className="h-9 bg-background/50 max-w-sm"
        />
      </div>

      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Updating..." : "Update password"}
      </Button>
    </form>
  );
}
