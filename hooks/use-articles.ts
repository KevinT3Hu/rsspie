'use client';

import useSWR from 'swr';
import { Article, ArticleFilter } from '@/types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

interface ArticlesOptions {
  feedId?: number;
  filter?: ArticleFilter;
  limit?: number;
  offset?: number;
}

export function useArticles(options: ArticlesOptions = {}) {
  const params = new URLSearchParams();
  if (options.feedId) params.append('feedId', options.feedId.toString());
  if (options.filter) params.append('filter', options.filter);
  if (options.limit) params.append('limit', options.limit.toString());
  if (options.offset) params.append('offset', options.offset.toString());
  
  const url = `/api/articles?${params.toString()}`;
  
  const { data, error, isLoading, mutate } = useSWR<{ articles: Article[] }>(url, fetcher);
  
  return {
    articles: data?.articles || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useArticle(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR<{ article: Article; prevId: number | null; nextId: number | null }>(
    id ? `/api/articles/${id}` : null,
    fetcher
  );
  
  return {
    article: data?.article,
    prevId: data?.prevId,
    nextId: data?.nextId,
    isLoading,
    isError: error,
    mutate,
  };
}

export async function markAsRead(id: number, isRead: boolean): Promise<{ article: Article; unreadCount: number }> {
  const response = await fetch(`/api/articles/${id}/read`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isRead }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark as read');
  }
  
  return response.json();
}

export async function toggleFavorite(id: number): Promise<Article> {
  const response = await fetch(`/api/articles/${id}/favorite`, {
    method: 'PUT',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to toggle favorite');
  }
  
  const data = await response.json();
  return data.article;
}

export async function markAllAsRead(feedId?: number): Promise<{ count: number; unreadCount: number }> {
  const response = await fetch('/api/articles', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ markAllRead: true, feedId }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to mark all as read');
  }
  
  return response.json();
}

export async function refreshAllFeeds(): Promise<{ total: number; successCount: number; failedCount: number }> {
  const response = await fetch('/api/fetch/all', {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to refresh feeds');
  }
  
  return response.json();
}
