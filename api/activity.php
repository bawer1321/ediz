<?php
/**
 * Film Evi - Activity API
 * Kullanıcı aktivite takibi ve geçmiş
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
    error_log("Activity API Error: " . $message);
    jsonResponse(false, null, $message, $statusCode);
}

try {
    $action = $_GET['action'] ?? null;
    $userId = $_SESSION['current_user'] ?? null;
    
    switch ($action) {
        case 'recent':
            handleRecentActivity();
            break;
            
        case 'user_timeline':
            handleUserTimeline();
            break;
            
        case 'add':
            handleAddActivity();
            break;
            
        case 'feed':
            handleActivityFeed();
            break;
            
        case 'stats_timeline':
            handleStatsTimeline();
            break;
            
        default:
            handleError('Geçersiz action parametresi');
    }

} catch (Exception $e) {
    handleError('Sunucu hatası: ' . $e->getMessage(), 500);
}

/**
 * Son aktiviteleri getir
 */
function handleRecentActivity() {
    try {
        $db = getDB();
        $limit = $_GET['limit'] ?? 10;
        $limit = min(max(1, (int)$limit), 50); // 1-50 arası sınırla
        
        $activities = $db->fetchAll(
            "SELECT 
                a.id,
                a.user_id,
                u.name as user_name,
                u.avatar as user_avatar,
                u.color as user_color,
                a.type,
                a.created_at,
                a.data,
                m.title as movie_title,
                m.poster_path as movie_poster,
                m.tmdb_id as movie_tmdb_id,
                l.name as list_name
            FROM activities a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN movies m ON a.movie_id = m.id
            LEFT JOIN lists l ON a.list_id = l.id
            ORDER BY a.created_at DESC
            LIMIT ?",
            [$limit]
        );
        
        // Aktiviteleri formatla
        $formattedActivities = [];
        foreach ($activities as $activity) {
            $formattedActivities[] = formatActivity($activity);
        }
        
        jsonResponse(true, [
            'activities' => $formattedActivities,
            'count' => count($formattedActivities)
        ]);
        
    } catch (Exception $e) {
        handleError('Son aktiviteler alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * Kullanıcı zaman çizelgesi
 */
function handleUserTimeline() {
    try {
        $db = getDB();
        $targetUserId = $_GET['user_id'] ?? $_SESSION['current_user'];
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(max(5, (int)($_GET['limit'] ?? 20)), 100);
        $offset = ($page - 1) * $limit;
        
        if (!$targetUserId || $targetUserId === 'couple') {
            handleError('Geçerli kullanıcı gerekli');
        }
        
        // Kullanıcının aktiviteleri
        $activities = $db->fetchAll(
            "SELECT 
                a.id,
                a.user_id,
                u.name as user_name,
                u.avatar as user_avatar,
                u.color as user_color,
                a.type,
                a.created_at,
                a.data,
                m.title as movie_title,
                m.poster_path as movie_poster,
                m.release_date as movie_release_date,
                m.vote_average as movie_rating,
                l.name as list_name
            FROM activities a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN movies m ON a.movie_id = m.id
            LEFT JOIN lists l ON a.list_id = l.id
            WHERE a.user_id = ?
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?",
            [$targetUserId, $limit, $offset]
        );
        
        // Toplam sayı
        $totalCount = $db->fetchOne(
            "SELECT COUNT(*) as count FROM activities WHERE user_id = ?",
            [$targetUserId]
        )['count'];
        
        // Aktiviteleri formatla ve gruplandır
        $formattedActivities = [];
        $groupedByDate = [];
        
        foreach ($activities as $activity) {
            $formatted = formatActivity($activity);
            $date = date('Y-m-d', strtotime($activity['created_at']));
            
            if (!isset($groupedByDate[$date])) {
                $groupedByDate[$date] = [
                    'date' => $date,
                    'formatted_date' => formatDate($date),
                    'activities' => []
                ];
            }
            
            $groupedByDate[$date]['activities'][] = $formatted;
            $formattedActivities[] = $formatted;
        }
        
        jsonResponse(true, [
            'activities' => $formattedActivities,
            'grouped_by_date' => array_values($groupedByDate),
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total_count' => (int)$totalCount,
                'total_pages' => ceil($totalCount / $limit),
                'has_next' => ($offset + $limit) < $totalCount,
                'has_prev' => $page > 1
            ]
        ]);
        
    } catch (Exception $e) {
        handleError('Kullanıcı zaman çizelgesi alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * Yeni aktivite ekle
 */
function handleAddActivity() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        handleError('POST metodu gerekli', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $_SESSION['current_user'] ?? null;
    
    if (!$userId || $userId === 'couple') {
        handleError('Geçerli kullanıcı gerekli');
    }
    
    $type = $input['type'] ?? null;
    $movieId = $input['movie_id'] ?? null;
    $listId = $input['list_id'] ?? null;
    $data = $input['data'] ?? [];
    
    if (!$type) {
        handleError('Aktivite türü gerekli');
    }
    
    // Geçerli aktivite türleri
    $validTypes = [
        'movie_added', 'movie_watched', 'movie_rated', 'movie_reviewed',
        'list_created', 'list_updated', 'achievement_unlocked'
    ];
    
    if (!in_array($type, $validTypes)) {
        handleError('Geçersiz aktivite türü');
    }
    
    try {
        $db = getDB();
        
        // Aktiviteyi ekle
        $db->query(
            "INSERT INTO activities (user_id, type, movie_id, list_id, data) VALUES (?, ?, ?, ?, ?)",
            [
                $userId,
                $type,
                $movieId,
                $listId,
                json_encode($data)
            ]
        );
        
        $activityId = $db->lastInsertId();
        
        jsonResponse(true, [
            'activity_id' => $activityId
        ], 'Aktivite başarıyla eklendi');
        
    } catch (Exception $e) {
        handleError('Aktivite eklenirken hata: ' . $e->getMessage(), 500);
    }
}

/**
 * Aktivite akışı (feed)
 */
function handleActivityFeed() {
    try {
        $db = getDB();
        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(max(5, (int)($_GET['limit'] ?? 15)), 50);
        $offset = ($page - 1) * $limit;
        $filter = $_GET['filter'] ?? 'all'; // all, movies, lists, achievements
        
        // Filter koşulu
        $whereClause = '';
        $params = [];
        
        switch ($filter) {
            case 'movies':
                $whereClause = 'WHERE a.type IN (?, ?, ?, ?)';
                $params = ['movie_added', 'movie_watched', 'movie_rated', 'movie_reviewed'];
                break;
            case 'lists':
                $whereClause = 'WHERE a.type IN (?, ?)';
                $params = ['list_created', 'list_updated'];
                break;
            case 'achievements':
                $whereClause = 'WHERE a.type = ?';
                $params = ['achievement_unlocked'];
                break;
        }
        
        $params[] = $limit;
        $params[] = $offset;
        
        // Aktivite akışı
        $activities = $db->fetchAll(
            "SELECT 
                a.id,
                a.user_id,
                u.name as user_name,
                u.avatar as user_avatar,
                u.color as user_color,
                a.type,
                a.created_at,
                a.data,
                m.title as movie_title,
                m.poster_path as movie_poster,
                m.vote_average as movie_rating,
                m.release_date as movie_release_date,
                JSON_EXTRACT(m.genres, '$[0].name') as movie_genre,
                l.name as list_name,
                l.description as list_description
            FROM activities a
            JOIN users u ON a.user_id = u.id
            LEFT JOIN movies m ON a.movie_id = m.id
            LEFT JOIN lists l ON a.list_id = l.id
            $whereClause
            ORDER BY a.created_at DESC
            LIMIT ? OFFSET ?",
            $params
        );
        
        // Aktiviteleri formatla ve zenginleştir
        $formattedActivities = [];
        foreach ($activities as $activity) {
            $formatted = formatActivity($activity);
            $formatted = enrichActivity($formatted, $activity);
            $formattedActivities[] = $formatted;
        }
        
        // Istatistikler
        $stats = getActivityStats($db, $filter);
        
        jsonResponse(true, [
            'activities' => $formattedActivities,
            'stats' => $stats,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'has_next' => count($formattedActivities) === $limit
            ]
        ]);
        
    } catch (Exception $e) {
        handleError('Aktivite akışı alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * İstatistik zaman çizelgesi
 */
function handleStatsTimeline() {
    try {
        $db = getDB();
        $period = $_GET['period'] ?? 'month'; // day, week, month, year
        $userId = $_GET['user_id'] ?? null;
        
        // Periode göre format ve interval
        $formatMap = [
            'day' => ['%Y-%m-%d', 'INTERVAL 30 DAY'],
            'week' => ['%Y-%u', 'INTERVAL 12 WEEK'],
            'month' => ['%Y-%m', 'INTERVAL 12 MONTH'],
            'year' => ['%Y', 'INTERVAL 5 YEAR']
        ];
        
        if (!isset($formatMap[$period])) {
            handleError('Geçersiz period parametresi');
        }
        
        [$dateFormat, $interval] = $formatMap[$period];
        
        // Kullanıcı filtresi
        $userClause = '';
        $params = [];
        
        if ($userId && $userId !== 'all') {
            $userClause = 'AND a.user_id = ?';
            $params[] = $userId;
        }
        
        // Aktivite trendleri
        $trends = $db->fetchAll(
            "SELECT 
                DATE_FORMAT(a.created_at, '$dateFormat') as period,
                a.type,
                COUNT(*) as count
            FROM activities a
            WHERE a.created_at >= DATE_SUB(CURRENT_DATE(), $interval)
                $userClause
            GROUP BY period, a.type
            ORDER BY period DESC, count DESC",
            $params
        );
        
        // En aktif günler/dönemler
        $mostActive = $db->fetchAll(
            "SELECT 
                DATE_FORMAT(a.created_at, '$dateFormat') as period,
                COUNT(*) as total_activities,
                COUNT(DISTINCT a.user_id) as active_users
            FROM activities a
            WHERE a.created_at >= DATE_SUB(CURRENT_DATE(), $interval)
                $userClause
            GROUP BY period
            ORDER BY total_activities DESC
            LIMIT 10",
            $params
        );
        
        jsonResponse(true, [
            'trends' => $trends,
            'most_active_periods' => $mostActive,
            'period' => $period
        ]);
        
    } catch (Exception $e) {
        handleError('İstatistik zaman çizelgesi alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * Aktiviteyi formatla
 */
function formatActivity($activity) {
    $data = json_decode($activity['data'], true) ?: [];
    
    return [
        'id' => (int)$activity['id'],
        'user' => [
            'id' => $activity['user_id'],
            'name' => $activity['user_name'],
            'avatar' => $activity['user_avatar'],
            'color' => $activity['user_color']
        ],
        'type' => $activity['type'],
        'title' => generateActivityTitle($activity),
        'description' => generateActivityDescription($activity, $data),
        'icon' => getActivityIcon($activity['type']),
        'color' => getActivityColor($activity['type']),
        'time_ago' => formatTimeAgo($activity['created_at']),
        'created_at' => $activity['created_at'],
        'movie' => $activity['movie_title'] ? [
            'title' => $activity['movie_title'],
            'poster' => $activity['movie_poster'],
            'tmdb_id' => $activity['movie_tmdb_id'] ?? null
        ] : null,
        'list' => $activity['list_name'] ? [
            'name' => $activity['list_name']
        ] : null,
        'data' => $data
    ];
}

/**
 * Aktiviteyi zenginleştir
 */
function enrichActivity($formatted, $original) {
    // Film bilgileri
    if ($formatted['movie']) {
        $formatted['movie']['release_date'] = $original['movie_release_date'] ?? null;
        $formatted['movie']['rating'] = $original['movie_rating'] ?? null;
        $formatted['movie']['genre'] = $original['movie_genre'] ?? null;
    }
    
    // Liste bilgileri
    if ($formatted['list']) {
        $formatted['list']['description'] = $original['list_description'] ?? null;
    }
    
    return $formatted;
}

/**
 * Aktivite başlığı oluştur
 */
function generateActivityTitle($activity) {
    $userName = $activity['user_name'];
    $movieTitle = $activity['movie_title'];
    $listName = $activity['list_name'];
    
    switch ($activity['type']) {
        case 'movie_added':
            return "$userName bir film ekledi";
        case 'movie_watched':
            return "$userName bir film izledi";
        case 'movie_rated':
            return "$userName bir film puanladı";
        case 'movie_reviewed':
            return "$userName bir film inceledi";
        case 'list_created':
            return "$userName yeni liste oluşturdu";
        case 'list_updated':
            return "$userName listesini güncelledi";
        case 'achievement_unlocked':
            return "$userName yeni başarım kazandı";
        default:
            return "$userName bir aktivite gerçekleştirdi";
    }
}

/**
 * Aktivite açıklaması oluştur
 */
function generateActivityDescription($activity, $data) {
    $movieTitle = $activity['movie_title'];
    $listName = $activity['list_name'];
    
    switch ($activity['type']) {
        case 'movie_added':
            return $movieTitle ? "\"$movieTitle\" filmini listesine ekledi" : 'Yeni bir film ekledi';
        case 'movie_watched':
            return $movieTitle ? "\"$movieTitle\" filmini izledi" : 'Bir film izledi';
        case 'movie_rated':
            $rating = $data['rating'] ?? null;
            $ratingText = $rating ? " ($rating/10)" : '';
            return $movieTitle ? "\"$movieTitle\" filmini puanladı$ratingText" : 'Bir film puanladı';
        case 'movie_reviewed':
            return $movieTitle ? "\"$movieTitle\" filmi için inceleme yazdı" : 'Bir film inceledi';
        case 'list_created':
            return $listName ? "\"$listName\" listesini oluşturdu" : 'Yeni liste oluşturdu';
        case 'list_updated':
            return $listName ? "\"$listName\" listesini güncelledi" : 'Listesini güncelledi';
        case 'achievement_unlocked':
            $achievementName = $data['achievement_name'] ?? 'Yeni başarım';
            return "\"$achievementName\" başarımını kazandı";
        default:
            return 'Bir aktivite gerçekleştirdi';
    }
}

/**
 * Aktivite ikonu
 */
function getActivityIcon($type) {
    $icons = [
        'movie_added' => 'fas fa-plus',
        'movie_watched' => 'fas fa-eye',
        'movie_rated' => 'fas fa-star',
        'movie_reviewed' => 'fas fa-comment',
        'list_created' => 'fas fa-list',
        'list_updated' => 'fas fa-edit',
        'achievement_unlocked' => 'fas fa-trophy'
    ];
    
    return $icons[$type] ?? 'fas fa-film';
}

/**
 * Aktivite rengi
 */
function getActivityColor($type) {
    $colors = [
        'movie_added' => '#10b981',
        'movie_watched' => '#3b82f6',
        'movie_rated' => '#f59e0b',
        'movie_reviewed' => '#8b5cf6',
        'list_created' => '#ef4444',
        'list_updated' => '#6b7280',
        'achievement_unlocked' => '#f59e0b'
    ];
    
    return $colors[$type] ?? '#6b7280';
}

/**
 * Zaman farkını formatla
 */
function formatTimeAgo($dateString) {
    $date = new DateTime($dateString);
    $now = new DateTime();
    $diff = $now->diff($date);
    
    if ($diff->days > 7) {
        return $date->format('d M Y');
    } elseif ($diff->days > 0) {
        return $diff->days . ' gün önce';
    } elseif ($diff->h > 0) {
        return $diff->h . ' saat önce';
    } elseif ($diff->i > 0) {
        return $diff->i . ' dakika önce';
    } else {
        return 'Az önce';
    }
}

/**
 * Tarihi formatla
 */
function formatDate($dateString) {
    $date = new DateTime($dateString);
    $now = new DateTime();
    $diff = $now->diff($date);
    
    if ($diff->days === 0) {
        return 'Bugün';
    } elseif ($diff->days === 1) {
        return 'Dün';
    } elseif ($diff->days < 7) {
        return $diff->days . ' gün önce';
    } else {
        return $date->format('d F Y');
    }
}

/**
 * Aktivite istatistikleri
 */
function getActivityStats($db, $filter = 'all') {
    $whereClause = '';
    $params = [];
    
    switch ($filter) {
        case 'movies':
            $whereClause = 'WHERE type IN (?, ?, ?, ?)';
            $params = ['movie_added', 'movie_watched', 'movie_rated', 'movie_reviewed'];
            break;
        case 'lists':
            $whereClause = 'WHERE type IN (?, ?)';
            $params = ['list_created', 'list_updated'];
            break;
        case 'achievements':
            $whereClause = 'WHERE type = ?';
            $params = ['achievement_unlocked'];
            break;
    }
    
    // Bugünkü aktiviteler
    $todayCount = $db->fetchOne(
        "SELECT COUNT(*) as count FROM activities 
         $whereClause AND DATE(created_at) = CURRENT_DATE()",
        $params
    )['count'];
    
    // Bu haftaki aktiviteler
    $weekCount = $db->fetchOne(
        "SELECT COUNT(*) as count FROM activities 
         $whereClause AND created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)",
        $params
    )['count'];
    
    // En aktif kullanıcı
    $mostActiveUser = $db->fetchOne(
        "SELECT u.name, COUNT(*) as activity_count
         FROM activities a
         JOIN users u ON a.user_id = u.id
         $whereClause AND a.created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
         GROUP BY a.user_id, u.name
         ORDER BY activity_count DESC
         LIMIT 1",
        $params
    );
    
    return [
        'today_count' => (int)$todayCount,
        'week_count' => (int)$weekCount,
        'most_active_user' => $mostActiveUser
    ];
}

?>