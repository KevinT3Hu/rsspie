'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
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
  
  const handleMarkAllRead = async () => {
    setIsMarkingRead(true);
    startLoading('Marking articles as read...');
    try {
      const result = await markAllAsRead(feedId);
      toast.success(`Marked ${result.count} articles as read`);
      mutate();
      // Revalidate feeds to update unread counts in sidebar
      globalMutate('/api/feeds');
    } catch {
      toast.error('Failed to mark articles as read');
    } finally {
      setIsMarkingRead(false);
      stopLoading();
    }
  };
  
  const handleToggleFavorite = async (id: number) => {
    startLoading('Updating favorite...');
    try {
      await toggleFavorite(id);
      mutate();
    } catch {
      toast.error('Failed to toggle favorite');
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
        title="Error loading articles"
        description="There was an error loading the articles. Please try again."
      />
    );
  }
  
  if (articles.length === 0) {
    const emptyMessages: Record<string, { title: string; description: string }> = {
      all: { title: 'No articles', description: 'Subscribe to feeds to see articles here.' },
      unread: { title: 'No unread articles', description: 'You\'re all caught up!' },
      favorites: { title: 'No favorites', description: 'Star articles to save them here.' },
      today: { title: 'No articles today', description: 'Check back later for new articles.' },
      week: { title: 'No articles this week', description: 'Check back later for new articles.' },
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
          {articles.length} {articles.length === 1 ? 'article' : 'articles'}
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
            Mark all as read
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
