# 🎬 Film Evi - Kurulum Kılavuzu

## Netflix Tarzında Modern Film Takip Uygulaması
İrem & Yusuf için özel tasarlanmış, çift odaklı film takip platformu

---

## 📋 Sistem Gereksinimleri

### Sunucu Gereksinimleri
- **PHP**: 7.4 veya üzeri (8.0+ önerilir)
- **MySQL**: 5.7 veya üzeri (8.0+ önerilir)
- **Web Sunucusu**: Apache 2.4+ veya Nginx 1.18+
- **Bellek**: En az 256MB PHP memory limit
- **Disk Alanı**: En az 100MB boş alan

### PHP Eklentileri
```bash
- php-mysql (PDO MySQL)
- php-json
- php-curl
- php-mbstring
- php-openssl
- php-gd (opsiyonel, görsel işleme için)
```

### cPanel Gereksinimleri
- **PHP Sürümü**: 7.4+
- **MySQL Veritabanı**: Yeni veritabanı oluşturma yetkisi
- **File Manager**: Dosya yükleme ve düzenleme yetkisi
- **phpMyAdmin**: Veritabanı yönetimi erişimi

---

## 🚀 Kurulum Adımları

### 1. Dosyaları Yükleme

#### cPanel File Manager ile:
1. cPanel'e giriş yapın
2. **File Manager**'ı açın
3. `public_html` klasörüne gidin
4. Tüm proje dosyalarını yükleyin
5. Gerekirse ZIP dosyasını çıkarın

#### FTP ile:
```bash
# FTP istemciniz ile bağlanın
# Tüm dosyaları public_html'e yükleyin
```

### 2. Veritabanı Kurulumu

#### a) Veritabanı Oluşturma
1. cPanel **MySQL Databases** bölümüne gidin
2. Yeni veritabanı oluşturun: `film_evi_db`
3. Yeni kullanıcı oluşturun veya mevcut kullanıcıyı kullanın
4. Kullanıcıya tüm yetkiler verin

#### b) Tabloları İçe Aktarma
1. **phpMyAdmin**'e gidin
2. `film_evi_db` veritabanını seçin
3. **Import** sekmesine gidin
4. `database/schema.sql` dosyasını seçin
5. **Go** butonuna tıklayın

### 3. Konfigürasyon

#### a) Veritabanı Ayarları
`config/database.php` dosyasını düzenleyin:

```php
// Veritabanı bilgilerinizi güncelleyin
private $host = 'localhost';
private $database = 'film_evi_db'; // Veritabanı adınız
private $username = 'your_username'; // Kullanıcı adınız
private $password = 'your_password'; // Şifreniz
```

#### b) TMDB API Anahtarı
1. [TMDB](https://www.themoviedb.org/settings/api) adresinden API key alın
2. `config/database.php` dosyasında güncelleyin:

```php
define('TMDB_API_KEY', 'your_tmdb_api_key_here');
```

#### c) Uygulama URL'si
```php
define('APP_URL', 'https://yourdomain.com'); // Domain adresinizi girin
```

### 4. Dosya İzinleri

Aşağıdaki klasörlere yazma izni verin:
```bash
chmod 755 assets/
chmod 755 uploads/ (eğer oluşturursanız)
chmod 644 config/database.php
```

### 5. Test

1. Tarayıcınızda domain adresinizi açın
2. Ana sayfa yüklendiğini kontrol edin
3. Kullanıcı seçimi yapın (İrem/Yusuf/Birlikte)
4. Temel işlevleri test edin

---

## ⚙️ Gelişmiş Konfigürasyon

### SSL Sertifikası
```apache
# .htaccess dosyasına ekleyin
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Güvenlik Ayarları
```php
// Production ortamında hata raporlamayı kapatın
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);
```

### Cache Optimizasyonu
```apache
# .htaccess - Static dosyalar için cache
<IfModule mod_expires.c>
ExpiresActive On
ExpiresByType text/css "access plus 1 month"
ExpiresByType application/javascript "access plus 1 month"
ExpiresByType image/png "access plus 1 year"
ExpiresByType image/jpg "access plus 1 year"
ExpiresByType image/jpeg "access plus 1 year"
</IfModule>
```

---

## 📱 Özellikler

### ✅ Temel Özellikler
- **Kullanıcı Yönetimi**: İrem, Yusuf ve Çift modu
- **Film Arama**: TMDB API entegrasyonu
- **Puanlama Sistemi**: 1-10 skala
- **Liste Yönetimi**: İzlenecek, İzlenen, Favoriler
- **Responsive Tasarım**: Mobil ve masaüstü uyumlu

### 🎯 Çift Odaklı Özellikler
- **Uyumluluk Analizi**: Puanlama benzerliği hesaplama
- **Karşılaştırmalı İstatistikler**: İrem vs Yusuf
- **Ortak Film Önerileri**: Birlikte izleme önerileri
- **Motivasyon Mesajları**: İlişki bazlı geri bildirimler

### 📊 İstatistik ve Analiz
- **Detaylı Dashboard**: Kişisel izleme istatistikleri
- **Tür Analizi**: Favori kategoriler ve trendler
- **Aylık Aktivite**: Zaman çizelgesi grafikleri
- **Başarım Sistemi**: Rozetler ve hedefler

### 🎨 Modern UI/UX
- **Netflix Tarzı Tasarım**: Koyu tema, kırmızı vurgular
- **Glassmorphism**: Şeffaf kartlar ve blur efektleri
- **Smooth Animasyonlar**: Sinematik geçişler
- **Mikro Etkileşimler**: Hover ve tıklama efektleri

---

## 🔧 API Endpoints

### Kimlik Doğrulama
```
POST /api/auth.php
- action: select_user, get_current_user, logout, check_session
```

### İstatistikler
```
GET /api/stats.php
- action: user_stats, compatibility, movie_trends, genre_analysis
```

### Aktiviteler
```
GET /api/activity.php
- action: recent, user_timeline, feed, stats_timeline
```

---

## 🐛 Sorun Giderme

### Yaygın Hatalar

#### 1. "Veritabanı bağlantısı başarısız"
```
Çözüm:
- config/database.php dosyasındaki bilgileri kontrol edin
- MySQL kullanıcısının yetkilerini kontrol edin
- cPanel'de veritabanı durumunu kontrol edin
```

#### 2. "TMDB API hatası"
```
Çözüm:
- API key'in doğru olduğunu kontrol edin
- TMDB hesabınızın aktif olduğunu kontrol edin
- Günlük API limitinizi kontrol edin
```

#### 3. "404 Not Found" hataları
```
Çözüm:
- .htaccess dosyasının doğru yüklendiğini kontrol edin
- mod_rewrite'ın aktif olduğunu kontrol edin
- Dosya yollarını kontrol edin
```

#### 4. CSS/JS dosyaları yüklenmiyor
```
Çözüm:
- Dosya izinlerini kontrol edin (chmod 644)
- .htaccess cache ayarlarını kontrol edin
- Browser cache'ini temizleyin
```

### Log Dosyaları
```bash
# PHP error log
tail -f /path/to/php_error.log

# Apache error log
tail -f /var/log/apache2/error.log
```

---

## 📈 Performans Optimizasyonu

### 1. Database Optimizasyonu
```sql
-- İndeksleri kontrol edin
SHOW INDEX FROM movies;
SHOW INDEX FROM user_movies;

-- Sorgu performansını analiz edin
EXPLAIN SELECT * FROM movies WHERE title LIKE '%search%';
```

### 2. Cache Stratejisi
```php
// API responses için cache
$cacheFile = "cache/tmdb_" . md5($query) . ".json";
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < 3600) {
    return json_decode(file_get_contents($cacheFile), true);
}
```

### 3. Image Optimization
```php
// Poster görselleri için lazy loading
<img data-src="https://image.tmdb.org/t/p/w300/poster.jpg" class="lazy-load" />
```

---

## 🔐 Güvenlik

### 1. Input Validation
```php
// SQL Injection koruması
$stmt = $pdo->prepare("SELECT * FROM movies WHERE id = ?");
$stmt->execute([$movieId]);
```

### 2. XSS Koruması
```php
// Output encoding
echo htmlspecialchars($userInput, ENT_QUOTES, 'UTF-8');
```

### 3. CSRF Koruması
```php
// Token doğrulama
if (!hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
    die('CSRF token mismatch');
}
```

---

## 📞 Destek

### Teknik Destek
- **Email**: support@filmevi.com
- **Dokümantasyon**: [GitHub Wiki](https://github.com/filmevi/docs)
- **Issue Tracker**: [GitHub Issues](https://github.com/filmevi/issues)

### Özellik İstekleri
- Yeni özellik önerileri için GitHub Issues kullanın
- Community Discord: [discord.gg/filmevi](https://discord.gg/filmevi)

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

---

## 🎉 Teşekkürler

- **TMDB**: Film veritabanı API'si için
- **Font Awesome**: Icon library için
- **Inter Font**: Typography için
- **Netflix**: Tasarım ilhamı için

---

**Film Evi** - İrem & Yusuf'un Sinema Dünyası 🎬❤️