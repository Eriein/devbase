import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "./ScrollReveal";

const AI_FEATURES = [
  "Automatic tag suggestions for your items",
  "Smart search with natural language queries",
  "Code explanation and documentation generation",
  "Convert snippets between languages",
  "Auto-generate descriptions for snippets",
];

export function AISection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
          <ScrollReveal>
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-blue-400 text-white border-0 text-xs font-semibold uppercase tracking-wide">
              Pro Feature
            </Badge>
            <h2 className="text-4xl font-bold mb-6">Supercharge Your Workflow with AI</h2>
            <ul className="space-y-4">
              {AI_FEATURES.map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-muted-foreground">
                  <Check className="size-5 text-green-500 shrink-0" />
                  {feat}
                </li>
              ))}
            </ul>
          </ScrollReveal>

          {/* Right — code editor mockup */}
          <ScrollReveal>
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Mac dots header */}
              <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-xs text-muted-foreground">AI Generated Tags</span>
              </div>
              {/* Code */}
              <pre className="p-6 text-sm font-mono leading-relaxed overflow-x-auto">
                <code>
                  <span className="text-pink-400">const</span>{" "}
                  <span className="text-green-400">debounce</span> = (
                  <span className="text-purple-400">fn</span>,{" "}
                  <span className="text-purple-400">delay</span>) =&gt; {"{"}{"\n"}
                  {"  "}
                  <span className="text-pink-400">let</span>{" "}
                  <span className="text-green-400">timeout</span>;{"\n"}
                  {"  "}
                  <span className="text-pink-400">return</span> (...
                  <span className="text-purple-400">args</span>) =&gt; {"{"}{"\n"}
                  {"    "}clearTimeout(
                  <span className="text-green-400">timeout</span>);{"\n"}
                  {"    "}
                  <span className="text-green-400">timeout</span> ={" "}
                  <span className="text-pink-400">setTimeout</span>(() =&gt;{" "}
                  <span className="text-purple-400">fn</span>(...
                  <span className="text-purple-400">args</span>),{" "}
                  <span className="text-purple-400">delay</span>);{"\n"}
                  {"  "}{"}"};{"\n"}
                  {"}"};
                </code>
              </pre>
              {/* Tags */}
              <div className="border-t border-border px-4 py-3 flex gap-2 flex-wrap">
                {["javascript", "utility", "debounce", "async"].map((tag) => (
                  <span
                    key={tag}
                    className="bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
