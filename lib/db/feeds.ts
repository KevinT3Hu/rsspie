import { getDb, rowToFeed } from './index';
import { Feed, CreateFeedInput, UpdateFeedInput } from '@/types';

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
  
  return getFeedById(result.lastInsertRowid as number)!;
}

export function updateFeed(id: number, input: UpdateFeedInput): Feed | null {
  const db = getDb();
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
  
  return getFeedById(id);
}

export function deleteFeed(id: number): boolean {
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
