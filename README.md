# 🎬 Film Evi - İrem & Yusuf'un Kişisel Film Takip Uygulaması

Netflix tarzında modern, çift odaklı film takip uygulaması. İrem ve Yusuf çifti için özel tasarlanmış, kişiselleştirilmiş istatistikler ve uyumluluk analizi içeren full-stack web uygulaması.

![Film Evi Banner](https://via.placeholder.com/1200x400/E50914/FFFFFF?text=Film+Evi)

## ✨ Özellikler

### 📱 Temel Fonksiyonlar
- **Film Arama & Ekleme**: TMDB API ile 500,000+ film veritabanı
- **Akıllı Puanlama Sistemi**: 1-10 skala ile kişiselleştirilmiş puanlama
- **Liste Yönetimi**: İzlenecekler, İzlenenler, Favoriler
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu
- **Çift Kullanıcı Sistemi**: İrem/Yusuf/Ortak görünümler

### 🔍 Film Keşfet Sayfası
- **Akıllı Arama Motoru**: Debounced, otomatik tamamlama
- **Gelişmiş Filtreler**: Tür, yıl, puan, süre, dil filtreleme
- **Tab Sistemi**: Popüler, En İyi, Vizyonda, Yakında Çıkacak
- **Rastgele Film Önerici**: Hazine Avcısı AI
- **Grid/Liste Görünüm**: Esnek görüntüleme seçenekleri
- **Sonsuz Scroll**: Kesintisiz film keşfi

### 📊 İstatistikler ve Analiz
- **Çift Uyumluluk Skoru**: Puanlama benzerliği analizi
- **Kişisel Dashboard**: İzleme alışkanlıkları, favori türler
- **Karşılaştırmalı Analiz**: İrem vs Yusuf tercihleri
- **En Büyük Uyumlar/Anlaşmazlıklar**: Film bazlı karşılaştırma
- **Aylık İzleme Aktivitesi**: Zaman çizelgesi grafikleri
- **Tür Dağılımı**: Dairesel ve çubuk grafikler
- **İzleme Streak'i**: Süreklilik takibi

### 🎭 Film Detay Sayfası
- **Hero Section**: Büyük backdrop görüntüleri
- **Kapsamlı Bilgiler**: Süre, tür, puan, oyuncu kadrosu
- **Çift Puanlama**: İrem ve Yusuf için ayrı puanlar
- **Kişisel Notlar**: Film anıları ve yorumlar
- **İzleme Tarihi**: Detaylı tarih takibi
- **Benzer Filmler**: AI destekli öneriler
- **Trailer Embed**: YouTube entegrasyonu

### 👥 Kullanıcı Sistemi
- **Kullanıcı Değiştirici**: Hızlı profil geçişi
- **Kişisel Tercihler**: Özelleştirilebilir ayarlar
- **Ayrı İzleme Geçmişleri**: Bireysel takip
- **Ortak Film Listesi**: Paylaşılan deneyimler
- **Profil Özelleştirme**: Kişiselleştirme seçenekleri

## 🎨 Tasarım ve UI/UX

### Netflix Tarzı Modern Tasarım
- **Koyu Tema**: Sinematik deneyim
- **Kırmızı Vurgular**: Netflix brand renkleri
- **Glassmorphism**: Şeffaf kartlar, blur efektleri
- **Gradient Arka Planlar**: Dinamik renk geçişleri

### Animasyonlar ve Etkileşimler
- **Framer Motion**: Sinematik geçişler
- **Mikro Etkileşimler**: Hover efektleri, tıklama animasyonları
- **Loading States**: Skeleton UI, progress barlar
- **Smooth Transitions**: Akıcı sayfa geçişleri

## 🚀 Teknoloji Stack'i

### Frontend
- **Next.js 15**: React framework
- **TypeScript**: Tip güvenliği
- **Tailwind CSS**: Utility-first CSS
- **Framer Motion**: Animasyon kütüphanesi
- **React Query**: Veri yönetimi
- **Lucide React**: Modern iconlar

### API ve Veri
- **TMDB API**: Film veritabanı
- **Axios**: HTTP client
- **Date-fns**: Tarih işlemleri

### UI Bileşenleri
- **Radix UI**: Erişilebilir bileşenler
- **Class Variance Authority**: Component variants
- **Clsx + Tailwind Merge**: Conditional styling

## 📦 Kurulum

### Gereksinimler
- Node.js 18.0.0 veya üzeri
- npm 8.0.0 veya üzeri
- TMDB API key

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone https://github.com/filmevi/film-evi.git
cd film-evi
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Environment variables ayarlayın**
```bash
cp .env.local.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

5. **Tarayıcıda açın**
[http://localhost:3000](http://localhost:3000)

## 🔧 Geliştirme

### Komutlar
```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Production sunucusu
npm run start

# Linting
npm run lint

# Type checking
npm run type-check

# Code formatting
npm run format

# Temizlik
npm run clean
```

### Proje Yapısı
```
film-evi/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── discover/        # Film keşfet sayfası
│   │   ├── movie/           # Film detay sayfaları
│   │   ├── stats/           # İstatistik sayfaları
│   │   └── api/             # API routes
│   ├── components/          # React bileşenleri
│   │   ├── ui/              # Temel UI bileşenleri
│   │   ├── layout/          # Layout bileşenleri
│   │   ├── movie/           # Film bileşenleri
│   │   └── stats/           # İstatistik bileşenleri
│   ├── lib/                 # Utility fonksiyonları
│   ├── types/               # TypeScript tipleri
│   ├── hooks/               # Custom React hooks
│   └── utils/               # Yardımcı fonksiyonlar
├── public/                  # Statik dosyalar
└── docs/                    # Dokümantasyon
```

## 🎯 Kullanım

### Kullanıcı Değiştirme
Header'daki kullanıcı avatarına tıklayarak İrem, Yusuf veya İkimiz görünümü arasında geçiş yapabilirsiniz.

### Film Arama
1. Ana sayfadan "Keşfet" sekmesine gidin
2. Arama kutusuna film adını yazın
3. Filtreleri kullanarak sonuçları daraltın
4. İstediğiniz filmi bulup detaylarına gidin

### Film Puanlama
1. Film detay sayfasında puanlama bölümünü bulun
2. 1-10 arası puan verin
3. İsteğe bağlı not ekleyin
4. "Kaydet" butonuna tıklayın

### İstatistikleri Görüntüleme
1. Header'dan "İstatistikler" sekmesine gidin
2. Kişisel veya çift istatistiklerini seçin
3. Grafikleri ve analizleri inceleyin

## 📈 Gelecek Özellikler

### v2.0 Planları
- [ ] **AI Destekli Öneriler**: Makine öğrenmesi ile film önerileri
- [ ] **Social Features**: Arkadaşlarla liste paylaşımı
- [ ] **Advanced Analytics**: Detaylı raporlar ve insights
- [ ] **Mobile App**: React Native uygulaması
- [ ] **Offline Support**: PWA özellikleri
- [ ] **Voice Search**: Sesli arama desteği

### v3.0 Vizyonu
- [ ] **Multi-platform**: TV, tablet, smartwatch desteği
- [ ] **AR/VR Integration**: Sanal sinema deneyimi
- [ ] **Blockchain**: NFT film koleksiyonları
- [ ] **AI Chatbot**: Film danışmanı asistanı

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

### Geliştirme Kuralları
- TypeScript kullanın
- ESLint kurallarına uyun
- Prettier ile kod formatlayın
- Component'ler için JSDoc yazın
- Test yazın (yakında)

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👨‍💻 Geliştirici

**Film Evi Ekibi**
- Email: info@filmevi.com
- Website: https://filmevi.com
- GitHub: [@filmevi](https://github.com/filmevi)

## 🙏 Teşekkürler

- [TMDB](https://www.themoviedb.org/) - Film veritabanı API'si
- [Netflix](https://netflix.com) - Tasarım ilhamı
- [Vercel](https://vercel.com) - Hosting
- [Radix UI](https://radix-ui.com) - UI bileşenleri

## 📊 İstatistikler

![GitHub stars](https://img.shields.io/github/stars/filmevi/film-evi?style=social)
![GitHub forks](https://img.shields.io/github/forks/filmevi/film-evi?style=social)
![GitHub issues](https://img.shields.io/github/issues/filmevi/film-evi)
![GitHub license](https://img.shields.io/github/license/filmevi/film-evi)

---

<div align="center">
  <p>❤️ İrem & Yusuf ile sevgilerle yapıldı</p>
  <p>🎬 Sinema sevgisi ile kodlandı</p>
</div>