# Current Feature

Dashboard UI Phase 3

## Status

<!-- Not Started|In Progress|Completed -->

In Progress

## Goals

<!-- Goals & requirements -->

- 4 stats cards at the top (total items, collections, favorite items, favorite collections)
- Recent collections section
- Pinned items section
- 10 recent items section
- Use mock data from `src/lib/mock-data.js` directly

## Notes

<!-- Any extra notes -->

Reference: `context/features/dashboard-phase-3-spec.md`
Reference screenshot: `context/screenshots/dashboard-ui-main.png`

## History

<!-- Keep this updated. Earliest to latest -->

- Project setup and boilerplate cleanup
- Initial set up: removed default Next.js SVGs and boilerplate, cleaned up globals.css and page.tsx, added CLAUDE.md and context files
- Dashboard UI Phase 1: initialized shadcn/ui, installed Button/Input components, created /dashboard route with layout, top bar (search, new item, new collection), sidebar and main placeholders, dark mode by default
- Dashboard UI Phase 2: collapsible sidebar with item types (color-coded icons, counts, PRO badges), collapsible collections section (sorted by recent, with counts), user avatar area, mobile drawer via Sheet component, useMediaQuery hook
