import { NextRequest, NextResponse } from 'next/server';
import { getAllFeeds, getFeedsWithUnreadCount, createFeed, getFeedByUrl } from '@/lib/db/feeds';
import { addNewFeed } from '@/lib/rss/fetcher';

export async function GET() {
  try {
    const feeds = getFeedsWithUnreadCount();
    return NextResponse.json({ feeds });
  } catch (error) {
    console.error('Error fetching feeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feeds' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, category } = body;
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    const normalizedUrl = url.trim();
    
    const existingFeed = getFeedByUrl(normalizedUrl);
    if (existingFeed) {
      return NextResponse.json(
        { error: 'Feed already exists' },
        { status: 409 }
      );
    }
    
    const feed = await addNewFeed(normalizedUrl, category);
    
    return NextResponse.json({ feed }, { status: 201 });
  } catch (error) {
    console.error('Error creating feed:', error);
    const message = error instanceof Error ? error.message : 'Failed to create feed';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
