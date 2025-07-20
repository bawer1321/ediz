<?php
/**
 * Film Evi - Statistics API
 * Kullanıcı istatistikleri ve uyumluluk analizi
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();
require_once '../config/database.php';

/**
 * Response helper function
 */
function jsonResponse($success, $data = null, $message = '', $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message,
        'timestamp' => date('c')
    ]);
    exit();
}

/**
 * Error handler
 */
function handleError($message, $statusCode = 400) {
    error_log("Stats API Error: " . $message);
    jsonResponse(false, null, $message, $statusCode);
}

try {
    $action = $_GET['action'] ?? null;
    $userId = $_SESSION['current_user'] ?? null;
    
    switch ($action) {
        case 'user_stats':
            handleUserStats();
            break;
            
        case 'compatibility':
            handleCompatibilityStats();
            break;
            
        case 'movie_trends':
            handleMovieTrends();
            break;
            
        case 'genre_analysis':
            handleGenreAnalysis();
            break;
            
        case 'monthly_activity':
            handleMonthlyActivity();
            break;
            
        case 'comparison':
            handleUserComparison();
            break;
            
        case 'achievements':
            handleAchievements();
            break;
            
        default:
            handleError('Geçersiz action parametresi');
    }

} catch (Exception $e) {
    handleError('Sunucu hatası: ' . $e->getMessage(), 500);
}

/**
 * Kullanıcı istatistikleri
 */
function handleUserStats() {
    try {
        $db = getDB();
        
        // İrem istatistikleri
        $iremStats = getUserBasicStats('irem', $db);
        
        // Yusuf istatistikleri
        $yusufStats = getUserBasicStats('yusuf', $db);
        
        // Uyumluluk skoru
        $compatibilityScore = calculateCompatibilityScore($db);
        
        jsonResponse(true, [
            'stats' => [
                'irem' => $iremStats,
                'yusuf' => $yusufStats,
                'compatibility_score' => $compatibilityScore
            ]
        ]);
        
    } catch (Exception $e) {
        handleError('İstatistikler alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * Kullanıcı temel istatistiklerini al
 */
function getUserBasicStats($userId, $db) {
    // Toplam film sayısı
    $totalMovies = $db->fetchOne(
        "SELECT COUNT(*) as count FROM user_movies WHERE user_id = ? AND status = 'watched'",
        [$userId]
    )['count'] ?? 0;
    
    // Ortalama puan
    $avgRating = $db->fetchOne(
        "SELECT AVG(rating) as avg_rating FROM user_movies WHERE user_id = ? AND rating IS NOT NULL",
        [$userId]
    )['avg_rating'] ?? 0;
    
    // Favori türler
    $favoriteGenres = $db->fetchAll(
        "SELECT 
            JSON_UNQUOTE(JSON_EXTRACT(m.genres, '$[*].name')) as genre,
            COUNT(*) as count
        FROM user_movies um
        JOIN movies m ON um.movie_id = m.id
        WHERE um.user_id = ? AND um.status = 'watched'
        GROUP BY genre
        ORDER BY count DESC
        LIMIT 5",
        [$userId]
    );
    
    // İzleme listesi sayısı
    $watchlistCount = $db->fetchOne(
        "SELECT COUNT(*) as count FROM user_movies WHERE user_id = ? AND status = 'watchlist'",
        [$userId]
    )['count'] ?? 0;
    
    // Favori filmler sayısı
    $favoritesCount = $db->fetchOne(
        "SELECT COUNT(*) as count FROM user_movies WHERE user_id = ? AND is_favorite = 1",
        [$userId]
    )['count'] ?? 0;
    
    // Bu ayki izlenen filmler
    $thisMonthCount = $db->fetchOne(
        "SELECT COUNT(*) as count FROM user_movies 
         WHERE user_id = ? AND status = 'watched' 
         AND MONTH(watch_date) = MONTH(CURRENT_DATE()) 
         AND YEAR(watch_date) = YEAR(CURRENT_DATE())",
        [$userId]
    )['count'] ?? 0;
    
    // En yüksek puanlı film
    $topRatedMovie = $db->fetchOne(
        "SELECT m.title, um.rating 
         FROM user_movies um
         JOIN movies m ON um.movie_id = m.id
         WHERE um.user_id = ? AND um.rating IS NOT NULL
         ORDER BY um.rating DESC, um.created_at DESC
         LIMIT 1",
        [$userId]
    );
    
    return [
        'total_movies' => (int)$totalMovies,
        'average_rating' => round($avgRating, 1),
        'favorite_genres' => $favoriteGenres,
        'watchlist_count' => (int)$watchlistCount,
        'favorites_count' => (int)$favoritesCount,
        'this_month_count' => (int)$thisMonthCount,
        'top_rated_movie' => $topRatedMovie
    ];
}

/**
 * Uyumluluk skoru hesapla
 */
function calculateCompatibilityScore($db) {
    // Ortak izlenen filmler
    $commonMovies = $db->fetchAll(
        "SELECT 
            m.title,
            i.rating as irem_rating,
            y.rating as yusuf_rating,
            ABS(i.rating - y.rating) as difference
        FROM movies m
        JOIN user_movies i ON m.id = i.movie_id AND i.user_id = 'irem' AND i.rating IS NOT NULL
        JOIN user_movies y ON m.id = y.movie_id AND y.user_id = 'yusuf' AND y.rating IS NOT NULL"
    );
    
    if (empty($commonMovies)) {
        return 0;
    }
    
    // Ortalama fark hesapla
    $totalDifference = array_sum(array_column($commonMovies, 'difference'));
    $avgDifference = $totalDifference / count($commonMovies);
    
    // Uyumluluk skorunu hesapla (10 - ortalama fark) * 10
    $compatibilityScore = max(0, (10 - $avgDifference) * 10);
    
    return round($compatibilityScore, 1);
}

/**
 * Detaylı uyumluluk analizi
 */
function handleCompatibilityStats() {
    try {
        $db = getDB();
        
        // Ortak filmler analizi
        $commonMoviesAnalysis = $db->fetchAll(
            "SELECT 
                m.title,
                m.poster_path,
                i.rating as irem_rating,
                y.rating as yusuf_rating,
                ABS(i.rating - y.rating) as difference,
                CASE 
                    WHEN ABS(i.rating - y.rating) = 0 THEN 'perfect'
                    WHEN ABS(i.rating - y.rating) <= 1 THEN 'good'
                    WHEN ABS(i.rating - y.rating) <= 2 THEN 'fair'
                    WHEN ABS(i.rating - y.rating) <= 3 THEN 'poor'
                    ELSE 'conflict'
                END as agreement_level
            FROM movies m
            JOIN user_movies i ON m.id = i.movie_id AND i.user_id = 'irem' AND i.rating IS NOT NULL
            JOIN user_movies y ON m.id = y.movie_id AND y.user_id = 'yusuf' AND y.rating IS NOT NULL
            ORDER BY difference ASC, m.title"
        );
        
        // Uyumluluk özeti
        $agreementSummary = [
            'total_movies' => count($commonMoviesAnalysis),
            'perfect_matches' => 0,
            'good_matches' => 0,
            'fair_matches' => 0,
            'poor_matches' => 0,
            'conflicts' => 0
        ];
        
        foreach ($commonMoviesAnalysis as $movie) {
            $agreementSummary[$movie['agreement_level'] . '_matches']++;
        }
        
        // En uyumlu türler
        $genreCompatibility = $db->fetchAll(
            "SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(m.genres, '$[0].name')) as genre,
                AVG(ABS(i.rating - y.rating)) as avg_difference,
                COUNT(*) as movie_count
            FROM movies m
            JOIN user_movies i ON m.id = i.movie_id AND i.user_id = 'irem' AND i.rating IS NOT NULL
            JOIN user_movies y ON m.id = y.movie_id AND y.user_id = 'yusuf' AND y.rating IS NOT NULL
            WHERE JSON_EXTRACT(m.genres, '$[0].name') IS NOT NULL
            GROUP BY genre
            HAVING movie_count >= 3
            ORDER BY avg_difference ASC"
        );
        
        // Motivasyon mesajları
        $motivationMessages = generateMotivationMessages($agreementSummary, $commonMoviesAnalysis);
        
        jsonResponse(true, [
            'common_movies' => $commonMoviesAnalysis,
            'agreement_summary' => $agreementSummary,
            'genre_compatibility' => $genreCompatibility,
            'compatibility_score' => calculateCompatibilityScore($db),
            'motivation_messages' => $motivationMessages
        ]);
        
    } catch (Exception $e) {
        handleError('Uyumluluk analizi alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * Film trendleri
 */
function handleMovieTrends() {
    try {
        $db = getDB();
        $userId = $_SESSION['current_user'] ?? null;
        
        if (!$userId || $userId === 'couple') {
            handleError('Geçerli kullanıcı gerekli');
        }
        
        // Aylık izleme aktivitesi (son 12 ay)
        $monthlyActivity = $db->fetchAll(
            "SELECT 
                DATE_FORMAT(watch_date, '%Y-%m') as month,
                COUNT(*) as movie_count
            FROM user_movies 
            WHERE user_id = ? AND status = 'watched' 
                AND watch_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
            GROUP BY month
            ORDER BY month",
            [$userId]
        );
        
        // Puan dağılımı
        $ratingDistribution = $db->fetchAll(
            "SELECT 
                FLOOR(rating) as rating,
                COUNT(*) as count
            FROM user_movies 
            WHERE user_id = ? AND rating IS NOT NULL
            GROUP BY FLOOR(rating)
            ORDER BY rating",
            [$userId]
        );
        
        // Favori türler zaman içinde
        $genreTrends = $db->fetchAll(
            "SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(m.genres, '$[0].name')) as genre,
                DATE_FORMAT(um.watch_date, '%Y-%m') as month,
                COUNT(*) as count
            FROM user_movies um
            JOIN movies m ON um.movie_id = m.id
            WHERE um.user_id = ? AND um.status = 'watched'
                AND um.watch_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 6 MONTH)
                AND JSON_EXTRACT(m.genres, '$[0].name') IS NOT NULL
            GROUP BY genre, month
            ORDER BY month, count DESC",
            [$userId]
        );
        
        jsonResponse(true, [
            'monthly_activity' => $monthlyActivity,
            'rating_distribution' => $ratingDistribution,
            'genre_trends' => $genreTrends
        ]);
        
    } catch (Exception $e) {
        handleError('Film trendleri alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * Tür analizi
 */
function handleGenreAnalysis() {
    try {
        $db = getDB();
        $userId = $_SESSION['current_user'] ?? null;
        
        if (!$userId || $userId === 'couple') {
            handleError('Geçerli kullanıcı gerekli');
        }
        
        // Tür bazlı istatistikler
        $genreStats = $db->fetchAll(
            "SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(m.genres, '$[0].name')) as genre,
                COUNT(*) as total_movies,
                AVG(um.rating) as avg_rating,
                COUNT(CASE WHEN um.is_favorite = 1 THEN 1 END) as favorites_count,
                MIN(um.watch_date) as first_watched,
                MAX(um.watch_date) as last_watched
            FROM user_movies um
            JOIN movies m ON um.movie_id = m.id
            WHERE um.user_id = ? AND um.status = 'watched'
                AND JSON_EXTRACT(m.genres, '$[0].name') IS NOT NULL
            GROUP BY genre
            HAVING total_movies >= 2
            ORDER BY total_movies DESC",
            [$userId]
        );
        
        // Tür keşfetme önerileri
        $genreRecommendations = $db->fetchAll(
            "SELECT 
                JSON_UNQUOTE(JSON_EXTRACT(m.genres, '$[0].name')) as genre,
                COUNT(*) as available_movies,
                AVG(m.vote_average) as avg_tmdb_rating
            FROM movies m
            LEFT JOIN user_movies um ON m.id = um.movie_id AND um.user_id = ?
            WHERE um.id IS NULL
                AND JSON_EXTRACT(m.genres, '$[0].name') IS NOT NULL
                AND m.vote_average >= 7.0
            GROUP BY genre
            ORDER BY available_movies DESC
            LIMIT 10",
            [$userId]
        );
        
        jsonResponse(true, [
            'genre_stats' => $genreStats,
            'genre_recommendations' => $genreRecommendations
        ]);
        
    } catch (Exception $e) {
        handleError('Tür analizi alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * Aylık aktivite
 */
function handleMonthlyActivity() {
    try {
        $db = getDB();
        
        // Her iki kullanıcı için aylık aktivite
        $iremActivity = getMonthlyActivityForUser('irem', $db);
        $yusufActivity = getMonthlyActivityForUser('yusuf', $db);
        
        // Ortak aktivite (aynı ay içinde izlenen filmler)
        $commonActivity = $db->fetchAll(
            "SELECT 
                DATE_FORMAT(i.watch_date, '%Y-%m') as month,
                COUNT(DISTINCT i.movie_id) as irem_movies,
                COUNT(DISTINCT y.movie_id) as yusuf_movies,
                COUNT(DISTINCT CASE WHEN i.movie_id = y.movie_id THEN i.movie_id END) as common_movies
            FROM user_movies i
            LEFT JOIN user_movies y ON DATE_FORMAT(i.watch_date, '%Y-%m') = DATE_FORMAT(y.watch_date, '%Y-%m') 
                AND y.user_id = 'yusuf' AND y.status = 'watched'
            WHERE i.user_id = 'irem' AND i.status = 'watched'
                AND i.watch_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
            GROUP BY month
            ORDER BY month"
        );
        
        jsonResponse(true, [
            'irem_activity' => $iremActivity,
            'yusuf_activity' => $yusufActivity,
            'common_activity' => $commonActivity
        ]);
        
    } catch (Exception $e) {
        handleError('Aylık aktivite alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * Kullanıcı karşılaştırması
 */
function handleUserComparison() {
    try {
        $db = getDB();
        
        // Genel karşılaştırma
        $comparison = [
            'irem' => getUserDetailedStats('irem', $db),
            'yusuf' => getUserDetailedStats('yusuf', $db)
        ];
        
        // En büyük farklılıklar
        $biggestDifferences = $db->fetchAll(
            "SELECT 
                m.title,
                m.poster_path,
                i.rating as irem_rating,
                y.rating as yusuf_rating,
                ABS(i.rating - y.rating) as difference
            FROM movies m
            JOIN user_movies i ON m.id = i.movie_id AND i.user_id = 'irem' AND i.rating IS NOT NULL
            JOIN user_movies y ON m.id = y.movie_id AND y.user_id = 'yusuf' AND y.rating IS NOT NULL
            ORDER BY difference DESC
            LIMIT 10"
        );
        
        // En büyük uyumlar
        $biggestAgreements = $db->fetchAll(
            "SELECT 
                m.title,
                m.poster_path,
                i.rating as irem_rating,
                y.rating as yusuf_rating,
                ABS(i.rating - y.rating) as difference
            FROM movies m
            JOIN user_movies i ON m.id = i.movie_id AND i.user_id = 'irem' AND i.rating IS NOT NULL
            JOIN user_movies y ON m.id = y.movie_id AND y.user_id = 'yusuf' AND y.rating IS NOT NULL
            WHERE i.rating >= 8 AND y.rating >= 8
            ORDER BY difference ASC, i.rating DESC
            LIMIT 10"
        );
        
        jsonResponse(true, [
            'comparison' => $comparison,
            'biggest_differences' => $biggestDifferences,
            'biggest_agreements' => $biggestAgreements
        ]);
        
    } catch (Exception $e) {
        handleError('Kullanıcı karşılaştırması alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * Başarımlar
 */
function handleAchievements() {
    try {
        $db = getDB();
        $userId = $_SESSION['current_user'] ?? null;
        
        if (!$userId || $userId === 'couple') {
            handleError('Geçerli kullanıcı gerekli');
        }
        
        // Mevcut başarımlar
        $achievements = $db->fetchAll(
            "SELECT * FROM achievements WHERE user_id = ? ORDER BY unlocked_at DESC",
            [$userId]
        );
        
        // Potansiyel yeni başarımları kontrol et
        $newAchievements = checkForNewAchievements($userId, $db);
        
        // Başarım kategorileri
        $achievementCategories = [
            'movie_count' => 'Film Sayısı',
            'rating_streak' => 'Puanlama Serisi',
            'genre_explorer' => 'Tür Kaşifi',
            'social' => 'Sosyal',
            'special' => 'Özel'
        ];
        
        jsonResponse(true, [
            'achievements' => $achievements,
            'new_achievements' => $newAchievements,
            'categories' => $achievementCategories
        ]);
        
    } catch (Exception $e) {
        handleError('Başarımlar alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * Kullanıcı için aylık aktivite
 */
function getMonthlyActivityForUser($userId, $db) {
    return $db->fetchAll(
        "SELECT 
            DATE_FORMAT(watch_date, '%Y-%m') as month,
            COUNT(*) as movie_count,
            AVG(rating) as avg_rating
        FROM user_movies 
        WHERE user_id = ? AND status = 'watched' 
            AND watch_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 12 MONTH)
        GROUP BY month
        ORDER BY month",
        [$userId]
    );
}

/**
 * Detaylı kullanıcı istatistikleri
 */
function getUserDetailedStats($userId, $db) {
    $basicStats = getUserBasicStats($userId, $db);
    
    // Ek istatistikler
    $additionalStats = [
        'longest_streak' => calculateWatchingStreak($userId, $db),
        'most_productive_month' => getMostProductiveMonth($userId, $db),
        'rating_tendency' => getRatingTendency($userId, $db)
    ];
    
    return array_merge($basicStats, $additionalStats);
}

/**
 * İzleme serisi hesapla
 */
function calculateWatchingStreak($userId, $db) {
    $recentWatches = $db->fetchAll(
        "SELECT DISTINCT DATE(watch_date) as watch_day
         FROM user_movies 
         WHERE user_id = ? AND status = 'watched' AND watch_date IS NOT NULL
         ORDER BY watch_day DESC
         LIMIT 30",
        [$userId]
    );
    
    if (empty($recentWatches)) return 0;
    
    $streak = 0;
    $currentDate = new DateTime();
    
    foreach ($recentWatches as $watch) {
        $watchDate = new DateTime($watch['watch_day']);
        $diff = $currentDate->diff($watchDate)->days;
        
        if ($diff === $streak) {
            $streak++;
            $currentDate = $watchDate;
        } else {
            break;
        }
    }
    
    return $streak;
}

/**
 * En üretken ay
 */
function getMostProductiveMonth($userId, $db) {
    return $db->fetchOne(
        "SELECT 
            DATE_FORMAT(watch_date, '%Y-%m') as month,
            COUNT(*) as movie_count
        FROM user_movies 
        WHERE user_id = ? AND status = 'watched'
        GROUP BY month
        ORDER BY movie_count DESC
        LIMIT 1",
        [$userId]
    );
}

/**
 * Puanlama eğilimi
 */
function getRatingTendency($userId, $db) {
    $ratings = $db->fetchAll(
        "SELECT rating FROM user_movies 
         WHERE user_id = ? AND rating IS NOT NULL 
         ORDER BY created_at DESC 
         LIMIT 20",
        [$userId]
    );
    
    if (count($ratings) < 5) return 'normal';
    
    $recent = array_slice(array_column($ratings, 'rating'), 0, 10);
    $older = array_slice(array_column($ratings, 'rating'), 10);
    
    $recentAvg = array_sum($recent) / count($recent);
    $olderAvg = array_sum($older) / count($older);
    
    $diff = $recentAvg - $olderAvg;
    
    if ($diff > 0.5) return 'increasing';
    if ($diff < -0.5) return 'decreasing';
    return 'stable';
}

/**
 * Motivasyon mesajları oluştur
 */
function generateMotivationMessages($agreementSummary, $commonMovies) {
    $messages = [];
    
    $totalMovies = $agreementSummary['total_movies'];
    $perfectMatches = $agreementSummary['perfect_matches'];
    $goodMatches = $agreementSummary['good_matches'];
    
    if ($totalMovies == 0) {
        $messages[] = [
            'type' => 'encouragement',
            'message' => 'Birlikte film izlemeye başlayın! İlk ortak filminizi ekleyin. 🎬',
            'icon' => 'fas fa-heart'
        ];
    } else {
        $compatibilityRate = ($perfectMatches + $goodMatches) / $totalMovies;
        
        if ($compatibilityRate > 0.8) {
            $messages[] = [
                'type' => 'celebration',
                'message' => 'Harika uyum! Film zevkleriniz çok benzer. 🌟',
                'icon' => 'fas fa-star'
            ];
        } elseif ($compatibilityRate > 0.6) {
            $messages[] = [
                'type' => 'positive',
                'message' => 'İyi uyum sergileyorsunuz. Yeni türler keşfetmeye devam edin! 🎭',
                'icon' => 'fas fa-thumbs-up'
            ];
        } else {
            $messages[] = [
                'type' => 'improvement',
                'message' => 'Farklı zevkleriniz var - bu harika! Birbirinizi yeni türlerle tanıştırın. 🎨',
                'icon' => 'fas fa-palette'
            ];
        }
    }
    
    return $messages;
}

/**
 * Yeni başarımları kontrol et
 */
function checkForNewAchievements($userId, $db) {
    $newAchievements = [];
    
    // Örnek başarım kontrolü: İlk 10 film
    $movieCount = $db->fetchOne(
        "SELECT COUNT(*) as count FROM user_movies WHERE user_id = ? AND status = 'watched'",
        [$userId]
    )['count'];
    
    if ($movieCount >= 10) {
        $existing = $db->fetchOne(
            "SELECT id FROM achievements WHERE user_id = ? AND achievement_type = 'first_10_movies'",
            [$userId]
        );
        
        if (!$existing) {
            $newAchievements[] = [
                'type' => 'first_10_movies',
                'name' => 'Sinema Tutkunu',
                'description' => 'İlk 10 filminizi izlediniz!',
                'icon' => 'fas fa-trophy'
            ];
        }
    }
    
    return $newAchievements;
}

?>