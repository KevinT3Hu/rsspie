'use client';

import { useParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArticleList } from '@/components/articles/article-list';
import { useFeed } from '@/hooks/use-feeds';
import { FeedActions } from '@/components/feeds/feed-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Rss, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, formatDate } from '@/lib/utils';

function formatDistanceToFuture(timestamp: number, t: ReturnType<typeof useTranslations>, locale: string): string {
  const now = Date.now();
  const diff = timestamp - now;
  
  if (diff <= 0) return t('nav.today').toLowerCase();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  return `${days}d`;
}

export default function FeedPage() {
  const params = useParams();
  const feedId = parseInt(params.id as string);
  const { feed, isLoading } = useFeed(feedId);
  const t = useTranslations();
  const locale = useLocale();
  
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }
  
  if (!feed) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold mb-2">{t('empty.articleNotFound.title')}</h1>
        <p className="text-muted-foreground">{t('empty.articleNotFound.description')}</p>
      </div>
    );
  }
  
  // Format sync times
  const lastSyncText = feed.lastFetchedAt 
    ? formatDistanceToNow(feed.lastFetchedAt * 1000, locale)
    : 'Never';
  
  const nextSyncText = feed.nextSyncAt 
    ? formatDistanceToFuture(feed.nextSyncAt, t, locale)
    : 'Not scheduled';
  
  const hasError = !!feed.fetchError;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {feed.favicon ? (
            <img src={feed.favicon} alt="" width={32} height={32} className="h-8 w-8 rounded" />
          ) : (
            <Rss className="h-8 w-8 text-muted-foreground" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{feed.title}</h1>
            {feed.description && (
              <p className="text-muted-foreground line-clamp-1">{feed.description}</p>
            )}
            
            {/* Sync status info */}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5" title={feed.lastFetchedAt ? formatDate(feed.lastFetchedAt) : 'Never synced'}>
                {hasError ? (
                  <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                ) : feed.lastFetchedAt ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                ) : (
                  <Clock className="h-3.5 w-3.5" />
                )}
                <span>
                  {feed.lastFetchedAt ? `${lastSyncText}` : ''}
                </span>
              </div>
              {feed.isActive && (
                <div className="flex items-center gap-1.5" title={feed.nextSyncAt ? new Date(feed.nextSyncAt).toLocaleString() : 'Not scheduled'}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{nextSyncText}</span>
                </div>
              )}
            </div>
            
            {/* Error message */}
            {hasError && (
              <p className="text-sm text-destructive mt-1">Error: {feed.fetchError}</p>
            )}
          </div>
        </div>
        <FeedActions feed={feed} />
      </div>
      
      <ArticleList feedId={feedId} />
    </div>
  );
}
