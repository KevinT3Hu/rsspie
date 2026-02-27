import { getDb, rowToFeed } from './index';
import type { Feed, CreateFeedInput, UpdateFeedInput } from '@/types';
import { stopFeedScheduler, startFeedScheduler } from '@/lib/rss/scheduler';

export function getAllFeeds(): Feed[] {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM feeds ORDER BY category, title').all() as Record<string, unknown>[];
  return rows.map(rowToFeed);
}

export function getFeedById(id: number): Feed | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM feeds WHERE id = ?').get(id);
  return row ? rowToFeed(row as Record<string, unknown>) : null;
}

export function getFeedByUrl(url: string): Feed | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM feeds WHERE url = ?').get(url);
  return row ? rowToFeed(row as Record<string, unknown>) : null;
}

export function createFeed(input: CreateFeedInput & { title: string; description?: string; siteUrl?: string; favicon?: string }): Feed {
  const db = getDb();
  const result = db.prepare(
    `INSERT INTO feeds (url, title, description, site_url, favicon, category)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    input.url,
    input.title,
    input.description || null,
    input.siteUrl || null,
    input.favicon || null,
    input.category || 'Uncategorized'
  );
  
  const feed = getFeedById(result.lastInsertRowid as number);
  if (!feed) {
    throw new Error('Failed to create feed');
  }
  return feed;
}

export function updateFeed(id: number, input: UpdateFeedInput): Feed | null {
  const db = getDb();
  
  // Get current feed state to check if isActive is changing
  const currentFeed = getFeedById(id);
  if (!currentFeed) return null;
  
  const fields: string[] = [];
  const values: (string | number | boolean | null)[] = [];
  
  if (input.title !== undefined) {
    fields.push('title = ?');
    values.push(input.title);
  }
  if (input.category !== undefined) {
    fields.push('category = ?');
    values.push(input.category);
  }
  if (input.isActive !== undefined) {
    fields.push('is_active = ?');
    values.push(input.isActive ? 1 : 0);
  }
  
  if (fields.length === 0) return getFeedById(id);
  
  values.push(id);
  db.prepare(`UPDATE feeds SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  
  const updatedFeed = getFeedById(id);
  
  // Handle scheduler start/stop based on isActive change
  if (updatedFeed && input.isActive !== undefined && input.isActive !== currentFeed.isActive) {
    if (input.isActive) {
      // Feed was activated, start its scheduler
      startFeedScheduler(updatedFeed);
    } else {
      // Feed was deactivated, stop its scheduler
      stopFeedScheduler(id);
    }
  }
  
  return updatedFeed;
}

export function deleteFeed(id: number): boolean {
  // Stop the scheduler for this feed before deleting
  stopFeedScheduler(id);
  
  const db = getDb();
  const result = db.prepare('DELETE FROM feeds WHERE id = ?').run(id);
  return result.changes > 0;
}

export function updateFeedFetchStatus(id: number, error: string | null): void {
  const db = getDb();
  db.prepare(
    'UPDATE feeds SET last_fetched_at = unixepoch(), fetch_error = ? WHERE id = ?'
  ).run(error, id);
}

export function getFeedsWithUnreadCount(): Feed[] {
  const db = getDb();
  const rows = db.prepare(`
    SELECT f.*, COUNT(a.id) as unread_count
    FROM feeds f
    LEFT JOIN articles a ON f.id = a.feed_id AND a.is_read = 0
    GROUP BY f.id
    ORDER BY f.category, f.title
  `).all() as Record<string, unknown>[];
  
  return rows.map(row => ({
    ...rowToFeed(row),
    unreadCount: row.unread_count as number,
  }));
}

export function getCategories(): string[] {
  const db = getDb();
  const rows = db.prepare('SELECT DISTINCT category FROM feeds ORDER BY category').all() as Record<string, unknown>[];
  return rows.map(row => row.category as string);
}
