-- Film Evi Veritabanı Şeması
-- PHPMyAdmin'e import edilebilir

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- Veritabanı oluştur (eğer yoksa)
CREATE DATABASE IF NOT EXISTS `film_evi_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `film_evi_db`;

-- --------------------------------------------------------

-- Kullanıcılar tablosu
CREATE TABLE `users` (
  `id` varchar(50) NOT NULL PRIMARY KEY,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `avatar` varchar(10) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `preferences` JSON DEFAULT NULL,
  `settings` JSON DEFAULT NULL,
  `total_movies_watched` int(11) DEFAULT 0,
  `total_watch_time` int(11) DEFAULT 0,
  `favorite_genres` JSON DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default kullanıcıları ekle
INSERT INTO `users` (`id`, `name`, `avatar`, `color`, `preferences`, `settings`) VALUES
('irem', 'İrem', '💖', '#e91e63', '["drama", "romance", "comedy"]', '{"theme": "dark", "language": "tr"}'),
('yusuf', 'Yusuf', '⭐', '#2196f3', '["action", "thriller", "sci-fi"]', '{"theme": "dark", "language": "tr"}');

-- --------------------------------------------------------

-- Filmler tablosu (TMDB verilerini cache'ler)
CREATE TABLE `movies` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `tmdb_id` int(11) NOT NULL UNIQUE,
  `title` varchar(255) NOT NULL,
  `original_title` varchar(255) DEFAULT NULL,
  `overview` text DEFAULT NULL,
  `release_date` date DEFAULT NULL,
  `runtime` int(11) DEFAULT NULL,
  `vote_average` decimal(3,1) DEFAULT NULL,
  `vote_count` int(11) DEFAULT NULL,
  `popularity` decimal(8,3) DEFAULT NULL,
  `genres` JSON DEFAULT NULL,
  `poster_path` varchar(255) DEFAULT NULL,
  `backdrop_path` varchar(255) DEFAULT NULL,
  `original_language` varchar(10) DEFAULT NULL,
  `spoken_languages` JSON DEFAULT NULL,
  `production_countries` JSON DEFAULT NULL,
  `production_companies` JSON DEFAULT NULL,
  `cast` JSON DEFAULT NULL,
  `crew` JSON DEFAULT NULL,
  `videos` JSON DEFAULT NULL,
  `images` JSON DEFAULT NULL,
  `budget` bigint(20) DEFAULT NULL,
  `revenue` bigint(20) DEFAULT NULL,
  `adult` boolean DEFAULT FALSE,
  `status` varchar(50) DEFAULT NULL,
  `tagline` text DEFAULT NULL,
  `homepage` varchar(500) DEFAULT NULL,
  `imdb_id` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `idx_tmdb_id` (`tmdb_id`),
  INDEX `idx_release_date` (`release_date`),
  INDEX `idx_vote_average` (`vote_average`),
  INDEX `idx_popularity` (`popularity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Kullanıcı film etkileşimleri
CREATE TABLE `user_movies` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` varchar(50) NOT NULL,
  `movie_id` int(11) NOT NULL,
  `status` enum('watchlist', 'watching', 'watched', 'dropped', 'favorite') NOT NULL DEFAULT 'watchlist',
  `rating` decimal(2,1) DEFAULT NULL CHECK (rating >= 1 AND rating <= 10),
  `review` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `watch_date` date DEFAULT NULL,
  `watch_count` int(11) DEFAULT 1,
  `is_favorite` boolean DEFAULT FALSE,
  `is_private` boolean DEFAULT FALSE,
  `mood_rating` enum('terrible', 'bad', 'okay', 'good', 'excellent') DEFAULT NULL,
  `rewatch_value` int(1) DEFAULT NULL CHECK (rewatch_value >= 1 AND rewatch_value <= 5),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_movie` (`user_id`, `movie_id`),
  INDEX `idx_user_status` (`user_id`, `status`),
  INDEX `idx_watch_date` (`watch_date`),
  INDEX `idx_rating` (`rating`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Listeler (özel koleksiyonlar)
CREATE TABLE `lists` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `is_public` boolean DEFAULT TRUE,
  `is_collaborative` boolean DEFAULT FALSE,
  `color` varchar(7) DEFAULT NULL,
  `sort_order` enum('date_added', 'title', 'release_date', 'rating', 'custom') DEFAULT 'date_added',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_public` (`user_id`, `is_public`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Liste filmleri
CREATE TABLE `list_movies` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `list_id` int(11) NOT NULL,
  `movie_id` int(11) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `notes` text DEFAULT NULL,
  `added_by` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_list_movie` (`list_id`, `movie_id`),
  INDEX `idx_sort_order` (`list_id`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Aktivite geçmişi
CREATE TABLE `activities` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` varchar(50) NOT NULL,
  `type` enum('movie_added', 'movie_watched', 'movie_rated', 'movie_reviewed', 'list_created', 'list_updated') NOT NULL,
  `movie_id` int(11) DEFAULT NULL,
  `list_id` int(11) DEFAULT NULL,
  `data` JSON DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`list_id`) REFERENCES `lists`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_date` (`user_id`, `created_at`),
  INDEX `idx_type_date` (`type`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- İstatistikler cache
CREATE TABLE `stats_cache` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` varchar(50) DEFAULT NULL,
  `stat_type` varchar(100) NOT NULL,
  `stat_data` JSON NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_stat` (`user_id`, `stat_type`),
  INDEX `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Film önerileri
CREATE TABLE `recommendations` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` varchar(50) NOT NULL,
  `movie_id` int(11) NOT NULL,
  `score` decimal(5,3) NOT NULL,
  `reason` text DEFAULT NULL,
  `source` enum('ai', 'compatibility', 'genre', 'director', 'actor', 'similar') NOT NULL,
  `is_viewed` boolean DEFAULT FALSE,
  `is_dismissed` boolean DEFAULT FALSE,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_movie_rec` (`user_id`, `movie_id`),
  INDEX `idx_score` (`user_id`, `score` DESC),
  INDEX `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Çift uyumluluk verileri
CREATE TABLE `compatibility_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `movie_id` int(11) NOT NULL,
  `irem_rating` decimal(2,1) DEFAULT NULL,
  `yusuf_rating` decimal(2,1) DEFAULT NULL,
  `difference` decimal(2,1) DEFAULT NULL,
  `agreement_level` enum('perfect', 'good', 'fair', 'poor', 'conflict') DEFAULT NULL,
  `calculated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`movie_id`) REFERENCES `movies`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_movie_compatibility` (`movie_id`),
  INDEX `idx_agreement` (`agreement_level`),
  INDEX `idx_difference` (`difference`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Arama geçmişi
CREATE TABLE `search_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` varchar(50) NOT NULL,
  `query` varchar(255) NOT NULL,
  `results_count` int(11) DEFAULT 0,
  `clicked_movie_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`clicked_movie_id`) REFERENCES `movies`(`id`) ON DELETE SET NULL,
  INDEX `idx_user_date` (`user_id`, `created_at`),
  INDEX `idx_query` (`query`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Sesli arama cache (gelecek özellik)
CREATE TABLE `voice_search_cache` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` varchar(50) NOT NULL,
  `audio_hash` varchar(64) NOT NULL,
  `transcript` text NOT NULL,
  `search_query` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_audio_hash` (`audio_hash`),
  INDEX `idx_user_date` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Hedefler ve rozetler
CREATE TABLE `achievements` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_id` varchar(50) NOT NULL,
  `achievement_type` varchar(100) NOT NULL,
  `achievement_data` JSON DEFAULT NULL,
  `unlocked_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_notified` boolean DEFAULT FALSE,
  
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  UNIQUE KEY `unique_user_achievement` (`user_id`, `achievement_type`),
  INDEX `idx_unlocked` (`unlocked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

-- Sistem ayarları
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `setting_key` varchar(100) NOT NULL UNIQUE,
  `setting_value` text NOT NULL,
  `setting_type` enum('string', 'int', 'float', 'boolean', 'json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Varsayılan sistem ayarları
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `setting_type`, `description`) VALUES
('app_version', '1.0.0', 'string', 'Uygulama sürümü'),
('maintenance_mode', 'false', 'boolean', 'Bakım modu durumu'),
('tmdb_cache_duration', '86400', 'int', 'TMDB verilerinin cache süresi (saniye)'),
('max_search_results', '20', 'int', 'Maksimum arama sonucu sayısı'),
('compatibility_algorithm', 'cosine_similarity', 'string', 'Uyumluluk hesaplama algoritması'),
('recommendation_count', '10', 'int', 'Gösterilecek öneri sayısı');

-- --------------------------------------------------------

-- Triggerlar ve stored procedureler

-- Kullanıcı istatistiklerini güncelle
DELIMITER $$
CREATE TRIGGER `update_user_stats_after_movie_insert` 
AFTER INSERT ON `user_movies` FOR EACH ROW 
BEGIN
    IF NEW.status = 'watched' THEN
        UPDATE users SET 
            total_movies_watched = total_movies_watched + 1
        WHERE id = NEW.user_id;
    END IF;
END$$

CREATE TRIGGER `update_user_stats_after_movie_update` 
AFTER UPDATE ON `user_movies` FOR EACH ROW 
BEGIN
    IF OLD.status != 'watched' AND NEW.status = 'watched' THEN
        UPDATE users SET 
            total_movies_watched = total_movies_watched + 1
        WHERE id = NEW.user_id;
    ELSEIF OLD.status = 'watched' AND NEW.status != 'watched' THEN
        UPDATE users SET 
            total_movies_watched = total_movies_watched - 1
        WHERE id = NEW.user_id;
    END IF;
END$$

-- Uyumluluk verilerini hesapla
CREATE TRIGGER `calculate_compatibility_after_rating` 
AFTER INSERT ON `user_movies` FOR EACH ROW 
BEGIN
    IF NEW.rating IS NOT NULL THEN
        INSERT INTO compatibility_data (movie_id, irem_rating, yusuf_rating, difference, agreement_level)
        VALUES (NEW.movie_id, 
                CASE WHEN NEW.user_id = 'irem' THEN NEW.rating ELSE NULL END,
                CASE WHEN NEW.user_id = 'yusuf' THEN NEW.rating ELSE NULL END,
                0, 'fair')
        ON DUPLICATE KEY UPDATE
            irem_rating = CASE WHEN NEW.user_id = 'irem' THEN NEW.rating ELSE irem_rating END,
            yusuf_rating = CASE WHEN NEW.user_id = 'yusuf' THEN NEW.rating ELSE yusuf_rating END,
            difference = CASE 
                WHEN irem_rating IS NOT NULL AND yusuf_rating IS NOT NULL 
                THEN ABS(irem_rating - yusuf_rating)
                ELSE difference 
            END,
            agreement_level = CASE 
                WHEN ABS(irem_rating - yusuf_rating) = 0 THEN 'perfect'
                WHEN ABS(irem_rating - yusuf_rating) <= 1 THEN 'good'
                WHEN ABS(irem_rating - yusuf_rating) <= 2 THEN 'fair'
                WHEN ABS(irem_rating - yusuf_rating) <= 3 THEN 'poor'
                ELSE 'conflict'
            END,
            calculated_at = CURRENT_TIMESTAMP;
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

-- Viewlar (Sık kullanılan sorgular için)

-- Kullanıcı özet istatistikleri
CREATE VIEW `user_summary_stats` AS
SELECT 
    u.id,
    u.name,
    u.total_movies_watched,
    COUNT(CASE WHEN um.status = 'watchlist' THEN 1 END) as watchlist_count,
    COUNT(CASE WHEN um.status = 'favorite' THEN 1 END) as favorites_count,
    AVG(um.rating) as average_rating,
    MAX(um.created_at) as last_activity
FROM users u
LEFT JOIN user_movies um ON u.id = um.user_id
GROUP BY u.id, u.name, u.total_movies_watched;

-- Çift uyumluluk özeti
CREATE VIEW `compatibility_summary` AS
SELECT 
    COUNT(*) as total_rated_together,
    AVG(difference) as average_difference,
    COUNT(CASE WHEN agreement_level = 'perfect' THEN 1 END) as perfect_matches,
    COUNT(CASE WHEN agreement_level = 'good' THEN 1 END) as good_matches,
    COUNT(CASE WHEN agreement_level = 'conflict' THEN 1 END) as conflicts,
    (COUNT(CASE WHEN agreement_level IN ('perfect', 'good') THEN 1 END) / COUNT(*) * 100) as compatibility_percentage
FROM compatibility_data 
WHERE irem_rating IS NOT NULL AND yusuf_rating IS NOT NULL;

-- Son aktiviteler view
CREATE VIEW `recent_activities_view` AS
SELECT 
    a.id,
    a.user_id,
    u.name as user_name,
    a.type,
    a.created_at,
    m.title as movie_title,
    m.poster_path,
    l.name as list_name,
    a.data
FROM activities a
JOIN users u ON a.user_id = u.id
LEFT JOIN movies m ON a.movie_id = m.id
LEFT JOIN lists l ON a.list_id = l.id
ORDER BY a.created_at DESC;

COMMIT;