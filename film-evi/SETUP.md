# 🎬 Film Evi - Kurulum Rehberi

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- Node.js 18.0.0 veya üzeri
- npm 8.0.0 veya üzeri
- TMDB API Key

### 2. TMDB API Key Alma
1. [TMDB](https://www.themoviedb.org/) sitesinde ücretsiz hesap oluşturun
2. [API Settings](https://www.themoviedb.org/settings/api) sayfasına gidin
3. API Key'inizi kopyalayın

### 3. Kurulum
```bash
# Bağımlılıkları yükleyin
npm install

# Environment variables ayarlayın
cp .env.local.example .env.local
```

### 4. Environment Variables
`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_TMDB_API_KEY=your_actual_tmdb_api_key_here
```

### 5. Çalıştırma
```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build
npm start
```

## 📁 Proje Yapısı

```
film-evi/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx       # Ana layout
│   │   ├── page.tsx         # Ana sayfa
│   │   └── globals.css      # Global stiller
│   ├── components/          # React bileşenleri
│   │   ├── ui/              # Temel UI bileşenleri
│   │   │   └── button.tsx   # Button bileşeni
│   │   ├── layout/          # Layout bileşenleri
│   │   │   └── header.tsx   # Header bileşeni
│   │   └── movie/           # Film bileşenleri
│   │       └── movie-card.tsx # Film kartı
│   ├── lib/                 # Utility fonksiyonları
│   │   ├── utils.ts         # Genel utilities
│   │   └── tmdb.ts          # TMDB API servisi
│   └── types/               # TypeScript tipleri
│       └── index.ts         # Tip tanımları
├── public/                  # Statik dosyalar
├── .env.local              # Environment variables
├── tailwind.config.ts      # Tailwind konfigürasyonu
├── package.json            # Proje bağımlılıkları
└── README.md               # Proje dokümantasyonu
```

## 🎨 Tasarım Sistemi

### Renkler
- **Netflix Kırmızı**: `#E50914` (bg-red-600)
- **Koyu Kırmızı**: `#B20710` (bg-red-700)
- **Siyah**: `#000000` (bg-black)
- **Koyu Gri**: `#141414`

### Tipografi
- **Font**: Inter (Google Fonts)
- **Başlıklar**: font-bold
- **Metin**: font-normal

### Animasyonlar
- **Hover Efektleri**: scale-105, hover geçişleri
- **Loading**: Spinner animasyonları
- **Smooth Transitions**: 200-300ms duration

## 🧩 Bileşenler

### Header
- Kullanıcı değiştirici (İrem/Yusuf/İkimiz)
- Navigasyon menüsü
- Mobil responsive

### MovieCard
- Film posteri ve bilgileri
- Hover efektleri
- Hızlı aksiyonlar (favoriye ekleme, liste ekleme)

### Button
- Netflix tarzı kırmızı buton
- Glass morphism efekti
- Çeşitli boyutlar (sm, default, lg, icon)

## 🔌 API Entegrasyonu

### TMDB Service
- Popüler filmler
- En iyi filmler
- Trend filmler
- Yakında çıkacak filmler
- Rastgele film önerici

### Kullanım Örneği
```typescript
import TMDBService from '@/lib/tmdb';

// Popüler filmler
const movies = await TMDBService.getPopularMovies(1);

// Rastgele film
const randomMovie = await TMDBService.getRandomMovie({
  minVoteAverage: 7.0
});
```

## 🎯 Özellikler

### ✅ Tamamlanan
- [x] Modern Next.js 15 setup
- [x] Netflix tarzı tasarım
- [x] TMDB API entegrasyonu
- [x] Kullanıcı değiştirici
- [x] Film kartları ve listeler
- [x] Responsive tasarım
- [x] TypeScript tip güvenliği

### 🚧 Devam Eden
- [ ] Film detay sayfası
- [ ] Arama ve filtreleme
- [ ] Kullanıcı puanlama sistemi
- [ ] İstatistik sayfaları
- [ ] Veritabanı entegrasyonu

### 🔮 Gelecek Planları
- [ ] AI destekli öneriler
- [ ] Social özellikler
- [ ] Mobile app
- [ ] Offline support

## 🐛 Sorun Giderme

### Build Hataları
```bash
# Type checking
npm run type-check

# Linting
npm run lint
```

### API Sorunları
- TMDB API key'in doğru olduğundan emin olun
- Rate limiting için bekleyin
- Network bağlantısını kontrol edin

### Stil Sorunları
- Tailwind CSS cache'ini temizleyin
- Browser cache'ini temizleyin

## 📞 Destek

Sorun yaşarsanız:
1. GitHub Issues açın
2. Error loglarını paylaşın
3. Detaylı açıklama yapın

## 🎉 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun
3. Commit yapın
4. Pull request gönderin

---

**Film Evi** - İrem & Yusuf'un sinema tutkusu ile ❤️ yapıldı