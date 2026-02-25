'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArticleList } from '@/components/articles/article-list';
import { AddFeedDialog } from '@/components/feeds/add-feed-dialog';
import { useFeeds } from '@/hooks/use-feeds';
import { ArticleFilter } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

function DashboardContent() {
  const searchParams = useSearchParams();
  const filterParam = searchParams.get('filter') as ArticleFilter | null;
  const { feeds, mutate } = useFeeds();
  
  const categories = Array.from(new Set(feeds.map(f => f.category)));
  
  const filterLabels: Record<string, string> = {
    all: 'All Articles',
    unread: 'Unread',
    favorites: 'Favorites',
    today: 'Today',
    week: 'This Week',
  };
  
  const currentFilter = filterParam || 'all';
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{filterLabels[currentFilter] || 'All Articles'}</h1>
          <p className="text-muted-foreground">
            {feeds.length} {feeds.length === 1 ? 'feed' : 'feeds'} subscribed
          </p>
        </div>
        <AddFeedDialog onFeedAdded={mutate} categories={categories} />
      </div>
      
      <div className="mb-6">
        <Tabs value={currentFilter}>
          <TabsList>
            <Link href="/">
              <TabsTrigger value="all">All</TabsTrigger>
            </Link>
            <Link href="/?filter=unread">
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </Link>
            <Link href="/?filter=favorites">
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </Link>
            <Link href="/?filter=today">
              <TabsTrigger value="today">Today</TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </div>
      
      <ArticleList filter={filterParam || undefined} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-6">Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
