# 📚 Kitap Takip Sistemi

Modern ve kullanıcı dostu bir kitap takip uygulaması. Kitaplarınızı organize edin, notlar alın, alıntılar yapın ve okuma hedeflerinizi takip edin.

![Kitap Takip Sistemi](https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=400&fit=crop)

## ✨ Özellikler

### 📚 Kitap Yönetimi
- ✅ Manuel kitap ekleme
- ✅ Google Books API ile otomatik kitap bilgisi çekme
- ✅ Kitap kapağı otomatik indirme
- ✅ Okuma durumu takibi (Okunacak/Okunuyor/Okundu/Duraklatıldı)
- ✅ Kişisel puanlama sistemi (0-10)
- ✅ Okuma tarihleri ve ilerleme takibi

### ✏️ Notlar ve Alıntılar
- ✅ Markdown destekli not alma
- ✅ Sayfa numarası ile not eşleştirme
- ✅ Alıntı kaydetme ve etiketleme
- ✅ Tarih bazlı filtreleme
- ✅ Arama ve kategorilendirme

### 📊 İstatistikler ve Analiz
- ✅ Aylık/yıllık okuma grafikleri
- ✅ Tür bazlı kitap dağılımı
- ✅ Okuma hızı ve ilerleme analizi
- ✅ En çok alıntı yapılan kitaplar
- ✅ Ortalama puanlama

### 🎨 Modern UI/UX
- ✅ Responsive tasarım
- ✅ Dark/Light mode (planlanan)
- ✅ Kart ve liste görünümü
- ✅ Gelişmiş arama ve filtreleme
- ✅ Mobil uyumlu arayüz

## 🛠️ Teknoloji Stack'i

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Shadcn UI** - UI components
- **Lucide React** - Icons
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - REST API
- **Prisma ORM** - Database management
- **SQLite** - Development database
- **Google Books API** - Book data

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- npm veya yarn
- Git

### Adım Adım Kurulum

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd book-tracker
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables'ları ayarlayın**
```bash
cp .env .env.local
```

`.env.local` dosyasını düzenleyin:
```env
# Database
DATABASE_URL="file:./dev.db"

# Google Books API (opsiyonel)
GOOGLE_BOOKS_API_KEY="your-google-books-api-key"

# NextAuth (gelecekte kullanılacak)
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Veritabanını oluşturun**
```bash
npx prisma generate
npx prisma db push
```

5. **Demo verilerini yükleyin**
```bash
npm run db:seed
```

6. **Development server'ını başlatın**
```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışacaktır.

## 📱 Kullanım

### Kitap Ekleme
1. Ana sayfada "Kitap Ekle" butonuna tıklayın
2. "API'den Ara" sekmesinde kitap arayın veya "Manuel Ekle" sekmesinde bilgileri girin
3. Kitap bilgilerini gözden geçirin ve kaydedin

### Not ve Alıntı Ekleme
1. Kitap kartından detay sayfasına gidin
2. "Not Ekle" veya "Alıntı Ekle" butonlarını kullanın
3. İçeriği yazın ve sayfa numarasını belirtin

### İstatistikleri Görüntüleme
- Sol sidebar'da anlık istatistiklerinizi görün
- Detaylı analiz için "İstatistikler" sayfasına gidin

## 🗃️ Veritabanı Yapısı

### Ana Tablolar
- `users` - Kullanıcı bilgileri
- `books` - Kitap bilgileri
- `notes` - Kullanıcı notları
- `quotes` - Alıntılar
- `reading_goals` - Okuma hedefleri
- `reading_sessions` - Okuma oturumları

### İlişkiler
- Bir kullanıcının birden fazla kitabı olabilir
- Her kitabın birden fazla notu ve alıntısı olabilir
- Okuma oturumları kitaplarla ilişkilendirilir

## 🔧 API Endpoints

### Kitaplar
- `GET /api/books` - Kitap listesi
- `POST /api/books` - Yeni kitap ekleme
- `GET /api/books/[id]` - Tek kitap detayı
- `PUT /api/books/[id]` - Kitap güncelleme
- `DELETE /api/books/[id]` - Kitap silme
- `GET /api/books/search` - Google Books arama

### Notlar ve Alıntılar
- `GET /api/notes` - Not listesi
- `POST /api/notes` - Yeni not ekleme
- `GET /api/quotes` - Alıntı listesi
- `POST /api/quotes` - Yeni alıntı ekleme

### İstatistikler
- `GET /api/stats` - Kullanıcı istatistikleri

## 🎯 Gelecek Özellikler

### Kimlik Doğrulama
- [ ] NextAuth.js entegrasyonu
- [ ] Google/GitHub OAuth
- [ ] Kullanıcı profilleri

### Gelişmiş Özellikler
- [ ] PWA desteği (offline kullanım)
- [ ] Dark mode
- [ ] Veri dışa aktarma (PDF/CSV)
- [ ] Kitap önerileri (AI destekli)
- [ ] Sosyal özellikler (kitap paylaşımı)

### Mobil Uygulama
- [ ] React Native uygulaması
- [ ] Push notification'lar
- [ ] Barcode scanner

## 🤝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasını inceleyin.

## 👥 Katkıda Bulunanlar

- **Ana Geliştirici** - İlk sürüm ve temel özellikler

## 📞 İletişim

Sorularınız veya önerileriniz için:
- GitHub Issues
- Email: [your-email@example.com]

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

## 🔧 Geliştirme Notları

### Kod Yapısı
```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── ui/            # Shadcn UI components
│   ├── book-card.tsx  # Kitap kartı
│   ├── add-book-dialog.tsx
│   └── stats-overview.tsx
└── lib/               # Utility functions
    ├── prisma.ts      # Database client
    ├── google-books.ts # API service
    └── utils.ts       # Helper functions
```

### Önemli Dosyalar
- `prisma/schema.prisma` - Veritabanı şeması
- `prisma/seed.ts` - Demo veri script'i
- `components.json` - Shadcn UI konfigürasyonu
- `.env` - Environment variables

### Development Commands
```bash
# Development server
npm run dev

# Build production
npm run build

# Database operations
npx prisma studio          # Database GUI
npx prisma db push         # Apply schema changes
npx prisma generate        # Generate client
npm run db:seed           # Load demo data

# Code quality
npm run lint              # ESLint check
npm run type-check        # TypeScript check
```
