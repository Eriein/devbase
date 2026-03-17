import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

const SYSTEM_ITEM_TYPES = [
  { name: "snippet", icon: "Code", color: "#3b82f6" },
  { name: "prompt", icon: "Sparkles", color: "#8b5cf6" },
  { name: "command", icon: "Terminal", color: "#f97316" },
  { name: "note", icon: "StickyNote", color: "#fde047" },
  { name: "file", icon: "File", color: "#6b7280" },
  { name: "image", icon: "Image", color: "#ec4899" },
  { name: "link", icon: "Link", color: "#10b981" },
];

async function main() {
  // ── System item types ──────────────────────────────────────────
  console.log("Seeding system item types...");
  const typeMap: Record<string, string> = {};

  for (const type of SYSTEM_ITEM_TYPES) {
    const existing = await prisma.itemType.findFirst({
      where: { name: type.name, isSystem: true, userId: null },
    });

    const record = existing
      ? await prisma.itemType.update({
          where: { id: existing.id },
          data: { icon: type.icon, color: type.color },
        })
      : await prisma.itemType.create({
          data: {
            name: type.name,
            icon: type.icon,
            color: type.color,
            isSystem: true,
            userId: null,
          },
        });

    typeMap[type.name] = record.id;
    console.log(`  ${existing ? "Updated" : "Created"} system type: ${type.name}`);
  }

  // ── Demo user ──────────────────────────────────────────────────
  console.log("Seeding demo user...");
  const hashedPassword = await bcrypt.hash("12345678", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@devstash.io" },
    update: {},
    create: {
      email: "demo@devstash.io",
      name: "Demo User",
      isPro: false,
      emailVerified: new Date(),
      // Store hashed password in an Account record for credentials provider
      accounts: {
        create: {
          type: "credentials",
          provider: "credentials",
          providerAccountId: "demo@devstash.io",
          access_token: hashedPassword,
        },
      },
    },
  });
  console.log(`  Upserted user: ${user.email}`);

  // ── Helper ─────────────────────────────────────────────────────
  async function createCollection(
    name: string,
    description: string,
    items: Array<{
      title: string;
      contentType: "text" | "url" | "file";
      content?: string;
      url?: string;
      description?: string;
      language?: string;
      isFavorite?: boolean;
      isPinned?: boolean;
      typeName: string;
    }>
  ) {
    const existing = await prisma.collection.findFirst({
      where: { name, userId: user.id },
    });

    if (existing) {
      console.log(`  Skipped collection (already exists): ${name}`);
      return;
    }

    const collection = await prisma.collection.create({
      data: { name, description, userId: user.id },
    });

    for (const item of items) {
      const { typeName, ...rest } = item;
      await prisma.item.create({
        data: {
          ...rest,
          userId: user.id,
          itemTypeId: typeMap[typeName],
          collections: { create: { collectionId: collection.id } },
        },
      });
    }

    console.log(`  Created collection: ${name} (${items.length} items)`);
  }

  // ── React Patterns ─────────────────────────────────────────────
  await createCollection("React Patterns", "Reusable React patterns and hooks", [
    {
      title: "useDebounce Hook",
      typeName: "snippet",
      contentType: "text",
      language: "typescript",
      description: "Debounce a rapidly changing value",
      isFavorite: true,
      content: `import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}`,
    },
    {
      title: "Context Provider Pattern",
      typeName: "snippet",
      contentType: "text",
      language: "typescript",
      description: "Typed context with custom hook and provider component",
      content: `import { createContext, useContext, useState, ReactNode } from "react";

interface ThemeContextValue {
  theme: "light" | "dark";
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));
  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}`,
    },
    {
      title: "Utility Functions",
      typeName: "snippet",
      contentType: "text",
      language: "typescript",
      description: "Common TypeScript utility helpers",
      content: `/** Merge class names (drop-in without clsx) */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Format bytes to human-readable string */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return \`\${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} \${sizes[i]}\`;
}

/** Sleep for ms milliseconds */
export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));`,
    },
  ]);

  // ── AI Workflows ───────────────────────────────────────────────
  await createCollection("AI Workflows", "AI prompts and workflow automations", [
    {
      title: "Code Review Prompt",
      typeName: "prompt",
      contentType: "text",
      description: "Thorough code review with security and performance focus",
      isFavorite: true,
      content: `Review the following code and provide feedback on:

1. **Correctness** – Are there any logic errors or edge cases not handled?
2. **Security** – Are there any vulnerabilities (injection, auth bypass, data leaks)?
3. **Performance** – Are there unnecessary re-renders, N+1 queries, or memory leaks?
4. **Readability** – Is the code clear and idiomatic for the language/framework?
5. **Patterns** – Does it follow the project's existing conventions?

For each issue found, explain the problem and suggest a concrete fix.

\`\`\`
{{code}}
\`\`\``,
    },
    {
      title: "Documentation Generation",
      typeName: "prompt",
      contentType: "text",
      description: "Generate JSDoc / TSDoc comments for a function or module",
      content: `Generate TSDoc comments for the following TypeScript code. Include:

- A concise summary (one line)
- @param tags for every parameter with type and description
- @returns tag describing the return value
- @throws if the function can throw
- A brief @example showing typical usage

Output only the documented code, no explanation.

\`\`\`typescript
{{code}}
\`\`\``,
    },
    {
      title: "Refactoring Assistant",
      typeName: "prompt",
      contentType: "text",
      description: "Refactor code for clarity and maintainability",
      content: `Refactor the following code to improve clarity and maintainability without changing its behaviour. Focus on:

- Reducing nesting depth (early returns, guard clauses)
- Extracting magic numbers / strings into named constants
- Splitting large functions into smaller, single-purpose helpers
- Replacing imperative loops with expressive array methods where appropriate

Show the refactored code followed by a brief bullet-point summary of every change made.

\`\`\`
{{code}}
\`\`\``,
    },
  ]);

  // ── DevOps ─────────────────────────────────────────────────────
  await createCollection("DevOps", "Infrastructure and deployment resources", [
    {
      title: "Dockerfile — Node.js App",
      typeName: "snippet",
      contentType: "text",
      language: "dockerfile",
      description: "Multi-stage Dockerfile for a Next.js application",
      content: `# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./
EXPOSE 3000
CMD ["npm", "start"]`,
    },
    {
      title: "Deploy to Production",
      typeName: "command",
      contentType: "text",
      description: "Build, tag, push Docker image and trigger rolling restart",
      content: `docker build -t myapp:$(git rev-parse --short HEAD) . \
  && docker tag myapp:$(git rev-parse --short HEAD) registry.example.com/myapp:latest \
  && docker push registry.example.com/myapp:latest \
  && kubectl rollout restart deployment/myapp`,
    },
    {
      title: "Docker Documentation",
      typeName: "link",
      contentType: "url",
      description: "Official Docker reference docs",
      url: "https://docs.docker.com/reference/",
    },
    {
      title: "GitHub Actions Docs",
      typeName: "link",
      contentType: "url",
      description: "GitHub Actions workflow syntax reference",
      url: "https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions",
    },
  ]);

  // ── Terminal Commands ──────────────────────────────────────────
  await createCollection(
    "Terminal Commands",
    "Useful shell commands for everyday development",
    [
      {
        title: "Git — Undo Last Commit (keep changes)",
        typeName: "command",
        contentType: "text",
        description: "Soft-reset HEAD~1, leaving working tree intact",
        content: `git reset --soft HEAD~1`,
      },
      {
        title: "Docker — Remove All Stopped Containers",
        typeName: "command",
        contentType: "text",
        description: "Prune stopped containers and dangling images",
        isPinned: true,
        content: `docker container prune -f && docker image prune -f`,
      },
      {
        title: "Kill Process on Port",
        typeName: "command",
        contentType: "text",
        description: "Find and kill whatever is listening on a given port",
        content: `# macOS / Linux
lsof -ti tcp:3000 | xargs kill -9

# Windows (PowerShell)
# Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | Stop-Process -Force`,
      },
      {
        title: "npm — List Outdated Packages",
        typeName: "command",
        contentType: "text",
        description: "Show outdated deps and interactively update them",
        content: `npx npm-check-updates --interactive`,
      },
    ]
  );

  // ── Design Resources ───────────────────────────────────────────
  await createCollection("Design Resources", "UI/UX resources and references", [
    {
      title: "Tailwind CSS Docs",
      typeName: "link",
      contentType: "url",
      description: "Official Tailwind CSS utility reference",
      isFavorite: true,
      url: "https://tailwindcss.com/docs",
    },
    {
      title: "shadcn/ui Components",
      typeName: "link",
      contentType: "url",
      description: "Copy-paste component library built on Radix + Tailwind",
      url: "https://ui.shadcn.com/docs/components",
    },
    {
      title: "Radix UI Primitives",
      typeName: "link",
      contentType: "url",
      description: "Accessible, unstyled component primitives",
      url: "https://www.radix-ui.com/primitives/docs/overview/introduction",
    },
    {
      title: "Lucide Icons",
      typeName: "link",
      contentType: "url",
      description: "Open-source icon library used throughout the project",
      url: "https://lucide.dev/icons/",
    },
  ]);

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
