# Implementation Progress

## Phase 1: Project Setup ✅
- [x] Initialize Next.js project with TypeScript
- [x] Configure Tailwind CSS
- [x] Setup shadcn/ui
- [x] Install dependencies (better-sqlite3, rss-parser, node-cron)
- [x] Configure ESLint, Prettier

## Phase 2: Database Layer ✅
- [x] Create database schema (feeds & articles tables)
- [x] Implement DB connection and queries
- [x] Create migration script

## Phase 3: Core RSS Functionality ✅
- [x] Implement RSS parser
- [x] Create feed fetcher service
- [x] Build API routes for feeds

## Phase 4: UI Components ✅
- [x] Install shadcn/ui components
- [x] Create layout components (Sidebar, Header)
- [x] Build feed management UI (AddFeedDialog, FeedActions)
- [x] Build article list UI (ArticleCard, ArticleList)

## Phase 5: Article Reading ✅
- [x] Article detail view (SSR)
- [x] Read/unread functionality
- [x] Favorites
- [ ] Navigation between articles

## Phase 6: Polish (Partial)
- [ ] Dark mode
- [x] Mobile responsive sidebar
- [ ] Keyboard shortcuts
- [ ] Search functionality
- [x] Settings page
- [x] Auto-fetch scheduling (per-feed periodic sync)

## Bugs Found & Fixed (via Playwright Testing)

### Bug 1: Default Next.js page overriding dashboard
**Issue:** The default `app/page.tsx` was conflicting with `app/(dashboard)/page.tsx`, causing the default Next.js starter page to show instead of the RSS Reader.

**Fix:** Removed the conflicting `app/page.tsx` file.

### Bug 2: Malformed JSX in sidebar.tsx
**Issue:** Line 71 had incorrect JSX syntax where `data-testid="sidebar"` was inserted inside the tag name:
```tsx
<Sidebar data-testid="sidebar"Header className="...">
```

**Fix:** Corrected to proper syntax:
```tsx
<SidebarHeader data-testid="sidebar" className="...">
```

### Bug 3: Missing Suspense boundary for useSearchParams
**Issue:** The dashboard page was using `useSearchParams()` without wrapping it in a Suspense boundary, causing build failures with Next.js 16.

**Fix:** Wrapped the DashboardContent component in a Suspense boundary:
```tsx
export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
```

## Files Created

### Core Files
- `types/index.ts` - TypeScript type definitions
- `lib/utils.ts` - Utility functions (cn, formatDistanceToNow, formatDate)

### Database Layer
- `lib/db/index.ts` - Database connection & initialization
- `lib/db/feeds.ts` - Feed queries (CRUD operations)
- `lib/db/articles.ts` - Article queries (CRUD operations)

### RSS Processing
- `lib/rss/parser.ts` - RSS feed parsing
- `lib/rss/fetcher.ts` - Feed fetching & article storage
- `lib/rss/scheduler.ts` - Per-feed sync scheduling
- `lib/rss/index.ts` - RSS module exports

### Initialization
- `lib/init.ts` - Application initialization (scheduler startup)

### API Routes
- `app/api/feeds/route.ts` - List/create feeds
- `app/api/feeds/[id]/route.ts` - Get/update/delete feed
- `app/api/feeds/[id]/refresh/route.ts` - Refresh single feed
- `app/api/articles/route.ts` - List/mark all read
- `app/api/articles/[id]/route.ts` - Get article
- `app/api/articles/[id]/read/route.ts` - Mark read/unread
- `app/api/articles/[id]/favorite/route.ts` - Toggle favorite
- `app/api/fetch/all/route.ts` - Refresh all feeds

### Components
- `components/layout/sidebar.tsx` - Navigation sidebar
- `components/layout/header.tsx` - Top header
- `components/shared/search-bar.tsx` - Search input
- `components/shared/empty-state.tsx` - Empty state display
- `components/shared/loading-skeleton.tsx` - Loading states
- `components/feeds/add-feed-dialog.tsx` - Add feed modal
- `components/feeds/feed-actions.tsx` - Feed action menu
- `components/articles/article-card.tsx` - Article list item
- `components/articles/article-list.tsx` - Article list container

### Hooks
- `hooks/use-feeds.ts` - Feed data fetching
- `hooks/use-articles.ts` - Article data fetching

### Pages
- `app/layout.tsx` - Root layout
- `app/(dashboard)/layout.tsx` - Dashboard layout
- `app/(dashboard)/page.tsx` - Home page (all articles)
- `app/(dashboard)/feed/[id]/page.tsx` - Feed detail page
- `app/(dashboard)/article/[id]/page.tsx` - Article detail page
- `app/(dashboard)/settings/page.tsx` - Settings page

### Testing
- `playwright.config.ts` - Playwright configuration
- `e2e/rss-reader.spec.ts` - E2E tests

### Configuration
- `.env.local` - Environment variables
- `.env.example` - Environment template
- `next.config.ts` - Next.js config (standalone output)
- `.gitignore` - Git ignore rules

## Auto-Fetch Scheduling Implementation

### Overview
Each channel/feed now syncs on its own schedule based on when it was added:

1. **Sync on Add**: When a feed is added, it syncs immediately and starts its periodic scheduler
2. **Periodic Sync**: Each feed syncs at regular intervals (default: 30 minutes) based on its `created_at` time
3. **Different Schedules**: Feeds added at different times will sync at different times, preventing all feeds from syncing simultaneously

### How It Works
- `lib/rss/scheduler.ts` - Manages per-feed sync timers using `setTimeout`
- `lib/init.ts` - Initializes all schedulers on app startup
- Schedulers are stopped when feeds are deleted or deactivated
- Schedulers restart when feeds are reactivated
- Last sync time is persisted to `last_fetched_at` in the database

### Environment Variable
```env
FETCH_INTERVAL_MINUTES=30  # Sync interval in minutes (default: 30)
```

### API Endpoint
- `GET /api/fetch/all` - Returns scheduler status with next sync times for all feeds

## Next Steps
1. Implement dark mode toggle
2. Add keyboard shortcuts for navigation
3. Add full-text search functionality
4. Add OPML import/export
5. Add article navigation (prev/next)
