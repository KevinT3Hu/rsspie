'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { 
  Rss, 
  Inbox, 
  Star, 
  Clock, 
  Calendar, 
  Settings, 
  Plus,
  RefreshCw,
  ChevronDown,
  Folder,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sidebar as UISidebar, SidebarContent, SidebarHeader, SidebarFooter, SidebarRail } from '@/components/ui/sidebar';
import { useFeeds } from '@/hooks/use-feeds';
import { useArticles, refreshAllFeeds } from '@/hooks/use-articles';
import { useState } from 'react';
import { toast } from 'sonner';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  count?: number;
}

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const { feeds, isLoading, mutate } = useFeeds();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { articles: unreadArticles } = useArticles({ filter: 'unread', limit: 1 });
  const unreadCount = feeds.reduce((sum, f) => sum + (f.unreadCount || 0), 0);
  
  const navItems: NavItem[] = [
    { icon: <Inbox className="h-4 w-4" />, label: 'All Articles', href: '/', count: unreadCount },
    { icon: <Clock className="h-4 w-4" />, label: 'Today', href: '/?filter=today' },
    { icon: <Calendar className="h-4 w-4" />, label: 'This Week', href: '/?filter=week' },
    { icon: <Star className="h-4 w-4" />, label: 'Favorites', href: '/?filter=favorites' },
  ];
  
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshAllFeeds();
      toast.success(`Refreshed ${result.successCount} of ${result.total} feeds`);
      mutate();
    } catch (error) {
      toast.error('Failed to refresh feeds');
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const feedsByCategory = feeds.reduce((acc, feed) => {
    const cat = feed.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(feed);
    return acc;
  }, {} as Record<string, typeof feeds>);
  
  return (
    <UISidebar>
      <SidebarHeader data-testid="sidebar" className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <Rss className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">RSS Reader</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <ScrollArea className="h-full">
          <div className="px-3 py-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                    pathname === '/' && item.href === '/' && !params.id
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  {item.icon}
                  <span className="flex-1">{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="text-xs text-muted-foreground">{item.count}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="px-3 py-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Feeds
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleRefreshAll}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
              </Button>
            </div>
            
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">Loading feeds...</div>
            ) : (
              <div className="space-y-1">
                {Object.entries(feedsByCategory).map(([category, categoryFeeds]) => (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center gap-2 px-3 py-1 text-xs text-muted-foreground">
                      <Folder className="h-3 w-3" />
                      {category}
                    </div>
                    {categoryFeeds.map((feed) => (
                      <Link
                        key={feed.id}
                        href={`/feed/${feed.id}`}
                        className={cn(
                          'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ml-2',
                          pathname === `/feed/${feed.id}`
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        )}
                      >
                        {feed.favicon ? (
                          <img
                            src={feed.favicon}
                            alt=""
                            className="h-4 w-4 rounded"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <Rss className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="flex-1 truncate">{feed.title}</span>
                        {feed.unreadCount ? (
                          <span className="text-xs text-muted-foreground">{feed.unreadCount}</span>
                        ) : null}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SidebarContent>
      
      <SidebarFooter className="border-t p-4">
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </Link>
      </SidebarFooter>
      
      <SidebarRail />
    </UISidebar>
  );
}
