'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations();
  
  const categories = Array.from(new Set(feeds.map(f => f.category)));
  
  const filterLabels: Record<string, string> = {
    all: t('nav.allArticles'),
    unread: t('article.markAsUnread'),
    favorites: t('nav.favorites'),
    today: t('nav.today'),
    week: t('nav.thisWeek'),
  };
  
  const currentFilter = filterParam || 'all';
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{filterLabels[currentFilter] || t('nav.allArticles')}</h1>
          <p className="text-muted-foreground">
            {t('settings.feedsSubscribed', { count: feeds.length })}
          </p>
        </div>
        <AddFeedDialog onFeedAdded={mutate} categories={categories} />
      </div>
      
      <div className="mb-6">
        <Tabs value={currentFilter}>
          <TabsList>
            <Link href="/">
              <TabsTrigger value="all">{t('filter.all')}</TabsTrigger>
            </Link>
            <Link href="/?filter=unread">
              <TabsTrigger value="unread">{t('filter.unread')}</TabsTrigger>
            </Link>
            <Link href="/?filter=favorites">
              <TabsTrigger value="favorites">{t('nav.favorites')}</TabsTrigger>
            </Link>
            <Link href="/?filter=today">
              <TabsTrigger value="today">{t('nav.today')}</TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </div>
      
      <ArticleList filter={filterParam || undefined} />
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations();
  
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto p-6">{t('feed.loadingFeeds')}</div>}>
      <DashboardContent />
    </Suspense>
  );
}
