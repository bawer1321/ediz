import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleBooksService } from '@/lib/google-books';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId'); // Geçici olarak query param'dan alıyoruz

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const where: any = {
      userId: userId,
    };

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { author: { contains: search, mode: 'insensitive' } },
      ];
    }

    const books = await prisma.book.findMany({
      where,
      include: {
        notes: true,
        quotes: true,
        readingSessions: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, googleBookId, ...bookData } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    let finalBookData = bookData;

    // Eğer Google Books ID'si varsa, API'den veri çek
    if (googleBookId) {
      const googleBooksService = new GoogleBooksService();
      const googleBook = await googleBooksService.getBookById(googleBookId);
      const transformedData = googleBooksService.transformToBookData(googleBook);
      
      // Manuel veri ile Google Books verisini birleştir
      finalBookData = {
        ...transformedData,
        ...bookData, // Manuel veri öncelikli
        userId,
      };
    } else {
      finalBookData = {
        ...bookData,
        userId,
      };
    }

    const book = await prisma.book.create({
      data: finalBookData,
      include: {
        notes: true,
        quotes: true,
        readingSessions: true,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error('Error creating book:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}