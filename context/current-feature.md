# Current Feature

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Feature:

Quick Win Fixes from Audit - 2026-03-18

## Goals

- **[src/app/dashboard/page.tsx]** Replace dynamic `await import("@/lib/prisma")` with a static top-level `import { prisma } from "@/lib/prisma"` — consistency + avoids re-resolving the module on each render
- **[src/app/dashboard/layout.tsx]** Same dynamic Prisma import fix as above
- **[src/lib/db/item-types.ts:19-22]** In `getSystemItemTypes`, replace `select: { id: true }` with `_count: true` on the items relation — avoids fetching row IDs just to call `.length` in JS
- **[src/components/dashboard/Sidebar.tsx:65-78]** Pre-sort `sidebarCollections` once instead of sorting twice with identical logic for favorites and recents

## Notes

<!-- Any extra notes -->

All fixes are low-risk, 1–5 line changes. No auth or schema changes involved.

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Initial set up: removed default Next.js SVGs and boilerplate, cleaned up globals.css and page.tsx, added CLAUDE.md and context files
- Dashboard UI Phase 1: initialized shadcn/ui, installed Button/Input components, created /dashboard route with layout, top bar (search, new item, new collection), sidebar and main placeholders, dark mode by default
- Dashboard UI Phase 2: collapsible sidebar with item types (color-coded icons, counts, PRO badges), collapsible collections section (sorted by recent, with counts), user avatar area, mobile drawer via Sheet component, useMediaQuery hook
- Dashboard UI Phase 3: main content area with 4 stats cards (items, collections, favorites), collections grid (sorted by recent, with type icons and item count), pinned items section, 10 recent items section — all from mock data
- Database setup: Prisma 7 + Neon PostgreSQL — schema with all models (User, NextAuth, Item, ItemType, Collection, Tag + join tables), initial migration, system ItemType seed, PrismaClient singleton with PrismaPg adapter, db:\* npm scripts, scripts/test-db.ts
- Seed data: demo user (demo@devstash.io), 7 system item types, 5 collections (React Patterns, AI Workflows, DevOps, Terminal Commands, Design Resources) with 18 items total; installed bcryptjs
- Dashboard Collections — Real Data: created src/lib/db/collections.ts with getRecentCollections and getCollectionStats; converted dashboard page to async server component; collections grid now uses real Neon DB data with dominant type border color and type icons; collection/favorite stats from DB
- Dashboard Items — Real Data: created src/lib/db/items.ts with getPinnedItems, getRecentItems, getItemStats; dashboard page fully migrated off mock-data.ts; all four stat cards now from DB; pinned section hidden when empty
- Sidebar stats - Real Data and Sidebar Favorites & Recent: moved favorites and recent links inside collapsible Collections section; added favorite and recent collections displayed below their respective headers with collection items
- Add Pro Badge to Sidebar: installed shadcn/ui Badge component; replaced inline span with Badge (variant="outline") on Files and Images item types; badge uses type color for background/border; item count now always visible alongside the PRO badge
