import { parseFeed, extractFavicon, parsePubDate, extractSummary } from './parser';
import { getFeedById, updateFeedFetchStatus, createFeed, updateFeed } from '@/lib/db/feeds';
import { createArticle, articleExists } from '@/lib/db/articles';
import { startFeedScheduler } from './scheduler';
import type { Feed, RSSFeed } from '@/types';

const MAX_ARTICLES_PER_FEED = parseInt(process.env.MAX_ARTICLES_PER_FEED || '100');

export async function fetchAndParseFeed(url: string): Promise<RSSFeed> {
  return parseFeed(url);
}

export async function addNewFeed(url: string, category?: string): Promise<Feed> {
  const parsedFeed = await fetchAndParseFeed(url);
  
  const feed = createFeed({
    url,
    category,
    title: parsedFeed.title || 'Untitled Feed',
    description: parsedFeed.description,
    siteUrl: parsedFeed.link,
    favicon: parsedFeed.image?.url || extractFavicon(parsedFeed.link || url),
  });
  
  // Fetch articles immediately when feed is added
  await fetchArticlesForFeed(feed, parsedFeed);
  
  // Start the periodic scheduler for this feed
  startFeedScheduler(feed);
  
  return feed;
}

export async function refreshFeed(feedId: number): Promise<{ success: boolean; newArticles: number; error?: string }> {
  const feed = getFeedById(feedId);
  if (!feed) {
    return { success: false, newArticles: 0, error: 'Feed not found' };
  }
  
  if (!feed.isActive) {
    return { success: false, newArticles: 0, error: 'Feed is inactive' };
  }
  
  try {
    const parsedFeed = await fetchAndParseFeed(feed.url);
    const newArticles = await fetchArticlesForFeed(feed, parsedFeed);
    updateFeedFetchStatus(feedId, null);
    
    if (parsedFeed.title && parsedFeed.title !== feed.title) {
      updateFeed(feedId, { title: parsedFeed.title });
    }
    
    return { success: true, newArticles };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    updateFeedFetchStatus(feedId, errorMessage);
    return { success: false, newArticles: 0, error: errorMessage };
  }
}

export async function refreshAllFeeds(): Promise<{ total: number; success: number; failed: number }> {
  const { getAllFeeds } = await import('@/lib/db/feeds');
  const feeds = getAllFeeds().filter(f => f.isActive);
  
  let success = 0;
  let failed = 0;
  
  for (const feed of feeds) {
    const result = await refreshFeed(feed.id);
    if (result.success) {
      success++;
    } else {
      failed++;
    }
  }
  
  return { total: feeds.length, success, failed };
}

async function fetchArticlesForFeed(feed: Feed, parsedFeed: RSSFeed): Promise<number> {
  let newArticles = 0;
  
  const sortedItems = parsedFeed.items
    .filter(item => item.title || item.contentSnippet)
    .sort((a, b) => parsePubDate(b.isoDate || b.pubDate) - parsePubDate(a.isoDate || a.pubDate))
    .slice(0, MAX_ARTICLES_PER_FEED);
  
  for (const item of sortedItems) {
    const guid = item.guid || item.link;
    
    if (!guid || articleExists(feed.id, guid)) {
      continue;
    }
    
    try {
      createArticle({
        feedId: feed.id,
        guid,
        title: item.title || 'Untitled',
        content: item.content || null,
        summary: extractSummary(item.content || item.contentSnippet),
        url: item.link || feed.siteUrl || feed.url,
        author: item.author || null,
        publishedAt: parsePubDate(item.isoDate || item.pubDate),
        isRead: false,
        isFavorite: false,
      });
      newArticles++;
    } catch (error) {
      if ((error as Error).message !== 'Article already exists') {
        console.error('Error creating article:', error);
      }
    }
  }
  
  return newArticles;
}
