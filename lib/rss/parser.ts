import Parser from 'rss-parser';
import { RSSFeed, RSSItem } from '@/types';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader/1.0)',
  },
  customFields: {
    item: ['content:encoded', 'description', 'summary'],
  },
});

export async function parseFeed(url: string): Promise<RSSFeed> {
  const feed = await parser.parseURL(url);
  
  return {
    title: feed.title,
    description: feed.description,
    link: feed.link,
    feedUrl: feed.feedUrl,
    image: feed.image,
    items: feed.items.map(item => {
      const customItem = item as unknown as Record<string, unknown>;
      return {
        guid: customItem.guid as string | undefined || item.link,
        title: item.title,
        content: (customItem['content:encoded'] as string | undefined) || item.content || (customItem.summary as string | undefined),
        contentSnippet: item.contentSnippet,
        link: item.link,
        author: (customItem.author as string | undefined) || (customItem.creator as string | undefined),
        pubDate: item.pubDate,
        isoDate: item.isoDate,
      };
    }),
  };
}

export function extractFavicon(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
  } catch {
    return '';
  }
}

export function parsePubDate(dateStr: string | undefined): number {
  if (!dateStr) return Math.floor(Date.now() / 1000);
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? Math.floor(Date.now() / 1000) : Math.floor(date.getTime() / 1000);
}

export function extractSummary(content: string | undefined | null, maxLength: number = 200): string | null {
  if (!content) return null;
  
  const text = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}
