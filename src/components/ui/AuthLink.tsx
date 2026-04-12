import Link from "next/link";

interface AuthLinkProps {
  href: string;
  children: React.ReactNode;
}

export function AuthLink({ href, children }: AuthLinkProps) {
  return (
    <Link
      href={href}
      className="text-foreground underline decoration-muted-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {children}
    </Link>
  );
}