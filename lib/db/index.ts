import Database from 'better-sqlite3';
import { Feed, Article } from '@/types';

const DB_PATH = process.env.DATABASE_URL || './data/rss.db';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

export function initDb(): void {
  const database = getDb();
  
  database.exec(`
    CREATE TABLE IF NOT EXISTS feeds (
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

    CREATE TABLE IF NOT EXISTS articles (
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

    CREATE INDEX IF NOT EXISTS idx_articles_feed_id ON articles(feed_id);
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_articles_is_read ON articles(is_read);
    CREATE INDEX IF NOT EXISTS idx_articles_is_favorite ON articles(is_favorite);
    CREATE INDEX IF NOT EXISTS idx_feeds_category ON feeds(category);
  `);
}

export function rowToFeed(row: Record<string, unknown>): Feed {
  return {
    id: row.id as number,
    url: row.url as string,
    title: row.title as string,
    description: row.description as string | null,
    siteUrl: row.site_url as string | null,
    favicon: row.favicon as string | null,
    category: row.category as string,
    lastFetchedAt: row.last_fetched_at as number | null,
    fetchError: row.fetch_error as string | null,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at as number,
  };
}

export function rowToArticle(row: Record<string, unknown>): Article {
  return {
    id: row.id as number,
    feedId: row.feed_id as number,
    guid: row.guid as string | null,
    title: row.title as string,
    content: row.content as string | null,
    summary: row.summary as string | null,
    url: row.url as string,
    author: row.author as string | null,
    publishedAt: row.published_at as number,
    isRead: Boolean(row.is_read),
    isFavorite: Boolean(row.is_favorite),
    createdAt: row.created_at as number,
  };
}
