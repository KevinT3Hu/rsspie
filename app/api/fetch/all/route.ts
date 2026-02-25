import { NextRequest, NextResponse } from 'next/server';
import { refreshAllFeeds } from '@/lib/rss/fetcher';

export async function POST(request: NextRequest) {
  try {
    const result = await refreshAllFeeds();
    
    return NextResponse.json({
      success: true,
      total: result.total,
      successCount: result.success,
      failedCount: result.failed,
    });
  } catch (error) {
    console.error('Error fetching all feeds:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feeds' },
      { status: 500 }
    );
  }
}
