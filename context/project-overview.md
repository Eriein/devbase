# 🗃️ DevStash — Project Overview

> **One hub for all your developer knowledge.** Snippets, prompts, commands, links, notes, and files — searchable, organized, AI-enhanced.

---

## 📌 Problem

Developers keep their essentials scattered across too many tools:

Snippets in VS Code or Notion, AI prompts buried in chat history, context files lost in project folders, useful links spread across bookmarks, commands forgotten in bash history, and templates scattered in GitHub gists.

This creates **context switching**, **lost knowledge**, and **inconsistent workflows**. DevStash solves this by providing a single, fast, searchable, AI-enhanced hub for all developer resources.

---

## 👥 Target Users

| Persona | Primary Need |
|---|---|
| **Everyday Developer** | Fast access to snippets, prompts, commands, links |
| **AI-first Developer** | Save/organize prompts, contexts, workflows, system messages |
| **Content Creator / Educator** | Store code blocks, explanations, course notes |
| **Full-stack Builder** | Collect patterns, boilerplates, API examples |

---

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) / [React 19](https://react.dev/) (SSR + API routes, single repo) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [Neon PostgreSQL](https://neon.tech/) |
| **ORM** | [Prisma 7](https://www.prisma.io/) (use migrations only — never `db push`) |
| **Auth** | [NextAuth v5](https://authjs.dev/) (email/password + GitHub OAuth) |
| **File Storage** | [Cloudflare R2](https://developers.cloudflare.com/r2/) (file/image uploads) |
| **AI** | [OpenAI gpt-5-nano](https://platform.openai.com/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| **Caching** | Redis (under consideration) |

> ⚠️ **Database Rule:** Never use `db push` or directly modify the database structure. All schema changes go through Prisma migrations, run first in dev, then in prod.

---

## 🎨 Item Types

Each item has a system type. Users will eventually be able to create custom types (Pro only), but these system types are immutable:

| Type | Color | Hex | Icon | Content Model | Route |
|---|---|---|---|---|---|
| 🟦 Snippet | Blue | `#3b82f6` | `Code` | text | `/items/snippets` |
| 🟪 Prompt | Purple | `#8b5cf6` | `Sparkles` | text | `/items/prompts` |
| 🟧 Command | Orange | `#f97316` | `Terminal` | text | `/items/commands` |
| 🟨 Note | Yellow | `#fde047` | `StickyNote` | text | `/items/notes` |
| ⬜ File | Gray | `#6b7280` | `File` | file (Pro) | `/items/files` |
| 🟫 Image | Pink | `#ec4899` | `Image` | file (Pro) | `/items/images` |
| 🟩 Link | Emerald | `#10b981` | `Link` | url | `/items/links` |

Icons sourced from [Lucide Icons](https://lucide.dev/).

---

## 🗂️ Features

### A. Items

Items are the core unit. Each has a type (above), and items are quick to create and access via a slide-out drawer. Content model depends on type: `text` (snippet, note, prompt, command), `url` (link), or `file` (file, image).

### B. Collections

Users create named collections that hold items of any type. An item can belong to multiple collections.

Example collections: "React Patterns" (snippets + notes), "Context Files" (files), "Interview Prep" (snippets + prompts), "Python Snippets" (snippets).

### C. Search

Full-text search across content, tags, titles, and types.

### D. Authentication

Email/password and GitHub OAuth via NextAuth v5.

### E. General Features

- Collection and item favorites
- Pin items to top
- Recently used items
- Import code from a file
- Markdown editor for text-based types
- File upload for file/image types
- Export data (JSON/ZIP — Pro only)
- Dark mode default, light mode optional
- Add/remove items to/from multiple collections
- View which collections an item belongs to

### F. AI Features (Pro Only)

- AI auto-tag suggestions
- AI summaries
- AI "Explain This Code"
- Prompt optimizer

---

## 🗄️ Data Models (Prisma — Rough Draft)

> ⚠️ **This is a rough draft.** Field names, relations, and constraints will be refined during development.

```prisma
// schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── User (extends NextAuth) ──────────────────────────────────

model User {
  id                    String    @id @default(cuid())
  name                  String?
  email                 String    @unique
  emailVerified         DateTime?
  image                 String?
  isPro                 Boolean   @default(false)
  stripeCustomerId      String?   @unique
  stripeSubscriptionId  String?   @unique
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  accounts    Account[]
  sessions    Session[]
  items       Item[]
  collections Collection[]
  itemTypes   ItemType[]    // user-created custom types
}

// ─── NextAuth Models ──────────────────────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Item ─────────────────────────────────────────────────────

model Item {
  id          String    @id @default(cuid())
  title       String
  contentType String    // "text" | "url" | "file"
  content     String?   // text content (null if file type)
  fileUrl     String?   // Cloudflare R2 URL (null if text type)
  fileName    String?   // original filename
  fileSize    Int?      // bytes
  url         String?   // for link types
  description String?
  language    String?   // programming language (optional, for code)
  isFavorite  Boolean   @default(false)
  isPinned    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  itemTypeId String
  itemType   ItemType @relation(fields: [itemTypeId], references: [id])

  tags        ItemTag[]
  collections ItemCollection[]

  @@index([userId])
  @@index([itemTypeId])
}

// ─── ItemType ─────────────────────────────────────────────────

model ItemType {
  id       String  @id @default(cuid())
  name     String  // "snippet", "prompt", "command", etc.
  icon     String  // Lucide icon name
  color    String  // hex color
  isSystem Boolean @default(false)

  userId String? // null for system types
  user   User?   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items Item[]

  @@unique([name, userId]) // unique type name per user (system types have null userId)
}

// ─── Collection ───────────────────────────────────────────────

model Collection {
  id            String   @id @default(cuid())
  name          String   // "React Hooks", "Context Files", etc.
  description   String?
  isFavorite    Boolean  @default(false)
  defaultTypeId String?  // default ItemType for empty collections
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  items ItemCollection[]

  @@index([userId])
}

// ─── Join Tables ──────────────────────────────────────────────

model ItemCollection {
  itemId       String
  collectionId String
  addedAt      DateTime @default(now())

  item       Item       @relation(fields: [itemId], references: [id], onDelete: Cascade)
  collection Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  @@id([itemId, collectionId])
}

model Tag {
  id   String @id @default(cuid())
  name String @unique

  items ItemTag[]
}

model ItemTag {
  itemId String
  tagId  String

  item Item @relation(fields: [itemId], references: [id], onDelete: Cascade)
  tag  Tag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([itemId, tagId])
}
```

---

## 🔗 Entity Relationship Diagram

```
┌──────────┐       ┌───────────┐       ┌──────────────┐
│   User   │1─────*│   Item    │*─────*│  Collection  │
│          │       │           │  via   │              │
│ isPro    │       │ title     │ Item   │ name         │
│ stripe.. │       │ content   │ Coll.  │ description  │
└──────────┘       │ fileUrl   │       └──────────────┘
     │1            │ url       │
     │             └───────────┘
     │                  │*   │*
     *                  │    │
┌──────────┐      ┌─────┘    └─────┐
│ ItemType │1────*│              ┌──┴───┐
│          │      │              │ Tag  │
│ name     │  (itemType)    via  │      │
│ icon     │              ItemTag│ name │
│ color    │                     └──────┘
│ isSystem │
└──────────┘
```

**Key relationships:**
- User → Items: one-to-many
- User → Collections: one-to-many
- User → ItemTypes: one-to-many (custom types only; system types have null userId)
- Item → ItemType: many-to-one
- Item ↔ Collection: many-to-many (via `ItemCollection` join table)
- Item ↔ Tag: many-to-many (via `ItemTag` join table)

---

## 💰 Monetization (Freemium)

| | Free | Pro ($8/mo · $72/yr) |
|---|---|---|
| **Items** | 50 total | Unlimited |
| **Collections** | 3 | Unlimited |
| **Types** | System types (no file/image) | All types + custom types (later) |
| **Search** | Basic | Full |
| **File/Image Upload** | ✗ | ✓ (via Cloudflare R2) |
| **AI Features** | ✗ | Auto-tag, Explain Code, Summarize, Prompt Optimizer |
| **Export** | ✗ | JSON / ZIP |
| **Priority Support** | ✗ | ✓ |

> 💡 **Dev note:** During development, all users have access to everything. Pro gating will be enforced at launch via `user.isPro` checks and Stripe integration.

---

## 🖥️ UI/UX

### Design Direction

Modern, minimal, developer-focused. Dark mode by default. Clean typography with generous whitespace, subtle borders and shadows. Reference apps: Notion, Linear, Raycast.

### Layout

- **Sidebar** (collapsible, becomes drawer on mobile): item type links (Snippets, Commands, etc.) and latest collections.
- **Main area**: grid of color-coded collection cards (background color based on dominant item type). Items displayed as color-coded cards (border color by type).
- **Item detail**: opens in a quick-access slide-out drawer.
- **Syntax highlighting** for all code blocks.

### Responsive Strategy

Desktop-first, mobile-usable. Sidebar collapses to a hamburger/drawer on smaller screens.

### Micro-interactions

- Smooth transitions on navigation and state changes
- Hover states on cards
- Toast notifications for actions (save, delete, copy, etc.)
- Loading skeletons during data fetches

---

## 📂 Suggested Project Structure

```
devstash/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                  # seed system ItemTypes
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # auth routes (login, register)
│   │   ├── (dashboard)/         # main app layout
│   │   │   ├── items/
│   │   │   │   └── [type]/      # /items/snippets, /items/prompts, etc.
│   │   │   ├── collections/
│   │   │   │   └── [id]/
│   │   │   ├── search/
│   │   │   └── settings/
│   │   └── api/                 # API routes
│   │       ├── items/
│   │       ├── collections/
│   │       ├── tags/
│   │       ├── ai/
│   │       ├── upload/          # R2 file uploads
│   │       └── stripe/          # webhooks & checkout
│   ├── components/
│   │   ├── ui/                  # shadcn/ui primitives
│   │   ├── layout/              # Sidebar, Header, Drawer
│   │   ├── items/               # ItemCard, ItemDrawer, ItemForm
│   │   ├── collections/         # CollectionCard, CollectionGrid
│   │   └── search/              # SearchBar, SearchResults
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── auth.ts              # NextAuth config
│   │   ├── r2.ts                # Cloudflare R2 helpers
│   │   ├── ai.ts                # OpenAI integration
│   │   ├── stripe.ts            # Stripe helpers
│   │   └── constants.ts         # system types, colors, limits
│   ├── hooks/
│   └── types/
├── public/
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## 🚀 Suggested Build Order

1. **Project setup** — Next.js 16, TypeScript, Tailwind v4, shadcn/ui, ESLint
2. **Database** — Neon PostgreSQL, Prisma schema, initial migration, seed system types
3. **Auth** — NextAuth v5 with email/password + GitHub OAuth
4. **Core CRUD** — Items (create/read/update/delete by type), Collections, Tags
5. **UI shell** — Sidebar layout, collection grid, item cards, item drawer
6. **Search** — Full-text search across items
7. **File uploads** — Cloudflare R2 integration for file/image types
8. **AI features** — Auto-tag, Explain Code, Summarize, Prompt Optimizer (gated behind Pro)
9. **Stripe integration** — Pro subscriptions, checkout, webhooks
10. **Pro gating** — Enforce limits for free users (50 items, 3 collections, no files/AI)
11. **Polish** — Dark/light mode, micro-interactions, loading states, responsive tweaks
12. **Export** — JSON/ZIP export for Pro users

---

## 🔗 Key Links & Resources

| Resource | URL |
|---|---|
| Next.js Docs | [nextjs.org/docs](https://nextjs.org/docs) |
| Prisma Docs | [prisma.io/docs](https://www.prisma.io/docs) |
| NextAuth v5 | [authjs.dev](https://authjs.dev) |
| shadcn/ui | [ui.shadcn.com](https://ui.shadcn.com) |
| Tailwind CSS v4 | [tailwindcss.com](https://tailwindcss.com) |
| Neon PostgreSQL | [neon.tech/docs](https://neon.tech/docs) |
| Cloudflare R2 | [developers.cloudflare.com/r2](https://developers.cloudflare.com/r2) |
| Stripe Billing | [stripe.com/docs/billing](https://stripe.com/docs/billing) |
| OpenAI API | [platform.openai.com/docs](https://platform.openai.com/docs) |
| Lucide Icons | [lucide.dev](https://lucide.dev) |
