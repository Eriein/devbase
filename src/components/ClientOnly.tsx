"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ClientOnlyProps {
  children: React.ReactNode;
  className?: string;
  fallback?: React.ReactNode;
}

export function ClientOnly({ children, className, fallback }: ClientOnlyProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  return <div className={className}>{children}</div>;
}