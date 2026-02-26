'use client';

import Link from 'next/link';
import { Star, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Article } from '@/types';
import { cn } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  onToggleFavorite?: (id: number) => void;
}

export function ArticleCard({ article, onToggleFavorite }: ArticleCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(article.id);
  };
  
  return (
    <Link href={`/article/${article.id}`} className="block">
      <Card className={cn(
        'group cursor-pointer transition-colors hover:bg-accent',
        !article.isRead && 'bg-accent/30'
      )}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {article.feed?.favicon && (
                  <img
                    src={article.feed.favicon}
                    alt=""
                    className="h-4 w-4 rounded"
                  />
                )}
                <span className="text-xs text-muted-foreground truncate">
                  {article.feed?.title}
                </span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(article.publishedAt * 1000)}
                </span>
              </div>
              
              <h3 className={cn(
                'font-medium line-clamp-2 mb-1',
                !article.isRead ? 'font-semibold' : 'text-muted-foreground'
              )}>
                {article.title}
              </h3>
              
              {article.summary && (
                <p className={cn(
                  'text-sm line-clamp-2',
                  article.isRead ? 'text-muted-foreground/60' : 'text-muted-foreground'
                )}>
                  {article.summary}
                </p>
              )}
              
              {article.author && (
                <p className="text-xs text-muted-foreground mt-2">
                  By {article.author}
                </p>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={handleFavoriteClick}
              >
                <Star className={cn(
                  'h-4 w-4',
                  article.isFavorite && 'fill-yellow-400 text-yellow-400'
                )} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
