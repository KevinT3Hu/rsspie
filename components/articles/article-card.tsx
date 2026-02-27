'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Article } from '@/types';
import { cn } from '@/lib/utils';
import { useCompact } from '@/components/compact-provider';

interface ArticleCardProps {
  article: Article;
  onToggleFavorite?: (id: number) => void;
}

export function ArticleCard({ article, onToggleFavorite }: ArticleCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { isCompact } = useCompact();
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(article.id);
  };
  
  return (
    <Link href={`/article/${article.id}`} className="block">
      <Card className={cn(
        'group cursor-pointer transition-colors hover:bg-accent',
        !article.isRead && 'bg-accent/30',
        isCompact && 'compact-card'
      )}>
        <CardContent className={cn(
          'p-4',
          isCompact && 'p-2.5'
        )}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className={cn(
                'flex items-center gap-2 mb-1',
                isCompact && 'mb-0.5'
              )}>
                {article.feed?.favicon && (
                  <img
                    src={article.feed.favicon}
                    alt=""
                    className={cn(
                      'h-4 w-4 rounded',
                      isCompact && 'h-3 w-3'
                    )}
                  />
                )}
                <span className={cn(
                  'text-xs text-muted-foreground truncate',
                  isCompact && 'text-[11px]'
                )}>
                  {article.feed?.title}
                </span>
                <span className={cn(
                  'text-xs text-muted-foreground',
                  isCompact && 'text-[11px]'
                )}>•</span>
                <span className={cn(
                  'text-xs text-muted-foreground',
                  isCompact && 'text-[11px]'
                )}>
                  {formatDistanceToNow(article.publishedAt * 1000, locale)}
                </span>
              </div>
              
              <h3 className={cn(
                'font-medium line-clamp-2 mb-1',
                !article.isRead ? 'font-semibold' : 'text-muted-foreground',
                isCompact && 'text-sm line-clamp-1 mb-0'
              )}>
                {article.title}
              </h3>
              
              {!isCompact && article.summary && (
                <p className={cn(
                  'text-sm line-clamp-2',
                  article.isRead ? 'text-muted-foreground/60' : 'text-muted-foreground'
                )}>
                  {article.summary}
                </p>
              )}
              
              {!isCompact && article.author && (
                <p className="text-xs text-muted-foreground mt-2">
                  {t('article.byAuthor', { author: article.author })}
                </p>
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity',
                  isCompact && 'h-6 w-6',
                  article.isFavorite && 'opacity-100'
                )}
                onClick={handleFavoriteClick}
              >
                <Star className={cn(
                  'h-4 w-4',
                  isCompact && 'h-3 w-3',
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
