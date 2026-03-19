import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { validateVerificationToken } from "@/lib/tokens";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <VerifyResult
        success={false}
        message="Missing verification token."
      />
    );
  }

  const result = await validateVerificationToken(token);

  if (result.error) {
    return <VerifyResult success={false} message={result.error} />;
  }

  return (
    <VerifyResult
      success={true}
      message="Your email has been verified. You can now sign in."
    />
  );
}

function VerifyResult({
  success,
  message,
}: {
  success: boolean;
  message: string;
}) {
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        {success ? (
          <CheckCircle2 className="size-12 text-emerald-500" />
        ) : (
          <XCircle className="size-12 text-destructive" />
        )}
      </div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {success ? "Email verified" : "Verification failed"}
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">{message}</p>
      </div>
      <Link
        href="/sign-in"
        className="inline-flex h-9 w-full items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
      >
        {success ? "Sign in" : "Back to sign in"}
      </Link>
    </div>
  );
}
