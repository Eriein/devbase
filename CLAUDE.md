# DevStash

A developer knowledge hub for snippets, prompts, commands, notes, files, images, links and custom item types.

## Context Files

Read the following to get the full context
of the project.

- @context/project-overview.md: Features, data models, tech stack, UI/UX
- @context/coding-standards.md: Code conventions and patterns
- @context/ai-interaction.md : Workflow and communication guidelines
- @context/current-feature.md: What we are currently working on

## Tech Stack

- Next.js 16 (App Router, Server Components)
- TypeScript (strict)
- Prisma + Neon PostgreSQL
- NextAuth v5 (Email + GitHub)
- Tailwind CSS v4 + shadcn/ui
- Cloudflare R2 (file storage)
- OpenAI gpt-5-nano
- Stripe (payments)

## Commands

- `npm run dev` — Start dev server (Next.js, http://localhost:3000)
- `npm run build` — Production build
- `npm run lint` — Run ESLint (flat config, eslint-config-next with core-web-vitals + typescript)

**IMPORTANT:** Do not add Claude to any commit messages
