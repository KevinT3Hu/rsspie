import { NextRequest, NextResponse } from 'next/server';
import { getArticleById } from '@/lib/db/articles';

// Endpoint to get original unsanitized content
// This is a separate endpoint to require explicit opt-in
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (isNaN(articleId)) {
      return NextResponse.json(
        { error: 'Invalid article ID' },
        { status: 400 }
      );
    }

    const article = getArticleById(articleId);

    if (!article) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      );
    }

    // Return original content with security warnings
    return NextResponse.json({
      originalContent: article.content || article.summary || '',
      warning: 'This content is unsanitized and may contain harmful elements. View at your own risk.',
    }, {
      headers: {
        // Still set restrictive CSP even for original content endpoint
        'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none';",
        'X-Content-Type-Options': 'nosniff',
        'X-Warning': 'Unsanitized-Content',
      }
    });
  } catch (error) {
    console.error('Error fetching original content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch original content' },
      { status: 500 }
    );
  }
}
