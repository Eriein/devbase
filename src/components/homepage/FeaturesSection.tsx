import { ScrollReveal } from "./ScrollReveal";

interface Feature {
  title: string;
  description: string;
  color: string;
  path: string;
}

const FEATURES: Feature[] = [
  {
    title: "Code Snippets",
    description: "Store and organize code snippets with syntax highlighting and language detection.",
    color: "#3b82f6",
    path: "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z",
  },
  {
    title: "AI Prompts",
    description: "Build and refine AI prompts with version history and template support.",
    color: "#f59e0b",
    path: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z",
  },
  {
    title: "Instant Search",
    description: "Find anything in milliseconds with powerful fuzzy search and filters.",
    color: "#06b6d4",
    path: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
  },
  {
    title: "Commands",
    description: "Save terminal commands with descriptions and copy with one click.",
    color: "#22c55e",
    path: "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z",
  },
  {
    title: "Files & Docs",
    description: "Store documents, images, and files with automatic previews.",
    color: "#64748b",
    path: "M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z",
  },
  {
    title: "Collections",
    description: "Group related items into collections for better organization.",
    color: "#ec4899",
    path: "M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <ScrollReveal>
      <div className="bg-card border border-border rounded-xl p-8 hover:-translate-y-1 transition-transform duration-300 hover:shadow-lg h-full">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
          style={{ backgroundColor: `${feature.color}18` }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 24, height: 24, color: feature.color }}>
            <path d={feature.path} />
          </svg>
        </div>
        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
      </div>
    </ScrollReveal>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-card">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-3">
          Everything You Need to Organize Code &amp; Knowledge
        </h2>
        <p className="text-muted-foreground text-center text-lg mb-12">
          Powerful features designed for developers who value their time
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
