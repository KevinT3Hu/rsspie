import { NextRequest, NextResponse } from 'next/server';
import { getFeedByUrl } from '@/lib/db/feeds';
import { addNewFeed } from '@/lib/rss/fetcher';
import { parseOPML, isValidUrl } from '@/lib/opml';

interface ImportResult {
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Check file extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.opml') && !fileName.endsWith('.xml')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload an .opml or .xml file' },
        { status: 400 }
      );
    }
    
    // Read file content
    const xml = await file.text();
    
    if (!xml.trim()) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }
    
    // Parse OPML
    const { feeds: opmlFeeds, errors: parseErrors } = await parseOPML(xml);
    
    if (parseErrors.length > 0) {
      return NextResponse.json(
        { error: 'Failed to parse OPML', details: parseErrors },
        { status: 400 }
      );
    }
    
    if (opmlFeeds.length === 0) {
      return NextResponse.json(
        { error: 'No feeds found in OPML file' },
        { status: 400 }
      );
    }
    
    // Import feeds
    const result: ImportResult = {
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };
    
    for (const opmlFeed of opmlFeeds) {
      const feedUrl = opmlFeed.xmlUrl;
      
      // Validate URL
      if (!isValidUrl(feedUrl)) {
        result.failed++;
        result.errors.push(`Invalid URL: ${feedUrl}`);
        continue;
      }
      
      // Check if feed already exists
      const existingFeed = getFeedByUrl(feedUrl);
      if (existingFeed) {
        result.skipped++;
        continue;
      }
      
      try {
        // Try to add the feed
        await addNewFeed(feedUrl, opmlFeed.category);
        result.success++;
      } catch (error) {
        result.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Failed to add "${opmlFeed.title}": ${errorMessage}`);
      }
    }
    
    return NextResponse.json({
      message: `Imported ${result.success} feeds, ${result.skipped} skipped, ${result.failed} failed`,
      result,
    });
    
  } catch (error) {
    console.error('Error importing OPML:', error);
    const message = error instanceof Error ? error.message : 'Failed to import feeds';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
