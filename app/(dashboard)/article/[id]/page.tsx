'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, Star, ExternalLink, Check, Circle } from 'lucide-react';
import { useArticle, markAsRead, toggleFavorite } from '@/hooks/use-articles';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate, cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const articleId = parseInt(params.id as string);
  const { article, prevId, nextId, isLoading, mutate } = useArticle(articleId);
  
  // Auto-mark as read when article is opened
  useEffect(() => {
    if (article && !article.isRead) {
      markAsRead(article.id, true).then(() => {
        mutate();
      });
    }
  }, [article?.id]);
  
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-10 w-full mb-4" />
        <Skeleton className="h-4 w-48 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <h1 className="text-2xl font-bold mb-2">Article not found</h1>
        <p className="text-muted-foreground">The article you\'re looking for doesn\'t exist.</p>
      </div>
    );
  }
  
  const handleMarkAsRead = async () => {
    try {
      await markAsRead(article.id, !article.isRead);
      mutate();
      toast.success(article.isRead ? 'Marked as unread' : 'Marked as read');
    } catch (error) {
      toast.error('Failed to update article');
    }
  };
  
  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite(article.id);
      mutate();
      toast.success(article.isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update article');
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMarkAsRead}
          >
            {article.isRead ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
          >
            <Star className={cn(
              'h-4 w-4',
              article.isFavorite && 'fill-yellow-400 text-yellow-400'
            )} />
          </Button>
          
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
      
      <article>
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {article.feed && (
              <Link href={`/feed/${article.feedId}`} className="flex items-center gap-2 hover:underline">
                {article.feed.favicon && (
                  <img src={article.feed.favicon} alt="" className="h-4 w-4 rounded" />
                )}
                {article.feed.title}
              </Link>
            )}
            <span>•</span>
            <time>{formatDate(article.publishedAt)}</time>
            {article.author && (
              <>
                <span>•</span>
                <span>By {article.author}</span>
              </>
            )}
          </div>
        </header>
        
        {article.content ? (
          <div
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : article.summary ? (
          <p className="text-lg leading-relaxed">{article.summary}</p>
        ) : (
          <p className="text-muted-italic">No content available.</p>
        )}
      </article>
      
      {/* Bottom Navigation */}
      <Separator className="my-8" />
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="gap-2"
          disabled={!prevId}
          asChild={!!prevId}
        >
          {prevId ? (
            <Link href={`/article/${prevId}`}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          className="gap-2"
          disabled={!nextId}
          asChild={!!nextId}
        >
          {nextId ? (
            <Link href={`/article/${nextId}`}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
