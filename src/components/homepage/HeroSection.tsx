import Link from "next/link";
import { buttonVariants } from "@/lib/button-variants";
import { cn } from "@/lib/utils";
import { HeroChaos } from "./HeroChaos";

const MOCK_CARDS = [
  { title: "useDebounce hook", lang: "javascript", color: "#3b82f6" },
  { title: "Write better prompts", lang: "prompt", color: "#f59e0b" },
  { title: "git undo", lang: "command", color: "#06b6d4" },
  { title: "Meeting notes", lang: "note", color: "#22c55e" },
  { title: "React docs", lang: "link", color: "#6366f1" },
  { title: "Screenshot design", lang: "image", color: "#ec4899" },
  { title: "API utils", lang: "snippet", color: "#3b82f6" },
  { title: "Config files", lang: "file", color: "#64748b" },
];

function DashboardPreview() {
  return (
    <div className="flex flex-col items-center">
      <p className="text-xs text-muted-foreground mb-2 font-medium">...with DevStash</p>
      <div
        className="bg-card border border-border rounded-xl overflow-hidden flex"
        style={{ width: 340, height: 300 }}
      >
        {/* Sidebar */}
        <div className="w-10 bg-card border-r border-border p-2 flex flex-col gap-1.5">
          <div className="h-5 rounded bg-blue-500" />
          <div className="h-5 rounded bg-muted" />
          <div className="h-5 rounded bg-muted" />
          <div className="h-5 rounded bg-muted" />
        </div>
        {/* Main */}
        <div className="flex flex-col flex-1">
          <div className="h-8 border-b border-border bg-card flex items-center justify-between px-2">
            <div className="w-20 h-4 rounded bg-muted" />
            <div className="w-4 h-4 rounded-full bg-blue-500" />
          </div>
          <div className="flex-1 p-1.5 grid grid-cols-2 gap-1 content-start">
            {MOCK_CARDS.map((card) => (
              <div
                key={card.title}
                className="h-12 bg-background rounded border-l-[3px] px-2 py-1 flex flex-col justify-between"
                style={{ borderColor: card.color }}
              >
                <p className="text-[9px] text-foreground truncate">{card.title}</p>
                <p className="text-[7px] text-muted-foreground uppercase">{card.lang}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="pt-32 pb-16 min-h-screen flex items-center">
      <div className="max-w-6xl mx-auto px-6 flex flex-col gap-16 w-full">
        {/* Text */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Stop Losing Your{" "}
            <span className="bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
              Developer Knowledge
            </span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Your code snippets, AI prompts, commands, and notes are scattered across Notion, GitHub, Slack,
            and a dozen other places. DevStash brings order to the chaos.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href="/register"
              className={cn(
                buttonVariants({ size: "lg" }),
                "bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-white border-0"
              )}
            >
              Start Free
            </Link>
            <a href="#features" className={buttonVariants({ variant: "outline", size: "lg" })}>
              Learn More
            </a>
          </div>
        </div>

        {/* Chaos → Order visual */}
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <HeroChaos />

          {/* Arrow */}
          <div className="flex items-center justify-center w-16 sm:w-20">
            <svg viewBox="0 0 80 40" fill="none" className="w-full">
              <path
                d="M10 20H60M60 20L50 10M60 20L50 30"
                stroke="#3b82f6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
              </path>
            </svg>
          </div>

          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
