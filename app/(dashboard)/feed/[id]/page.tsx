'use client';

import { useParams } from 'next/navigation';
import { ArticleList } from '@/components/articles/article-list';
import { useFeed } from '@/hooks/use-feeds';
import { FeedActions } from '@/components/feeds/feed-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Rss } from 'lucide-react';

export default function FeedPage() {
  const params = useParams();
  const feedId = parseInt(params.id as string);
  const { feed, isLoading } = useFeed(feedId);
  
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
        <h1 className="text-2xl font-bold mb-2">Feed not found</h1>
        <p className="text-muted-foreground">The feed you\'re looking for doesn\'t exist.</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          {feed.favicon ? (
            <img src={feed.favicon} alt="" className="h-8 w-8 rounded" />
          ) : (
            <Rss className="h-8 w-8 text-muted-foreground" />
          )}
          <div>
            <h1 className="text-2xl font-bold">{feed.title}</h1>
            {feed.description && (
              <p className="text-muted-foreground line-clamp-1">{feed.description}</p>
            )}
          </div>
        </div>
        <FeedActions feed={feed} />
      </div>
      
      <ArticleList feedId={feedId} />
    </div>
  );
}
