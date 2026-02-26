'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSWRConfig } from 'swr';
import { Rss, Edit, Trash2, RefreshCw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLoading } from '@/hooks/use-loading';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Feed } from '@/types';
import { updateFeed, deleteFeed, refreshFeed } from '@/hooks/use-feeds';
import { toast } from 'sonner';

interface FeedListItemProps {
  feed: Feed;
  onUpdate?: () => void;
}

export function FeedListItem({ feed, onUpdate }: FeedListItemProps) {
  const pathname = usePathname();
  const { mutate: globalMutate } = useSWRConfig();
  const { startLoading, stopLoading } = useLoading();
  const isActive = pathname === `/feed/${feed.id}`;
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTitle, setEditTitle] = useState(feed.title);
  const [editCategory, setEditCategory] = useState(feed.category);
  const [isSaving, setIsSaving] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    startLoading(`Syncing "${feed.title}"...`);
    try {
      const result = await refreshFeed(feed.id);
      // Revalidate articles for this feed
      globalMutate((key) => typeof key === 'string' && key.startsWith('/api/articles'));
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to refresh feed');
    } finally {
      setIsRefreshing(false);
      stopLoading();
    }
  };

  const handleEdit = () => {
    setEditTitle(feed.title);
    setEditCategory(feed.category);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    startLoading('Updating feed...');
    try {
      await updateFeed(feed.id, {
        title: editTitle,
        category: editCategory,
      });
      toast.success('Feed updated');
      setIsEditOpen(false);
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to update feed');
    } finally {
      setIsSaving(false);
      stopLoading();
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${feed.title}"?`)) return;
    
    setIsDeleting(true);
    startLoading('Deleting feed...');
    try {
      await deleteFeed(feed.id);
      toast.success('Feed deleted');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to delete feed');
      setIsDeleting(false);
    } finally {
      stopLoading();
    }
  };

  const feedContent = (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ml-2',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'hover:bg-accent hover:text-accent-foreground'
      )}
    >
      <div className="relative">
        {isRefreshing ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : feed.favicon && !faviconError ? (
          <img
            src={feed.favicon}
            alt=""
            className="h-4 w-4 rounded"
            onError={() => {
              setFaviconError(true);
            }}
          />
        ) : (
          <Rss className="h-4 w-4 text-muted-foreground" />
        )}
        {feed.unreadCount ? (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
        ) : null}
      </div>
      <span className="flex-1 truncate">{feed.title}</span>
      {feed.unreadCount ? (
        <span className="text-xs text-muted-foreground">{feed.unreadCount}</span>
      ) : null}
    </div>
  );

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Link href={`/feed/${feed.id}`}>{feedContent}</Link>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('mr-2 h-4 w-4', isRefreshing && 'animate-spin')} />
            Sync
          </ContextMenuItem>
          <ContextMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={handleDelete} disabled={isDeleting} variant="destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Remove
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Feed</DialogTitle>
            <DialogDescription>
              Update the feed title and category.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                disabled={isSaving}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Category</Label>
              <Input
                id="edit-category"
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving || !editTitle.trim()}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
