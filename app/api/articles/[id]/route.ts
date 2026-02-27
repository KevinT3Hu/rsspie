import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getArticleById, getPrevNextArticles } from '@/lib/db/articles';
import { sanitizeHtml, containsDangerousContent, containsImages } from '@/lib/sanitize';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (Number.isNaN(articleId)) {
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

    // Get prev/next article IDs
    const { prevId, nextId } = getPrevNextArticles(articleId);

    // Sanitize the content on the server side
    const originalContent = article.content || article.summary || '';
    const sanitizedContent = sanitizeHtml(originalContent);

    // Check what was sanitized
    const hasDangerousContent = containsDangerousContent(originalContent);
    const hasImages = containsImages(originalContent);

    return NextResponse.json({
      article: {
        ...article,
        sanitizedContent,
        hasDangerousContent,
        hasImages,
      },
      prevId,
      nextId,
    }, {
      headers: {
        // Add security headers
        'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none';",
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      }
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// Endpoint to get original content (for the "Show Original" toggle)
export async function HEAD(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // HEAD request to check if original content exists without returning it
  try {
    const { id } = await params;
    const articleId = parseInt(id);

    if (Number.isNaN(articleId)) {
      return NextResponse.json({}, { status: 400 });
    }

    const article = getArticleById(articleId);

    if (!article) {
      return NextResponse.json({}, { status: 404 });
    }

    const originalContent = article.content || '';
    const hasDangerousContent = containsDangerousContent(originalContent);
    const hasImages = containsImages(originalContent);

    return NextResponse.json({}, {
      headers: {
        'X-Has-Dangerous-Content': hasDangerousContent ? 'true' : 'false',
        'X-Has-Images': hasImages ? 'true' : 'false',
        'X-Content-Length': String(originalContent.length),
      }
    });
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}
