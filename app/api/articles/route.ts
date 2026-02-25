import { NextRequest, NextResponse } from 'next/server';
import { getArticles, markAllAsRead, getUnreadCount } from '@/lib/db/articles';
import { ArticleFilter } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const feedId = searchParams.get('feedId');
    const filter = searchParams.get('filter') as ArticleFilter | null;
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    
    const options = {
      feedId: feedId ? parseInt(feedId) : undefined,
      filter: filter || undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    };
    
    const articles = getArticles(options);
    
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { feedId, markAllRead } = body;
    
    if (markAllRead) {
      const count = markAllAsRead(feedId);
      const unreadCount = getUnreadCount();
      return NextResponse.json({ count, unreadCount });
    }
    
    return NextResponse.json(
      { error: 'Invalid operation' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating articles:', error);
    return NextResponse.json(
      { error: 'Failed to update articles' },
      { status: 500 }
    );
  }
}
