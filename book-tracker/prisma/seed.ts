import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Demo kullanıcısı oluştur
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      id: 'temp-user-123',
      email: 'demo@example.com',
      name: 'Demo Kullanıcı',
    },
  });

  console.log('Demo kullanıcı oluşturuldu:', demoUser);

  // Demo kitapları oluştur
  const books = [
    {
      title: 'Suç ve Ceza',
      author: 'Fyodor Dostoyevski',
      publisher: 'İş Bankası Kültür Yayınları',
      publishedYear: 2019,
      pageCount: 632,
      isbn: '978-9754584462',
      description: 'Raskolnikov adlı genç bir adamın işlediği cinayet sonrasında yaşadığı psikolojik çöküş ve vicdan azabını anlatan bu başyapıt, insan ruhunun derinliklerini keşfetmemizi sağlar.',
      coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      genre: 'Klasik Edebiyat',
      status: 'COMPLETED',
      rating: 9.2,
      startDate: new Date('2024-01-15'),
      finishDate: new Date('2024-02-10'),
      userId: demoUser.id,
    },
    {
      title: 'Simyacı',
      author: 'Paulo Coelho',
      publisher: 'Can Yayınları',
      publishedYear: 2020,
      pageCount: 176,
      isbn: '978-9750718187',
      description: 'Genç çoban Santiago\'nun hazinesi arayışında çıktığı yolculuk ve bu yolculukta öğrendiği hayat dersleri.',
      coverUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      genre: 'Felsefe',
      status: 'READING',
      rating: 8.5,
      startDate: new Date('2024-11-01'),
      userId: demoUser.id,
    },
    {
      title: '1984',
      author: 'George Orwell',
      publisher: 'Can Yayınları',
      publishedYear: 2021,
      pageCount: 368,
      isbn: '978-9750719936',
      description: 'Totaliter bir rejimin kontrolü altındaki distopik bir toplumda yaşayan Winston Smith\'in hikayesi.',
      coverUrl: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=300&h=400&fit=crop',
      genre: 'Distopya',
      status: 'TO_READ',
      userId: demoUser.id,
    },
    {
      title: 'Küçük Prens',
      author: 'Antoine de Saint-Exupéry',
      publisher: 'Türkiye İş Bankası Kültür Yayınları',
      publishedYear: 2018,
      pageCount: 96,
      isbn: '978-9754584479',
      description: 'Küçük bir çocuğun gözünden yetişkin dünyasına eleştirel bir bakış.',
      coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      genre: 'Çocuk Edebiyatı',
      status: 'COMPLETED',
      rating: 8.8,
      startDate: new Date('2024-10-01'),
      finishDate: new Date('2024-10-05'),
      userId: demoUser.id,
    },
    {
      title: 'Sapiens: İnsan Türünün Kısa Tarihi',
      author: 'Yuval Noah Harari',
      publisher: 'Kolektif Kitap',
      publishedYear: 2022,
      pageCount: 512,
      isbn: '978-9750726465',
      description: 'İnsanlığın tarih boyunca geçirdiği evrim sürecini ve toplumsal dönüşümleri anlatan kapsamlı bir eser.',
      coverUrl: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop',
      genre: 'Tarih',
      status: 'PAUSED',
      rating: 9.0,
      startDate: new Date('2024-09-15'),
      userId: demoUser.id,
    }
  ];

  for (const bookData of books) {
    const book = await prisma.book.create({
      data: bookData,
    });

    // Her kitap için demo notlar ekle
    if (book.status === 'COMPLETED' || book.status === 'READING') {
      await prisma.note.create({
        data: {
          content: `Bu kitap hakkında ilk notlarım. **${book.title}** gerçekten etkileyici bir eser.`,
          page: Math.floor(Math.random() * (book.pageCount || 100)),
          bookId: book.id,
          userId: demoUser.id,
        },
      });

      // Demo alıntılar ekle
      const quotes = [
        'Hayatın anlamı, ona verdiğimiz anlamda saklıdır.',
        'İnsan ruhunun derinlikleri, ancak büyük acılar yaşandığında ortaya çıkar.',
        'Gerçek bilgelik, kendi cehaletini kabul etmekle başlar.',
      ];

      await prisma.quote.create({
        data: {
          content: quotes[Math.floor(Math.random() * quotes.length)],
          page: Math.floor(Math.random() * (book.pageCount || 100)),
          tags: JSON.stringify(['felsefe', 'yaşam', 'bilgelik']),
          bookId: book.id,
          userId: demoUser.id,
        },
      });
    }

    // Okuma oturumları ekle
    if (book.status === 'READING' || book.status === 'COMPLETED') {
      const sessionCount = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < sessionCount; i++) {
        await prisma.readingSession.create({
          data: {
            startPage: i * 50 + 1,
            endPage: (i + 1) * 50,
            duration: Math.floor(Math.random() * 120) + 30, // 30-150 dakika
            sessionDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Son 30 gün
            bookId: book.id,
            userId: demoUser.id,
          },
        });
      }
    }
  }

  // Demo okuma hedefi ekle
  await prisma.readingGoal.create({
    data: {
      year: new Date().getFullYear(),
      targetBooks: 50,
      targetPages: 15000,
      period: 'YEARLY',
      userId: demoUser.id,
    },
  });

  console.log('Demo veriler başarıyla eklendi!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });