import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";

export function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-card text-center">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-4">Ready to Organize Your Knowledge?</h2>
        <p className="text-muted-foreground text-lg mb-8">
          Join thousands of developers who never lose their best ideas
        </p>
        <Link
          href="/register"
          className={cn(
            buttonVariants({ size: "lg" }),
            "bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white border-0"
          )}
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
