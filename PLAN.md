# RSS Reader Implementation Plan

## Overview
A self-hosted RSS reader with modern UI, built with Next.js (App Router), TypeScript, shadcn/ui components, and SQLite database.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | SQLite (better-sqlite3) |
| RSS Parsing | rss-parser |
| Scheduling | node-cron |
| Icons | Lucide React |

---

## Project Structure

```
rss-reader/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── layout.tsx            # Main layout with sidebar
│   │   ├── page.tsx              # Dashboard home (article list)
│   │   ├── feed/[id]/            # Feed-specific views
│   │   ├── article/[id]/         # Article detail view
│   │   └── settings/             # Settings page
│   ├── api/                      # API routes
│   │   ├── feeds/                # Feed CRUD
│   │   ├── articles/             # Article operations
│   │   └── fetch/                # Manual fetch trigger
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── mobile-nav.tsx
│   ├── feeds/                    # Feed components
│   │   ├── feed-list.tsx
│   │   ├── feed-item.tsx
│   │   ├── add-feed-dialog.tsx
│   │   └── feed-context-menu.tsx
│   ├── articles/                 # Article components
│   │   ├── article-list.tsx
│   │   ├── article-card.tsx
│   │   ├── article-detail.tsx
│   │   └── article-actions.tsx
│   └── shared/                   # Shared components
│       ├── empty-state.tsx
│       ├── loading-skeleton.tsx
│       └── search-bar.tsx
├── lib/                          # Utility libraries
│   ├── db/                       # Database layer
│   │   ├── index.ts              # DB connection
│   │   ├── schema.ts             # Schema definitions
│   │   ├── feeds.ts              # Feed queries
│   │   └── articles.ts           # Article queries
│   ├── rss/                      # RSS processing
│   │   ├── fetcher.ts            # Feed fetcher
│   │   └── parser.ts             # RSS parser
│   ├── utils.ts                  # General utilities
│   └── constants.ts              # App constants
├── hooks/                        # Custom React hooks
│   ├── use-feeds.ts
│   ├── use-articles.ts
│   └── use-mobile.ts
├── types/                        # TypeScript types
│   └── index.ts
├── public/                       # Static assets
├── scripts/                      # Utility scripts
│   └── init-db.ts                # Database initialization
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Database Schema

```sql
-- Feeds table
CREATE TABLE feeds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  site_url TEXT,
  favicon TEXT,
  category TEXT DEFAULT 'Uncategorized',
  last_fetched_at INTEGER,
  fetch_error TEXT,
  is_active INTEGER DEFAULT 1,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Articles table
CREATE TABLE articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  feed_id INTEGER NOT NULL,
  guid TEXT,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  url TEXT NOT NULL,
  author TEXT,
  published_at INTEGER NOT NULL,
  is_read INTEGER DEFAULT 0,
  is_favorite INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (feed_id) REFERENCES feeds(id) ON DELETE CASCADE,
  UNIQUE(feed_id, guid)
);

-- Indexes
CREATE INDEX idx_articles_feed_id ON articles(feed_id);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_is_read ON articles(is_read);
CREATE INDEX idx_articles_is_favorite ON articles(is_favorite);
CREATE INDEX idx_feeds_category ON feeds(category);
```

---

## Core Features

### 1. Feed Management
- Add feed by URL (with validation)
- Remove feed
- Edit feed (rename, change category)
- Organize feeds by categories
- View feed metadata (title, description, favicon)
- Manual refresh individual feed
- Bulk refresh all feeds

### 2. Article Reading
- List articles (all, by feed, unread only, favorites)
- Infinite scroll pagination
- Article cards with preview
- Full article view (SSR for SEO)
- Mark as read/unread
- Toggle favorites
- Reading time estimation
- Image preview

### 3. Navigation & Layout
- Collapsible sidebar with feed list
- Mobile-responsive drawer navigation
- Keyboard shortcuts
- Search articles
- Filter by: All, Unread, Favorites, Today, Week

### 4. Settings
- Auto-fetch interval
- Display preferences (compact/comfortable)
- Theme toggle (light/dark/system)
- Data management (clear old articles)

---

## UI Design (Modern Aesthetic)

### Color Palette
- Primary: Neutral slate/zinc scale
- Accent: Indigo or Violet for actions
- Background: White/Light gray (light), Slate-950 (dark)
- Text: High contrast, readable

### Layout
- Left sidebar (280px) - feeds & categories
- Main content - article list or reading view
- Clean, spacious design with good whitespace
- Rounded corners (lg/xl)
- Subtle shadows and borders

### Typography
- System font stack (Inter as fallback)
- Clear hierarchy: articles > feeds > metadata
- Comfortable line height for reading

---

## API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/feeds` | GET | List all feeds |
| `/api/feeds` | POST | Add new feed |
| `/api/feeds/[id]` | PUT | Update feed |
| `/api/feeds/[id]` | DELETE | Delete feed |
| `/api/feeds/[id]/refresh` | POST | Refresh single feed |
| `/api/articles` | GET | List articles (with filters) |
| `/api/articles/[id]` | GET | Get article detail |
| `/api/articles/[id]/read` | PUT | Mark as read/unread |
| `/api/articles/[id]/favorite` | PUT | Toggle favorite |
| `/api/fetch/all` | POST | Trigger fetch all feeds |

---

## Implementation Phases

### Phase 1: Project Setup
1. Initialize Next.js project with TypeScript
2. Configure Tailwind CSS
3. Setup shadcn/ui
4. Install dependencies (better-sqlite3, rss-parser, node-cron)
5. Configure ESLint, Prettier

### Phase 2: Database Layer
1. Create database schema
2. Implement DB connection and queries
3. Create migration script

### Phase 3: Core RSS Functionality
1. Implement RSS parser
2. Create feed fetcher service
3. Build API routes for feeds

### Phase 4: UI Components
1. Install shadcn/ui components (Button, Card, Dialog, Input, Sidebar, etc.)
2. Create layout components
3. Build feed management UI
4. Build article list UI

### Phase 5: Article Reading
1. Article detail view (SSR)
2. Read/unread functionality
3. Favorites
4. Navigation between articles

### Phase 6: Polish
1. Dark mode
2. Mobile responsiveness
3. Keyboard shortcuts
4. Search functionality
5. Settings page
6. Auto-fetch scheduling

---

## shadcn/ui Components to Install

```bash
npx shadcn add button
npx shadcn add card
npx shadcn add input
npx shadcn add dialog
npx shadcn add dropdown-menu
npx shadcn add sidebar
npx shadcn add tooltip
npx shadcn add badge
npx shadcn add separator
npx shadcn add scroll-area
npx shadcn add skeleton
npx shadcn add toast
npx shadcn add tabs
npx shadcn add toggle
npx shadcn add toggle-group
npx shadcn add context-menu
npx shadcn add select
npx shadcn add switch
npx shadcn add label
```

---

## Environment Variables

```env
# .env.local
DATABASE_URL=./data/rss.db
FETCH_INTERVAL_MINUTES=30
MAX_ARTICLES_PER_FEED=100
```

---

## Build & Deploy

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## Future Enhancements

- OPML import/export
- Full-text search (SQLite FTS)
- Feed folders/tags
- Article sharing
- PWA support
- Authentication (multi-user)
- WebSocket for real-time updates
