import { NextRequest, NextResponse } from 'next/server';
import { markArticleAsRead, getUnreadCount } from '@/lib/db/articles';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const articleId = parseInt(id);
    
    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { isRead } = body;
    
    const article = markArticleAsRead(articleId, isRead);
    
    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }
    
    const unreadCount = getUnreadCount();
    
    return NextResponse.json({ article, unreadCount });
  } catch (error) {
    console.error('Error marking article as read:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}
