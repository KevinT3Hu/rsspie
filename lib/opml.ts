import { Feed } from '@/types';
import { Builder } from 'xml2js';
import { parseStringPromise } from 'xml2js';

export interface OPMLFeed {
  title: string;
  xmlUrl: string;
  htmlUrl?: string;
  category?: string;
}

export interface OPMLCategory {
  name: string;
  feeds: OPMLFeed[];
}

interface OutlineAttrs {
  type?: string;
  text?: string;
  title?: string;
  xmlUrl?: string;
  htmlUrl?: string;
}

interface OutlineObj {
  $: OutlineAttrs;
  outline?: OutlineObj | OutlineObj[];
}

/**
 * Generate OPML XML from feeds using xml2js
 */
export function generateOPML(feeds: Feed[]): string {
  const now = new Date().toUTCString();
  
  // Group feeds by category
  const categoryMap = new Map<string, Feed[]>();
  
  for (const feed of feeds) {
    const category = feed.category || 'Uncategorized';
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(feed);
  }
  
  // Build outlines array
  const outlines: OutlineObj[] = [];
  
  // Sort categories alphabetically, but put Uncategorized last
  const sortedCategories = Array.from(categoryMap.keys()).sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });
  
  for (const category of sortedCategories) {
    const categoryFeeds = categoryMap.get(category)!;
    
    if (category === 'Uncategorized') {
      // Uncategorized feeds go directly in body without outline wrapper
      for (const feed of categoryFeeds) {
        const outline: OutlineObj = {
          $: {
            type: 'rss',
            text: feed.title,
            title: feed.title,
            xmlUrl: feed.url,
          },
        };
        if (feed.siteUrl) {
          outline.$.htmlUrl = feed.siteUrl;
        }
        outlines.push(outline);
      }
    } else {
      // Feeds with categories are grouped
      const categoryOutline: OutlineObj = {
        $: {
          text: category,
          title: category,
        },
        outline: [],
      };
      
      for (const feed of categoryFeeds) {
        const feedOutline: OutlineObj = {
          $: {
            type: 'rss',
            text: feed.title,
            title: feed.title,
            xmlUrl: feed.url,
          },
        };
        if (feed.siteUrl) {
          feedOutline.$.htmlUrl = feed.siteUrl;
        }
        (categoryOutline.outline as OutlineObj[]).push(feedOutline);
      }
      
      outlines.push(categoryOutline);
    }
  }
  
  // Build OPML structure
  const opmlObj = {
    opml: {
      $: {
        version: '2.0',
      },
      head: {
        title: 'RSS Pie Subscriptions',
        dateCreated: now,
        dateModified: now,
      },
      body: {
        outline: outlines,
      },
    },
  };
  
  // Build XML
  const builder = new Builder({
    headless: false,
    renderOpts: { pretty: true, indent: '  ', newline: '\n' },
  });
  
  return builder.buildObject(opmlObj);
}

/**
 * Parse OPML XML and extract feeds using xml2js
 */
export async function parseOPML(xml: string): Promise<{ feeds: OPMLFeed[]; errors: string[] }> {
  const feeds: OPMLFeed[] = [];
  const errors: string[] = [];
  
  try {
    const result = await parseStringPromise(xml, {
      explicitArray: false,
      mergeAttrs: false,
    });
    
    if (!result.opml) {
      errors.push('Invalid OPML: missing root opml element');
      return { feeds, errors };
    }
    
    const body = result.opml.body;
    if (!body) {
      errors.push('Invalid OPML: missing body element');
      return { feeds, errors };
    }
    
    // Process outlines recursively
    const processOutline = (outline: unknown, parentCategory?: string) => {
      if (!outline || typeof outline !== 'object') return;
      
      const outlineObj = outline as OutlineObj;
      const attrs = outlineObj.$;
      
      if (!attrs) return;
      
      const type = attrs.type;
      const text = attrs.text || attrs.title;
      const xmlUrl = attrs.xmlUrl;
      const htmlUrl = attrs.htmlUrl;
      
      if (type === 'rss' && xmlUrl) {
        // This is a feed
        const feed: OPMLFeed = {
          title: text || 'Untitled Feed',
          xmlUrl: xmlUrl.trim(),
          htmlUrl,
          category: parentCategory,
        };
        feeds.push(feed);
      } else if (!xmlUrl && text) {
        // This is a category/folder
        const categoryName = text;
        
        // Process nested outlines
        const nestedOutlines = outlineObj.outline;
        if (nestedOutlines) {
          if (Array.isArray(nestedOutlines)) {
            for (const child of nestedOutlines) {
              processOutline(child, categoryName);
            }
          } else {
            processOutline(nestedOutlines, categoryName);
          }
        }
      }
    };
    
    // Get outlines from body
    const bodyOutlines = body.outline;
    if (bodyOutlines) {
      if (Array.isArray(bodyOutlines)) {
        for (const outline of bodyOutlines) {
          processOutline(outline);
        }
      } else {
        processOutline(bodyOutlines);
      }
    }
    
  } catch (error) {
    errors.push(`Error parsing OPML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return { feeds, errors };
}

/**
 * Validate if a string is a valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
