interface FormBannerProps {
  variant: "error" | "success" | "info";
  children: React.ReactNode;
}

export function FormBanner({ variant, children }: FormBannerProps) {
  const variantClasses = {
    error: "border-destructive/30 bg-destructive/5 text-destructive",
    success: "border-green-500/30 bg-green-500/5 text-green-400",
    info: "border-green-500/30 bg-green-500/5 text-green-400",
  };

  return (
    <div className={`rounded-lg border px-3 py-2.5 text-sm ${variantClasses[variant]}`}>
      {children}
    </div>
  );
}