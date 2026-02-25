export interface Feed {
  id: number;
  url: string;
  title: string;
  description: string | null;
  siteUrl: string | null;
  favicon: string | null;
  category: string;
  lastFetchedAt: number | null;
  fetchError: string | null;
  isActive: boolean;
  createdAt: number;
  unreadCount?: number;
}

export interface Article {
  id: number;
  feedId: number;
  guid: string | null;
  title: string;
  content: string | null;
  summary: string | null;
  url: string;
  author: string | null;
  publishedAt: number;
  isRead: boolean;
  isFavorite: boolean;
  createdAt: number;
  feed?: Feed;
}

export type ArticleFilter = 'all' | 'unread' | 'favorites' | 'today' | 'week';

export interface CreateFeedInput {
  url: string;
  category?: string;
}

export interface UpdateFeedInput {
  title?: string;
  category?: string;
  isActive?: boolean;
}

export interface RSSItem {
  guid?: string;
  title?: string;
  content?: string;
  contentSnippet?: string;
  link?: string;
  author?: string;
  pubDate?: string;
  isoDate?: string;
}

export interface RSSFeed {
  title?: string;
  description?: string;
  link?: string;
  feedUrl?: string;
  image?: {
    url?: string;
  };
  items: RSSItem[];
}
