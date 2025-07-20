import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const bookId = searchParams.get('bookId');
    const tag = searchParams.get('tag');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const where: any = { userId };
    if (bookId) {
      where.bookId = bookId;
    }
    if (tag) {
      where.tags = {
        contains: tag,
      };
    }

    const quotes = await prisma.quote.findMany({
      where,
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, bookId, content, page, tags } = body;

    if (!userId || !bookId || !content) {
      return NextResponse.json(
        { error: 'User ID, book ID, and content are required' },
        { status: 400 }
      );
    }

    // Etiketleri JSON string olarak sakla
    const tagsJson = tags ? JSON.stringify(tags) : null;

    const quote = await prisma.quote.create({
      data: {
        userId,
        bookId,
        content,
        page,
        tags: tagsJson,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
          },
        },
      },
    });

    return NextResponse.json(quote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}