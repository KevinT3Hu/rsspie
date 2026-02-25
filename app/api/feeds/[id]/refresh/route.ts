import { NextRequest, NextResponse } from 'next/server';
import { refreshFeed } from '@/lib/rss/fetcher';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const feedId = parseInt(id);
    
    if (isNaN(feedId)) {
      return NextResponse.json(
        { error: 'Invalid feed ID' },
        { status: 400 }
      );
    }
    
    const result = await refreshFeed(feedId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      newArticles: result.newArticles 
    });
  } catch (error) {
    console.error('Error refreshing feed:', error);
    return NextResponse.json(
      { error: 'Failed to refresh feed' },
      { status: 500 }
    );
  }
}
