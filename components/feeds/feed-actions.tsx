'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { useTranslations } from 'next-intl';
import { MoreHorizontal, RefreshCw, Edit, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Feed } from '@/types';
import { refreshFeed, deleteFeed } from '@/hooks/use-feeds';
import { useLoading } from '@/hooks/use-loading';
import { toast } from 'sonner';

interface FeedActionsProps {
  feed: Feed;
  onUpdate?: () => void;
}

export function FeedActions({ feed, onUpdate }: FeedActionsProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { startLoading, stopLoading } = useLoading();
  const { mutate: globalMutate } = useSWRConfig();
  const t = useTranslations();
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    startLoading(t('messages.syncingFeed', { title: feed.title }));
    try {
      const result = await refreshFeed(feed.id);
      // Revalidate articles and feed data (including lastFetchedAt and nextSyncAt)
      await globalMutate(
        (key) => typeof key === 'string' && key.startsWith('/api/articles'),
        undefined,
        { revalidate: true }
      );
      await globalMutate(`/api/feeds/${feed.id}`, undefined, { revalidate: true });
      await globalMutate('/api/feeds', undefined, { revalidate: true });
      toast.success(t('messages.syncedNewArticles', { count: result.newArticles }));
      onUpdate?.();
    } catch (error) {
      toast.error(t('messages.errorRefreshingFeed'));
    } finally {
      setIsRefreshing(false);
      stopLoading();
    }
  };
  
  const handleDelete = async () => {
    if (!confirm(t('messages.confirmDeleteFeed', { title: feed.title }))) return;
    
    startLoading(t('messages.deletingFeed'));
    try {
      await deleteFeed(feed.id);
      toast.success(t('messages.feedDeleted'));
      onUpdate?.();
    } catch (error) {
      toast.error(t('messages.errorDeletingFeed'));
    } finally {
      stopLoading();
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw className={isRefreshing ? 'mr-2 h-4 w-4 animate-spin' : 'mr-2 h-4 w-4'} />
          {t('nav.refresh')}
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          {t('feed.edit')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('feed.deleteFeed')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
