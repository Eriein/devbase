import { Code2 } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-grid-bg flex min-h-screen flex-col items-center justify-center px-4">
      {/* Logo */}
      <Link
        href="/"
        className="auth-animate mb-10 flex items-center gap-2.5 text-foreground"
      >
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Code2 className="size-5" />
        </div>
        <span className="text-xl font-semibold tracking-tight">DevStash</span>
      </Link>

      {/* Card */}
      <div className="auth-card auth-animate auth-animate-delay-1 w-full max-w-sm rounded-lg p-8">
        {children}
      </div>

      {/* Terminal prompt accent */}
      <p className="auth-animate auth-animate-delay-3 mt-8 font-[var(--font-geist-mono)] text-[11px] tracking-wider text-muted-foreground/50">
        &gt;_ developer knowledge hub
      </p>
    </div>
  );
}
