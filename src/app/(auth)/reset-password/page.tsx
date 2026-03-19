import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await auth();
  if (session) redirect("/dashboard");

  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Invalid reset link
        </h1>
        <p className="text-sm text-muted-foreground">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="text-sm text-foreground underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
        >
          Request a new one
        </Link>
      </div>
    );
  }

  return <ResetPasswordForm token={token} />;
}
