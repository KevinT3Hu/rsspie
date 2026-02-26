import { NextRequest, NextResponse } from 'next/server';
import { refreshAllFeeds } from '@/lib/rss/fetcher';
import { getSchedulerStatus } from '@/lib/rss/scheduler';

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

// GET endpoint to check scheduler status
export async function GET() {
  try {
    const status = getSchedulerStatus();
    
    return NextResponse.json({
      scheduledFeeds: status,
      totalScheduled: status.length,
    });
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    return NextResponse.json(
      { error: 'Failed to get scheduler status' },
      { status: 500 }
    );
  }
}
