'use client';

import { useState } from 'react';
import { useSWRConfig } from 'swr';
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
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    startLoading(`Syncing "${feed.title}"...`);
    try {
      const result = await refreshFeed(feed.id);
      globalMutate((key) => typeof key === 'string' && key.startsWith('/api/articles'));
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to refresh feed');
    } finally {
      setIsRefreshing(false);
      stopLoading();
    }
  };
  
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${feed.title}"?`)) return;
    
    startLoading('Deleting feed...');
    try {
      await deleteFeed(feed.id);
      toast.success('Feed deleted');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to delete feed');
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
          Refresh
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
