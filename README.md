# DevStash

A developer knowledge hub for storing and organizing snippets, prompts, commands, notes, links, and files — searchable, AI-enhanced, and built for fast access.

## Stack

| Layer         | Technology                                      |
| ------------- | ----------------------------------------------- |
| Framework     | Next.js 16 (App Router, Server Components)      |
| Language      | TypeScript (strict)                             |
| Database      | Neon PostgreSQL + Prisma 7                      |
| Auth          | NextAuth v5 (Email/Password + GitHub OAuth)     |
| File Storage  | Cloudflare R2                                   |
| AI            | OpenAI gpt-5-nano (Responses API)               |
| Payments      | Stripe (subscriptions + webhooks)               |
| Rate Limiting | Upstash Redis                                   |
| Styling       | Tailwind CSS v4 + shadcn/ui                     |
| Testing       | Vitest (318 unit tests)                         |

## Features

**Items** — Seven built-in types: Snippet, Prompt, Command, Note, Link, File, Image. Monaco editor for code, Markdown editor for prose, drag-and-drop file upload.

**Collections** — Group items of any type into named collections. Items can belong to multiple collections.

**Search** — Cmd+K command palette with fuzzy search across all items and collections.

**AI (Pro)** — Auto-tagging, auto-description, code explanation, and prompt optimizer — all powered by gpt-5-nano and gated behind the Pro subscription.

**Auth** — Email/password with verification flow, GitHub OAuth, forgot password with expiring reset tokens, and rate limiting on all auth endpoints.

**Freemium** — Free tier limited to 50 items and 3 collections. Pro ($8/mo) unlocks unlimited items, collections, file uploads, AI features, and data export.

**Editor Preferences** — Per-user font size, tab size, word wrap, and minimap settings persisted to the database and applied across all code editors.

## Getting Started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database
- A [Cloudflare R2](https://developers.cloudflare.com/r2/) bucket
- An [Upstash Redis](https://upstash.com) database
- OpenAI, Stripe, GitHub OAuth, and Resend accounts

### Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable                        | Description                              |
| ------------------------------- | ---------------------------------------- |
| `DATABASE_URL`                  | Neon PostgreSQL connection string        |
| `AUTH_SECRET`                   | NextAuth secret (generate with `openssl rand -base64 32`) |
| `AUTH_GITHUB_ID`                | GitHub OAuth App client ID               |
| `AUTH_GITHUB_SECRET`            | GitHub OAuth App client secret           |
| `RESEND_API_KEY`                | Resend API key for transactional email   |
| `UPSTASH_REDIS_REST_URL`        | Upstash Redis REST URL                   |
| `UPSTASH_REDIS_REST_TOKEN`      | Upstash Redis REST token                 |
| `R2_ACCOUNT_ID`                 | Cloudflare account ID                    |
| `R2_ACCESS_KEY_ID`              | R2 access key                            |
| `R2_SECRET_ACCESS_KEY`          | R2 secret key                            |
| `R2_BUCKET_NAME`                | R2 bucket name                           |
| `R2_PUBLIC_URL`                 | R2 public URL (for download proxy)       |
| `OPENAI_API_KEY`                | OpenAI API key                           |
| `STRIPE_SECRET_KEY`             | Stripe secret key                        |
| `STRIPE_WEBHOOK_SECRET`         | Stripe webhook signing secret            |
| `STRIPE_PRO_MONTHLY_PRICE_ID`   | Stripe monthly price ID                  |
| `STRIPE_PRO_YEARLY_PRICE_ID`    | Stripe yearly price ID                   |
| `ENABLE_EMAIL_VERIFICATION`     | `true` to require email verification (default: `false`) |

### Setup

```bash
npm install

# Run database migrations
npx prisma migrate dev

# Seed system item types and demo data
npx prisma db seed

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest unit tests
npm run test:watch   # Vitest in watch mode
npm run db:migrate   # Run pending Prisma migrations
npm run db:seed      # Seed system item types + demo data
npm run db:studio    # Open Prisma Studio
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Sign-in, register, forgot/reset password, verify email
│   ├── (dashboard)/     # Main app: dashboard, items, collections, search, favorites, settings
│   └── api/             # Route handlers: auth, items, collections, search, upload, stripe, AI
├── components/
│   ├── ui/              # shadcn/ui primitives
│   ├── layout/          # Sidebar, TopBar, DashboardShell
│   ├── items/           # ItemCard, ItemDrawer, CreateItemDialog
│   ├── collections/     # CollectionCard, EditCollectionDialog
│   ├── homepage/        # Landing page sections
│   └── shared/          # FormBanner, AuthLink, UserAvatar, DeleteCollectionDialog
├── lib/
│   ├── actions/         # Server actions (items, collections, auth, AI, stripe)
│   ├── db/              # Prisma query functions
│   ├── ai-*-validation  # Pure AI prompt/response helpers
│   ├── rate-limit.ts    # Upstash rate limiter configs
│   ├── stripe.ts        # Stripe client + price map
│   ├── openai.ts        # OpenAI client singleton
│   └── r2.ts            # Cloudflare R2 helpers
└── types/               # Shared TypeScript types
```
