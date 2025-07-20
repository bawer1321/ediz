import { NextRequest, NextResponse } from 'next/server';
import { GoogleBooksService } from '@/lib/google-books';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const maxResults = parseInt(searchParams.get('maxResults') || '10');

    if (!query) {
      return NextResponse.json({ error: 'Search query required' }, { status: 400 });
    }

    const googleBooksService = new GoogleBooksService();
    const results = await googleBooksService.searchBooks(query, maxResults);

    // Sonuçları uygulamamızın formatına dönüştür
    const transformedResults = {
      ...results,
      items: results.items?.map(item => ({
        ...item,
        transformedData: googleBooksService.transformToBookData(item),
      })) || [],
    };

    return NextResponse.json(transformedResults);
  } catch (error) {
    console.error('Error searching books:', error);
    return NextResponse.json(
      { error: 'Failed to search books' },
      { status: 500 }
    );
  }
}