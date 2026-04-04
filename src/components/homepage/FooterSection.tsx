import Link from "next/link";

function LogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="8" fill="#3b82f6" />
      <path d="M8 12h16M8 16h12M8 20h8" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const FOOTER_LINKS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "API", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function FooterSection() {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-12 mb-12">
          {/* Brand */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg mb-3">
              <LogoIcon />
              <span>DevStash</span>
            </Link>
            <p className="text-muted-foreground text-sm">Stop losing your developer knowledge.</p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-12">
            {FOOTER_LINKS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-2">
                <h4 className="font-semibold text-sm mb-1">{col.heading}</h4>
                {col.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground text-sm hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} DevStash. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
