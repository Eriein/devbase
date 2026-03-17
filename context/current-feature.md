# Current Feature

## Status

<!-- Not Started|In Progress|Completed -->

Not Started

## Goals

<!-- Goals & requirements -->

## Notes

<!-- Any extra notes -->

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Initial set up: removed default Next.js SVGs and boilerplate, cleaned up globals.css and page.tsx, added CLAUDE.md and context files
- Dashboard UI Phase 1: initialized shadcn/ui, installed Button/Input components, created /dashboard route with layout, top bar (search, new item, new collection), sidebar and main placeholders, dark mode by default
- Dashboard UI Phase 2: collapsible sidebar with item types (color-coded icons, counts, PRO badges), collapsible collections section (sorted by recent, with counts), user avatar area, mobile drawer via Sheet component, useMediaQuery hook
- Dashboard UI Phase 3: main content area with 4 stats cards (items, collections, favorites), collections grid (sorted by recent, with type icons and item count), pinned items section, 10 recent items section — all from mock data
- Database setup: Prisma 7 + Neon PostgreSQL — schema with all models (User, NextAuth, Item, ItemType, Collection, Tag + join tables), initial migration, system ItemType seed, PrismaClient singleton with PrismaPg adapter, db:* npm scripts, scripts/test-db.ts
- Seed data: demo user (demo@devstash.io), 7 system item types, 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with 18 items total; installed bcryptjs
