'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useTranslations } from 'next-intl';
import { Inbox, Check, Star, Loader2 } from 'lucide-react';
import { ArticleCard } from './article-card';
import { EmptyState } from '@/components/shared/empty-state';
import { ArticleListSkeleton } from '@/components/shared/loading-skeleton';
import { useArticles, markAllAsRead, toggleFavorite } from '@/hooks/use-articles';
import { useLoading } from '@/hooks/use-loading';
import type { ArticleFilter } from '@/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ArticleListProps {
  feedId?: number;
  filter?: ArticleFilter;
}

export function ArticleList({ feedId, filter }: ArticleListProps) {
  const { articles, isLoading, isError, mutate } = useArticles({ feedId, filter, limit: 50 });
  const { startLoading, stopLoading } = useLoading();
  const { mutate: globalMutate } = useSWRConfig();
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const t = useTranslations();
  
  const handleMarkAllRead = async () => {
    setIsMarkingRead(true);
    startLoading(t('messages.markingAsRead'));
    try {
      const result = await markAllAsRead(feedId);
      toast.success(t('messages.articleMarkedAsRead', { count: result.count }));
      mutate();
      // Revalidate feeds to update unread counts in sidebar
      globalMutate('/api/feeds');
    } catch {
      toast.error(t('messages.errorMarkingAsRead'));
    } finally {
      setIsMarkingRead(false);
      stopLoading();
    }
  };
  
  const handleToggleFavorite = async (id: number) => {
    startLoading(t('messages.updatingFavorite'));
    try {
      await toggleFavorite(id);
      mutate();
    } catch {
      toast.error(t('messages.errorTogglingFavorite'));
    } finally {
      stopLoading();
    }
  };
  
  const hasUnread = articles.some(a => !a.isRead);
  
  if (isLoading) {
    return <ArticleListSkeleton />;
  }
  
  if (isError) {
    return (
      <EmptyState
        icon={Inbox}
        title={t('empty.errorLoading.title')}
        description={t('empty.errorLoading.description')}
      />
    );
  }
  
  if (articles.length === 0) {
    const emptyMessages: Record<string, { title: string; description: string }> = {
      all: { title: t('empty.noArticles.title'), description: t('empty.noArticles.description') },
      unread: { title: t('empty.noUnread.title'), description: t('empty.noUnread.description') },
      favorites: { title: t('empty.noFavorites.title'), description: t('empty.noFavorites.description') },
      today: { title: t('empty.noToday.title'), description: t('empty.noToday.description') },
      week: { title: t('empty.noThisWeek.title'), description: t('empty.noThisWeek.description') },
    };
    
    const message = emptyMessages[filter || 'all'];
    
    return (
      <EmptyState
        icon={filter === 'favorites' ? Star : Inbox}
        title={message.title}
        description={message.description}
      />
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t('article.articles', { count: articles.length })}
        </p>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarkingRead}
          >
            {isMarkingRead ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {t('article.markAllAsRead')}
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>
    </div>
  );
}
