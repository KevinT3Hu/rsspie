import { NextResponse } from 'next/server';
import { getAllFeeds } from '@/lib/db/feeds';
import { generateOPML } from '@/lib/opml';

export async function GET() {
  try {
    const feeds = getAllFeeds();
    const opmlXml = generateOPML(feeds);
    
    // Return as downloadable file
    return new NextResponse(opmlXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Content-Disposition': 'attachment; filename="rsspie-feeds.opml"',
      },
    });
  } catch (error) {
    console.error('Error exporting OPML:', error);
    return NextResponse.json(
      { error: 'Failed to export feeds' },
      { status: 500 }
    );
  }
}
