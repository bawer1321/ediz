# Public Assets

Bu klasörde Film Evi uygulamasının statik dosyaları bulunur.

## Gerekli Görseller

Uygulamanın tam çalışması için aşağıdaki görsellerin eklenmesi gerekir:

### Placeholder Görseller
- `placeholder-movie.jpg` - Film posteri bulunamadığında gösterilecek
- `placeholder-backdrop.jpg` - Film arkaplan görseli bulunamadığında gösterilecek
- `placeholder-profile.jpg` - Profil fotoğrafı bulunamadığında gösterilecek

### Avatar Görseller
- `avatars/irem.jpg` - İrem'in profil fotoğrafı
- `avatars/yusuf.jpg` - Yusuf'un profil fotoğrafı
- `avatars/couple.jpg` - Çift fotoğrafı
- `avatars/default.jpg` - Varsayılan avatar

### Meta Görseller
- `og-image.jpg` - Open Graph görseli (1200x630px)
- `favicon.ico` - Site ikonu (zaten mevcut)

### Logo ve Branding
- `logo.svg` - Film Evi logosu
- `logo-white.svg` - Beyaz versiyon logo

## Kullanım

Bu görseller `next/image` bileşeni tarafından otomatik olarak optimize edilir ve lazy loading ile yüklenir.