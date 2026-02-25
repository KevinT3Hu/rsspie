import { NextRequest, NextResponse } from 'next/server';
import { getFeedById, updateFeed, deleteFeed } from '@/lib/db/feeds';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const feedId = parseInt(id);
    
    if (isNaN(feedId)) {
      return NextResponse.json(
        { error: 'Invalid feed ID' },
        { status: 400 }
      );
    }
    
    const feed = getFeedById(feedId);
    
    if (!feed) {
      return NextResponse.json(
        { error: 'Feed not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ feed });
  } catch (error) {
    console.error('Error fetching feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feed' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const feedId = parseInt(id);
    
    if (isNaN(feedId)) {
      return NextResponse.json(
        { error: 'Invalid feed ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const feed = updateFeed(feedId, body);
    
    if (!feed) {
      return NextResponse.json(
        { error: 'Feed not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ feed });
  } catch (error) {
    console.error('Error updating feed:', error);
    return NextResponse.json(
      { error: 'Failed to update feed' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const feedId = parseInt(id);
    
    if (isNaN(feedId)) {
      return NextResponse.json(
        { error: 'Invalid feed ID' },
        { status: 400 }
      );
    }
    
    const success = deleteFeed(feedId);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Feed not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting feed:', error);
    return NextResponse.json(
      { error: 'Failed to delete feed' },
      { status: 500 }
    );
  }
}
