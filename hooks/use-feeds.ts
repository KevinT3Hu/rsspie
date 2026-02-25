'use client';

import useSWR from 'swr';
import { Feed } from '@/types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useFeeds() {
  const { data, error, isLoading, mutate } = useSWR<{ feeds: Feed[] }>('/api/feeds', fetcher);
  
  return {
    feeds: data?.feeds || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useFeed(id: number | null) {
  const { data, error, isLoading } = useSWR<{ feed: Feed }>(
    id ? `/api/feeds/${id}` : null,
    fetcher
  );
  
  return {
    feed: data?.feed,
    isLoading,
    isError: error,
  };
}

export async function addFeed(url: string, category?: string): Promise<Feed> {
  const response = await fetch('/api/feeds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, category }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add feed');
  }
  
  const data = await response.json();
  return data.feed;
}

export async function updateFeed(id: number, updates: { title?: string; category?: string; isActive?: boolean }): Promise<Feed> {
  const response = await fetch(`/api/feeds/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update feed');
  }
  
  const data = await response.json();
  return data.feed;
}

export async function deleteFeed(id: number): Promise<void> {
  const response = await fetch(`/api/feeds/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete feed');
  }
}

export async function refreshFeed(id: number): Promise<{ newArticles: number }> {
  const response = await fetch(`/api/feeds/${id}/refresh`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to refresh feed');
  }
  
  const data = await response.json();
  return data;
}
