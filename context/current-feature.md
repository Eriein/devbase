# Current Feature

## Prisma + Neon PostgreSQL Setup

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

- Install and configure Prisma 7 with Neon PostgreSQL (serverless)
- Create initial schema based on data models in project-overview.md
- Include NextAuth models (Account, Session, VerificationToken)
- Add appropriate indexes and cascade deletes
- Create initial migration (never use `db push`)
- Seed system ItemTypes (snippet, prompt, command, note, file, image, link)
- Create Prisma client singleton at `src/lib/prisma.ts`

## Notes

- Use Prisma 7 — has breaking changes, review upgrade guide before implementing
- Always create migrations, never use `db push`
- DATABASE_URL = development branch on Neon
- Seed file: `prisma/seed.ts` for system ItemTypes

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Initial set up: removed default Next.js SVGs and boilerplate, cleaned up globals.css and page.tsx, added CLAUDE.md and context files
- Dashboard UI Phase 1: initialized shadcn/ui, installed Button/Input components, created /dashboard route with layout, top bar (search, new item, new collection), sidebar and main placeholders, dark mode by default
- Dashboard UI Phase 2: collapsible sidebar with item types (color-coded icons, counts, PRO badges), collapsible collections section (sorted by recent, with counts), user avatar area, mobile drawer via Sheet component, useMediaQuery hook
- Dashboard UI Phase 3: main content area with 4 stats cards (items, collections, favorites), collections grid (sorted by recent, with type icons and item count), pinned items section, 10 recent items section — all from mock data
