<?php
/**
 * Film Evi - Authentication API
 * Kullanıcı kimlik doğrulama ve oturum yönetimi
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Preflight requests için
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
    error_log("Auth API Error: " . $message);
    jsonResponse(false, null, $message, $statusCode);
}

try {
    $method = $_SERVER['REQUEST_METHOD'];
    $action = $_GET['action'] ?? null;
    
    // POST istekleri için action'ı body'den al
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? $action;
    }

    switch ($action) {
        case 'select_user':
            handleSelectUser();
            break;
            
        case 'get_current_user':
            handleGetCurrentUser();
            break;
            
        case 'logout':
            handleLogout();
            break;
            
        case 'check_session':
            handleCheckSession();
            break;
            
        default:
            handleError('Geçersiz action parametresi', 400);
    }

} catch (Exception $e) {
    handleError('Sunucu hatası: ' . $e->getMessage(), 500);
}

/**
 * Kullanıcı seçimi
 */
function handleSelectUser() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        handleError('POST metodu gerekli', 405);
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    $userId = $input['user_id'] ?? null;
    
    if (!$userId) {
        handleError('Kullanıcı ID gerekli');
    }
    
    // Geçerli kullanıcı kontrolü
    $validUsers = ['irem', 'yusuf', 'couple'];
    if (!in_array($userId, $validUsers)) {
        handleError('Geçersiz kullanıcı ID');
    }
    
    try {
        $db = getDB();
        
        // Kullanıcı varsa veritabanından bilgileri al
        if ($userId !== 'couple') {
            $user = $db->fetchOne(
                "SELECT * FROM users WHERE id = ?", 
                [$userId]
            );
            
            if (!$user) {
                handleError('Kullanıcı bulunamadı');
            }
        }
        
        // Session'a kaydet
        $_SESSION['current_user'] = $userId;
        $_SESSION['login_time'] = time();
        $_SESSION['last_activity'] = time();
        
        // Son giriş zamanını güncelle (couple hariç)
        if ($userId !== 'couple') {
            $db->query(
                "UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
                [$userId]
            );
        }
        
        // Aktivite kaydı ekle
        logActivity($userId, 'user_login', null, null, [
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
        
        jsonResponse(true, [
            'user_id' => $userId,
            'redirect_url' => $userId === 'couple' ? 'compatibility.php' : 'dashboard.php'
        ], 'Kullanıcı başarıyla seçildi');
        
    } catch (Exception $e) {
        handleError('Veritabanı hatası: ' . $e->getMessage(), 500);
    }
}

/**
 * Mevcut kullanıcıyı getir
 */
function handleGetCurrentUser() {
    $currentUser = $_SESSION['current_user'] ?? null;
    
    if (!$currentUser) {
        jsonResponse(true, ['user' => null], 'Oturum açık değil');
    }
    
    try {
        $db = getDB();
        $userData = null;
        
        if ($currentUser !== 'couple') {
            $userData = $db->fetchOne(
                "SELECT id, name, avatar, color, preferences, settings FROM users WHERE id = ?",
                [$currentUser]
            );
            
            if ($userData) {
                $userData['preferences'] = json_decode($userData['preferences'], true);
                $userData['settings'] = json_decode($userData['settings'], true);
            }
        } else {
            $userData = [
                'id' => 'couple',
                'name' => 'Çift Modu',
                'avatar' => '👫',
                'color' => '#e50914'
            ];
        }
        
        // Son aktivite zamanını güncelle
        $_SESSION['last_activity'] = time();
        
        jsonResponse(true, [
            'user' => $currentUser,
            'user_data' => $userData,
            'session_info' => [
                'login_time' => $_SESSION['login_time'] ?? null,
                'last_activity' => $_SESSION['last_activity'] ?? null
            ]
        ]);
        
    } catch (Exception $e) {
        handleError('Kullanıcı bilgileri alınamadı: ' . $e->getMessage(), 500);
    }
}

/**
 * Çıkış yap
 */
function handleLogout() {
    $currentUser = $_SESSION['current_user'] ?? null;
    
    if ($currentUser) {
        // Aktivite kaydı ekle
        logActivity($currentUser, 'user_logout', null, null, [
            'session_duration' => time() - ($_SESSION['login_time'] ?? time())
        ]);
    }
    
    // Session'ı temizle
    session_unset();
    session_destroy();
    
    jsonResponse(true, null, 'Başarıyla çıkış yapıldı');
}

/**
 * Session kontrolü
 */
function handleCheckSession() {
    $currentUser = $_SESSION['current_user'] ?? null;
    $lastActivity = $_SESSION['last_activity'] ?? 0;
    $sessionTimeout = 3600 * 24; // 24 saat
    
    $isValid = $currentUser && (time() - $lastActivity) < $sessionTimeout;
    
    if ($isValid) {
        $_SESSION['last_activity'] = time();
    } else {
        session_unset();
        session_destroy();
    }
    
    jsonResponse(true, [
        'is_valid' => $isValid,
        'user' => $isValid ? $currentUser : null,
        'remaining_time' => $isValid ? $sessionTimeout - (time() - $lastActivity) : 0
    ]);
}

/**
 * Aktivite kaydı ekleme yardımcı fonksiyonu
 */
function logActivity($userId, $type, $movieId = null, $listId = null, $data = []) {
    try {
        $db = getDB();
        
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
        
        return true;
    } catch (Exception $e) {
        error_log("Activity log error: " . $e->getMessage());
        return false;
    }
}

/**
 * Rate limiting kontrolü
 */
function checkRateLimit($action, $limit = 10, $window = 60) {
    $key = 'rate_limit_' . $action . '_' . ($_SERVER['REMOTE_ADDR'] ?? 'unknown');
    
    if (!isset($_SESSION[$key])) {
        $_SESSION[$key] = [];
    }
    
    $now = time();
    $requests = $_SESSION[$key];
    
    // Eski istekleri temizle
    $requests = array_filter($requests, function($timestamp) use ($now, $window) {
        return ($now - $timestamp) < $window;
    });
    
    if (count($requests) >= $limit) {
        handleError('Çok fazla istek. Lütfen bekleyin.', 429);
    }
    
    $requests[] = $now;
    $_SESSION[$key] = $requests;
}

/**
 * CSRF token doğrulama
 */
function validateCSRFToken($token) {
    if (!isset($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        handleError('Geçersiz güvenlik token', 403);
    }
}

/**
 * IP whitelist kontrolü (opsiyonel)
 */
function checkIPWhitelist() {
    $allowedIPs = [
        '127.0.0.1',
        '::1',
        // Diğer güvenilir IP'ler eklenebilir
    ];
    
    $clientIP = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    
    // Geliştirme ortamında devre dışı bırak
    if (defined('DEVELOPMENT_MODE') && DEVELOPMENT_MODE) {
        return true;
    }
    
    if (!in_array($clientIP, $allowedIPs)) {
        handleError('Erişim reddedildi', 403);
    }
}

/**
 * Session güvenlik ayarları
 */
function setupSecureSession() {
    // Güvenli session ayarları
    ini_set('session.cookie_httponly', 1);
    ini_set('session.cookie_secure', isset($_SERVER['HTTPS']));
    ini_set('session.use_strict_mode', 1);
    ini_set('session.cookie_samesite', 'Strict');
    
    // Session ID yenileme
    if (!isset($_SESSION['initiated'])) {
        session_regenerate_id(true);
        $_SESSION['initiated'] = true;
    }
    
    // Session hijacking koruması
    if (isset($_SESSION['user_ip']) && $_SESSION['user_ip'] !== $_SERVER['REMOTE_ADDR']) {
        session_unset();
        session_destroy();
        handleError('Güvenlik ihlali tespit edildi', 403);
    }
    
    $_SESSION['user_ip'] = $_SERVER['REMOTE_ADDR'];
}

// Session güvenliğini kur
setupSecureSession();

?>