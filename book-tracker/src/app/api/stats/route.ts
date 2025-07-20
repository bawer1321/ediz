import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const yearInt = parseInt(year);
    const startOfYear = new Date(yearInt, 0, 1);
    const endOfYear = new Date(yearInt, 11, 31, 23, 59, 59);

    // Genel istatistikler
    const totalBooks = await prisma.book.count({
      where: { userId },
    });

    const completedBooks = await prisma.book.count({
      where: {
        userId,
        status: 'COMPLETED',
      },
    });

    const readingBooks = await prisma.book.count({
      where: {
        userId,
        status: 'READING',
      },
    });

    const toReadBooks = await prisma.book.count({
      where: {
        userId,
        status: 'TO_READ',
      },
    });

    // Yıllık istatistikler
    const yearlyCompleted = await prisma.book.count({
      where: {
        userId,
        status: 'COMPLETED',
        finishDate: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
    });

    // Toplam sayfa sayısı
    const totalPagesResult = await prisma.book.aggregate({
      where: {
        userId,
        status: 'COMPLETED',
        finishDate: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      _sum: {
        pageCount: true,
      },
    });

    // Türlere göre dağılım
    const booksByGenre = await prisma.book.groupBy({
      by: ['genre'],
      where: {
        userId,
        status: 'COMPLETED',
        genre: {
          not: null,
        },
      },
      _count: {
        genre: true,
      },
    });

    // Aylık okuma dağılımı
    const monthlyReading = await prisma.$queryRaw`
      SELECT 
        strftime('%m', finishDate) as month,
        COUNT(*) as count
      FROM books 
      WHERE userId = ${userId} 
        AND status = 'COMPLETED' 
        AND finishDate >= ${startOfYear.toISOString()} 
        AND finishDate <= ${endOfYear.toISOString()}
      GROUP BY strftime('%m', finishDate)
      ORDER BY month
    `;

    // Ortalama puanlama
    const averageRatingResult = await prisma.book.aggregate({
      where: {
        userId,
        rating: {
          not: null,
        },
      },
      _avg: {
        rating: true,
      },
    });

    // En çok alıntı yapılan kitaplar
    const topQuotedBooks = await prisma.book.findMany({
      where: {
        userId,
      },
      include: {
        quotes: true,
        _count: {
          select: {
            quotes: true,
          },
        },
      },
      orderBy: {
        quotes: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    const stats = {
      overview: {
        totalBooks,
        completedBooks,
        readingBooks,
        toReadBooks,
        yearlyCompleted,
        totalPages: totalPagesResult._sum.pageCount || 0,
        averageRating: averageRatingResult._avg.rating || 0,
      },
      charts: {
        genreDistribution: booksByGenre.map(item => ({
          genre: item.genre || 'Diğer',
          count: item._count.genre,
        })),
        monthlyReading: Array.from({ length: 12 }, (_, i) => {
          const monthData = (monthlyReading as any[]).find(
            item => parseInt(item.month) === i + 1
          );
          return {
            month: new Date(2024, i).toLocaleDateString('tr-TR', { month: 'short' }),
            count: monthData?.count || 0,
          };
        }),
      },
      topQuotedBooks: topQuotedBooks.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        quotesCount: book._count.quotes,
      })),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}