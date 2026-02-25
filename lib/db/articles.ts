import { getDb, rowToArticle } from './index';
import { Article, ArticleFilter } from '@/types';

export interface ArticleListOptions {
  feedId?: number;
  filter?: ArticleFilter;
  limit?: number;
  offset?: number;
}

export function getArticles(options: ArticleListOptions = {}): Article[] {
  const db = getDb();
  const conditions: string[] = [];
  const values: (number | string)[] = [];
  
  if (options.feedId) {
    conditions.push('a.feed_id = ?');
    values.push(options.feedId);
  }
  
  switch (options.filter) {
    case 'unread':
      conditions.push('a.is_read = 0');
      break;
    case 'favorites':
      conditions.push('a.is_favorite = 1');
      break;
    case 'today':
      conditions.push('a.published_at >= unixepoch() - 86400');
      break;
    case 'week':
      conditions.push('a.published_at >= unixepoch() - 604800');
      break;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limitClause = options.limit ? 'LIMIT ?' : '';
  const offsetClause = options.offset ? 'OFFSET ?' : '';
  
  if (options.limit) values.push(options.limit);
  if (options.offset) values.push(options.offset);
  
  const query = `
    SELECT a.*, f.title as feed_title, f.favicon as feed_favicon
    FROM articles a
    JOIN feeds f ON a.feed_id = f.id
    ${whereClause}
    ORDER BY a.published_at DESC
    ${limitClause} ${offsetClause}
  `;
  
  const rows = db.prepare(query).all(...values) as Record<string, unknown>[];
  return rows.map(row => {
    const article = rowToArticle(row);
    article.feed = {
      id: article.feedId,
      title: row.feed_title as string,
      favicon: row.feed_favicon as string | null,
    } as Article['feed'];
    return article;
  });
}

export function getArticleById(id: number): Article | null {
  const db = getDb();
  const row = db.prepare(`
    SELECT a.*, f.title as feed_title, f.favicon as feed_favicon
    FROM articles a
    JOIN feeds f ON a.feed_id = f.id
    WHERE a.id = ?
  `).get(id) as Record<string, unknown> | undefined;
  
  if (!row) return null;
  
  const article = rowToArticle(row);
  article.feed = {
    id: article.feedId,
    title: row.feed_title as string,
    favicon: row.feed_favicon as string | null,
  } as Article['feed'];
  return article;
}

export function createArticle(article: Omit<Article, 'id' | 'createdAt'>): Article {
  const db = getDb();
  
  try {
    const result = db.prepare(`
      INSERT INTO articles (feed_id, guid, title, content, summary, url, author, published_at, is_read, is_favorite)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      article.feedId,
      article.guid,
      article.title,
      article.content,
      article.summary,
      article.url,
      article.author,
      article.publishedAt,
      article.isRead ? 1 : 0,
      article.isFavorite ? 1 : 0
    );
    
    return getArticleById(result.lastInsertRowid as number)!;
  } catch (error) {
    if ((error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      throw new Error('Article already exists');
    }
    throw error;
  }
}

export function markArticleAsRead(id: number, isRead: boolean): Article | null {
  const db = getDb();
  db.prepare('UPDATE articles SET is_read = ? WHERE id = ?').run(isRead ? 1 : 0, id);
  return getArticleById(id);
}

export function toggleArticleFavorite(id: number): Article | null {
  const db = getDb();
  db.prepare('UPDATE articles SET is_favorite = NOT is_favorite WHERE id = ?').run(id);
  return getArticleById(id);
}

export function markAllAsRead(feedId?: number): number {
  const db = getDb();
  if (feedId) {
    const result = db.prepare('UPDATE articles SET is_read = 1 WHERE feed_id = ? AND is_read = 0').run(feedId);
    return result.changes;
  } else {
    const result = db.prepare('UPDATE articles SET is_read = 1 WHERE is_read = 0').run();
    return result.changes;
  }
}

export function getUnreadCount(feedId?: number): number {
  const db = getDb();
  const query = feedId 
    ? 'SELECT COUNT(*) as count FROM articles WHERE feed_id = ? AND is_read = 0'
    : 'SELECT COUNT(*) as count FROM articles WHERE is_read = 0';
  const row = feedId 
    ? db.prepare(query).get(feedId) as Record<string, unknown>
    : db.prepare(query).get() as Record<string, unknown>;
  return row.count as number;
}

export function deleteOldArticles(maxAgeDays: number): number {
  const db = getDb();
  const cutoff = Math.floor(Date.now() / 1000) - (maxAgeDays * 86400);
  const result = db.prepare('DELETE FROM articles WHERE published_at < ? AND is_favorite = 0').run(cutoff);
  return result.changes;
}

export function articleExists(feedId: number, guid: string | null): boolean {
  const db = getDb();
  if (!guid) return false;
  const row = db.prepare('SELECT 1 FROM articles WHERE feed_id = ? AND guid = ?').get(feedId, guid);
  return !!row;
}

export function getPrevNextArticles(currentId: number): { prevId: number | null; nextId: number | null } {
  const db = getDb();
  
  // Get current article's published_at
  const currentArticle = db.prepare('SELECT published_at FROM articles WHERE id = ?').get(currentId) as { published_at: number } | undefined;
  
  if (!currentArticle) {
    return { prevId: null, nextId: null };
  }
  
  const currentPublishedAt = currentArticle.published_at;
  
  // Previous article = one with published_at > current (newer article, since we order DESC)
  const prevRow = db.prepare(`
    SELECT id FROM articles 
    WHERE published_at > ? 
    ORDER BY published_at ASC 
    LIMIT 1
  `).get(currentPublishedAt) as { id: number } | undefined;
  
  // Next article = one with published_at < current (older article)
  const nextRow = db.prepare(`
    SELECT id FROM articles 
    WHERE published_at < ? 
    ORDER BY published_at DESC 
    LIMIT 1
  `).get(currentPublishedAt) as { id: number } | undefined;
  
  return {
    prevId: prevRow?.id || null,
    nextId: nextRow?.id || null,
  };
}
