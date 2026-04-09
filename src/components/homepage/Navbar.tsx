"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Session } from "next-auth";

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#3b82f6" />
      <path d="M8 12h16M8 16h12M8 20h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface NavbarProps {
  session: Session | null;
}

function MobileNav({ session }: { session: Session | null }) {
  return (
    <div className="flex flex-col gap-4 py-4">
      <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
        Features
      </a>
      <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors py-2">
        Pricing
      </a>
      {session ? (
        <Link href="/dashboard" className={buttonVariants()}>
          Go to dashboard
        </Link>
      ) : (
        <>
          <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>
            Sign In
          </Link>
          <Link href="/register" className={buttonVariants()}>
            Get Started
          </Link>
        </>
      )}
    </div>
  );
}

export function Navbar({ session }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 border-b border-border backdrop-blur-md"
          : "bg-background/60 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg">
          <LogoIcon />
          <span>DevStash</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden md:flex items-center gap-2">
          {session ? (
            <Link href="/dashboard" className={buttonVariants({ variant: "ghost" })}>
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className={buttonVariants({ variant: "ghost" })}>
                Sign In
              </Link>
              <Link href="/register" className={buttonVariants()}>
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <MobileNav session={session} />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
