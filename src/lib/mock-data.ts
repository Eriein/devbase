// Mock data for dashboard UI development
// Replace with real database queries once Prisma is set up

// ─── Types ───────────────────────────────────────────────────

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
}

interface ItemType {
  id: string;
  name: string;
  icon: string;
  color: string;
  isSystem: boolean;
}

interface Tag {
  id: string;
  name: string;
}

interface Item {
  id: string;
  title: string;
  contentType: "text" | "url" | "file";
  content: string | null;
  fileUrl: string | null;
  url: string | null;
  description: string | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  itemTypeId: string;
  tags: Tag[];
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  itemIds: string[];
}

// ─── Current User ────────────────────────────────────────────

export const currentUser: User = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
  image: null,
  isPro: true,
};

// ─── System Item Types ───────────────────────────────────────

export const itemTypes: ItemType[] = [
  { id: "type_snippet", name: "Snippet", icon: "Code", color: "#3b82f6", isSystem: true },
  { id: "type_prompt", name: "Prompt", icon: "Sparkles", color: "#8b5cf6", isSystem: true },
  { id: "type_command", name: "Command", icon: "Terminal", color: "#f97316", isSystem: true },
  { id: "type_note", name: "Note", icon: "StickyNote", color: "#fde047", isSystem: true },
  { id: "type_file", name: "File", icon: "File", color: "#6b7280", isSystem: true },
  { id: "type_image", name: "Image", icon: "Image", color: "#ec4899", isSystem: true },
  { id: "type_link", name: "Link", icon: "Link", color: "#10b981", isSystem: true },
];

// ─── Items ───────────────────────────────────────────────────

export const items: Item[] = [
  // Snippets
  {
    id: "item_1",
    title: "useDebounce Hook",
    contentType: "text",
    content: "export function useDebounce<T>(value: T, delay: number): T {\n  const [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    const timer = setTimeout(() => setDebounced(value), delay);\n    return () => clearTimeout(timer);\n  }, [value, delay]);\n  return debounced;\n}",
    fileUrl: null,
    url: null,
    description: "Custom React hook for debouncing values",
    language: "typescript",
    isFavorite: true,
    isPinned: true,
    createdAt: "2026-03-16T10:00:00Z",
    updatedAt: "2026-03-16T10:00:00Z",
    userId: "user_1",
    itemTypeId: "type_snippet",
    tags: [{ id: "tag_1", name: "react" }, { id: "tag_2", name: "hooks" }],
  },
  {
    id: "item_2",
    title: "API Error Handling",
    contentType: "text",
    content: "async function fetchWithRetry(url: string, retries = 3): Promise<Response> {\n  for (let i = 0; i < retries; i++) {\n    try {\n      const res = await fetch(url);\n      if (!res.ok) throw new Error(res.statusText);\n      return res;\n    } catch (err) {\n      if (i === retries - 1) throw err;\n    }\n  }\n  throw new Error('Unreachable');\n}",
    fileUrl: null,
    url: null,
    description: "Fetch wrapper with retry logic",
    language: "typescript",
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-03-15T14:00:00Z",
    updatedAt: "2026-03-15T14:00:00Z",
    userId: "user_1",
    itemTypeId: "type_snippet",
    tags: [{ id: "tag_3", name: "api" }, { id: "tag_4", name: "error-handling" }],
  },
  {
    id: "item_3",
    title: "Prisma Pagination",
    contentType: "text",
    content: "const items = await prisma.item.findMany({\n  skip: (page - 1) * pageSize,\n  take: pageSize,\n  orderBy: { createdAt: 'desc' },\n});",
    fileUrl: null,
    url: null,
    description: "Prisma cursor-based pagination pattern",
    language: "typescript",
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-03-14T09:00:00Z",
    updatedAt: "2026-03-14T09:00:00Z",
    userId: "user_1",
    itemTypeId: "type_snippet",
    tags: [{ id: "tag_5", name: "prisma" }, { id: "tag_6", name: "database" }],
  },
  {
    id: "item_4",
    title: "Zod Form Validation",
    contentType: "text",
    content: "const schema = z.object({\n  email: z.string().email(),\n  password: z.string().min(8),\n});\n\ntype FormData = z.infer<typeof schema>;",
    fileUrl: null,
    url: null,
    description: "Zod schema for form validation with type inference",
    language: "typescript",
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-03-13T16:00:00Z",
    updatedAt: "2026-03-13T16:00:00Z",
    userId: "user_1",
    itemTypeId: "type_snippet",
    tags: [{ id: "tag_7", name: "zod" }, { id: "tag_8", name: "validation" }],
  },

  // Prompts
  {
    id: "item_5",
    title: "Code Review Assistant",
    contentType: "text",
    content: "You are an expert code reviewer. Analyze the following code for:\n1. Security vulnerabilities\n2. Performance issues\n3. Code style and best practices\n4. Potential bugs\n\nProvide specific, actionable feedback with code examples.",
    fileUrl: null,
    url: null,
    description: "System prompt for AI code review",
    language: null,
    isFavorite: true,
    isPinned: true,
    createdAt: "2026-03-16T08:00:00Z",
    updatedAt: "2026-03-16T08:00:00Z",
    userId: "user_1",
    itemTypeId: "type_prompt",
    tags: [{ id: "tag_9", name: "ai" }, { id: "tag_10", name: "review" }],
  },
  {
    id: "item_6",
    title: "SQL Query Optimizer",
    contentType: "text",
    content: "Analyze this SQL query and suggest optimizations. Consider indexing, query structure, and potential N+1 issues.",
    fileUrl: null,
    url: null,
    description: "Prompt for optimizing SQL queries",
    language: null,
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-03-12T11:00:00Z",
    updatedAt: "2026-03-12T11:00:00Z",
    userId: "user_1",
    itemTypeId: "type_prompt",
    tags: [{ id: "tag_11", name: "sql" }, { id: "tag_9", name: "ai" }],
  },

  // Commands
  {
    id: "item_7",
    title: "Docker Cleanup",
    contentType: "text",
    content: "docker system prune -a --volumes -f",
    fileUrl: null,
    url: null,
    description: "Remove all unused Docker resources",
    language: "bash",
    isFavorite: false,
    isPinned: true,
    createdAt: "2026-03-16T07:00:00Z",
    updatedAt: "2026-03-16T07:00:00Z",
    userId: "user_1",
    itemTypeId: "type_command",
    tags: [{ id: "tag_12", name: "docker" }, { id: "tag_13", name: "cleanup" }],
  },
  {
    id: "item_8",
    title: "Git Interactive Rebase",
    contentType: "text",
    content: "git rebase -i HEAD~5",
    fileUrl: null,
    url: null,
    description: "Rebase last 5 commits interactively",
    language: "bash",
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-03-11T15:00:00Z",
    updatedAt: "2026-03-11T15:00:00Z",
    userId: "user_1",
    itemTypeId: "type_command",
    tags: [{ id: "tag_14", name: "git" }],
  },

  // Notes
  {
    id: "item_9",
    title: "Auth Flow Notes",
    contentType: "text",
    content: "## NextAuth v5 Setup\n\n1. Configure providers (GitHub + Credentials)\n2. Set up Prisma adapter\n3. Define session strategy (JWT)\n4. Add middleware for protected routes\n\n**Important:** Use `auth()` in server components, `useSession()` in client components.",
    fileUrl: null,
    url: null,
    description: "Notes on implementing NextAuth v5",
    language: null,
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-03-10T12:00:00Z",
    updatedAt: "2026-03-10T12:00:00Z",
    userId: "user_1",
    itemTypeId: "type_note",
    tags: [{ id: "tag_15", name: "auth" }, { id: "tag_16", name: "nextauth" }],
  },
  {
    id: "item_10",
    title: "Deployment Checklist",
    contentType: "text",
    content: "- [ ] Run migrations\n- [ ] Check env variables\n- [ ] Test OAuth callbacks\n- [ ] Verify R2 bucket permissions\n- [ ] Test Stripe webhooks\n- [ ] Check rate limiting",
    fileUrl: null,
    url: null,
    description: "Pre-deployment checklist",
    language: null,
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-03-09T10:00:00Z",
    updatedAt: "2026-03-09T10:00:00Z",
    userId: "user_1",
    itemTypeId: "type_note",
    tags: [{ id: "tag_17", name: "deployment" }],
  },

  // Links
  {
    id: "item_11",
    title: "Next.js App Router Docs",
    contentType: "url",
    content: null,
    fileUrl: null,
    url: "https://nextjs.org/docs/app",
    description: "Official Next.js App Router documentation",
    language: null,
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-03-08T09:00:00Z",
    updatedAt: "2026-03-08T09:00:00Z",
    userId: "user_1",
    itemTypeId: "type_link",
    tags: [{ id: "tag_18", name: "nextjs" }, { id: "tag_19", name: "docs" }],
  },
  {
    id: "item_12",
    title: "Tailwind CSS v4 Migration",
    contentType: "url",
    content: null,
    fileUrl: null,
    url: "https://tailwindcss.com/docs/upgrade-guide",
    description: "Guide for migrating from Tailwind v3 to v4",
    language: null,
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-03-07T14:00:00Z",
    updatedAt: "2026-03-07T14:00:00Z",
    userId: "user_1",
    itemTypeId: "type_link",
    tags: [{ id: "tag_20", name: "tailwind" }, { id: "tag_19", name: "docs" }],
  },

  // Files (Pro)
  {
    id: "item_13",
    title: "ESLint Config",
    contentType: "file",
    content: null,
    fileUrl: "https://r2.example.com/eslint-config.json",
    url: null,
    description: "Shared ESLint configuration",
    language: null,
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-03-06T11:00:00Z",
    updatedAt: "2026-03-06T11:00:00Z",
    userId: "user_1",
    itemTypeId: "type_file",
    tags: [{ id: "tag_21", name: "config" }],
  },

  // Images (Pro)
  {
    id: "item_14",
    title: "Architecture Diagram",
    contentType: "file",
    content: null,
    fileUrl: "https://r2.example.com/architecture.png",
    url: null,
    description: "System architecture overview",
    language: null,
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-03-05T16:00:00Z",
    updatedAt: "2026-03-05T16:00:00Z",
    userId: "user_1",
    itemTypeId: "type_image",
    tags: [{ id: "tag_22", name: "architecture" }],
  },
];

// ─── Collections ─────────────────────────────────────────────

export const collections: Collection[] = [
  {
    id: "col_1",
    name: "React Patterns",
    description: "Common React patterns and best practices",
    isFavorite: true,
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-16T10:00:00Z",
    userId: "user_1",
    itemIds: ["item_1", "item_2", "item_4", "item_5", "item_9", "item_11"],
  },
  {
    id: "col_2",
    name: "AI Context Files",
    description: "System prompts and context files for AI tools",
    isFavorite: false,
    createdAt: "2026-03-02T10:00:00Z",
    updatedAt: "2026-03-15T10:00:00Z",
    userId: "user_1",
    itemIds: ["item_5", "item_6", "item_13", "item_14"],
  },
  {
    id: "col_3",
    name: "Interview Prep",
    description: "Coding interview questions and solutions",
    isFavorite: false,
    createdAt: "2026-03-03T10:00:00Z",
    updatedAt: "2026-03-14T10:00:00Z",
    userId: "user_1",
    itemIds: ["item_1", "item_2", "item_3", "item_4", "item_9"],
  },
  {
    id: "col_4",
    name: "Shell Commands",
    description: "Useful terminal commands and scripts",
    isFavorite: false,
    createdAt: "2026-03-04T10:00:00Z",
    updatedAt: "2026-03-16T07:00:00Z",
    userId: "user_1",
    itemIds: ["item_7", "item_8"],
  },
  {
    id: "col_5",
    name: "Project Notes",
    description: "Development notes and documentation",
    isFavorite: true,
    createdAt: "2026-03-05T10:00:00Z",
    updatedAt: "2026-03-10T12:00:00Z",
    userId: "user_1",
    itemIds: ["item_9", "item_10", "item_11", "item_12"],
  },
  {
    id: "col_6",
    name: "Useful Links",
    description: "Documentation and resource links",
    isFavorite: false,
    createdAt: "2026-03-06T10:00:00Z",
    updatedAt: "2026-03-08T09:00:00Z",
    userId: "user_1",
    itemIds: ["item_11", "item_12"],
  },
];
