<?php
// Veritabanı Konfigürasyonu
class Database {
    private static $instance = null;
    private $connection;

    // cPanel/PHPMyAdmin için standart ayarlar
    private $host = 'localhost';
    private $database = 'film_evi_db';
    private $username = 'root'; // cPanel'de kullanıcı adını güncelleyin
    private $password = '';     // cPanel'de şifreyi güncelleyin
    private $charset = 'utf8mb4';

    private function __construct() {
        try {
            $dsn = "mysql:host={$this->host};dbname={$this->database};charset={$this->charset}";
            $this->connection = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
            ]);
        } catch (PDOException $e) {
            error_log("Database connection failed: " . $e->getMessage());
            die("Veritabanı bağlantısı başarısız. Lütfen konfigürasyonu kontrol edin.");
        }
    }

    public static function getInstance() {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->connection;
    }

    public function query($sql, $params = []) {
        try {
            $stmt = $this->connection->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query failed: " . $e->getMessage());
            throw $e;
        }
    }

    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll();
    }

    public function fetchOne($sql, $params = []) {
        return $this->query($sql, $params)->fetch();
    }

    public function lastInsertId() {
        return $this->connection->lastInsertId();
    }

    public function beginTransaction() {
        return $this->connection->beginTransaction();
    }

    public function commit() {
        return $this->connection->commit();
    }

    public function rollback() {
        return $this->connection->rollback();
    }
}

// Global database instance
function getDB() {
    return Database::getInstance();
}

// TMDB API Konfigürasyonu
define('TMDB_API_KEY', 'your_tmdb_api_key_here'); // https://www.themoviedb.org/settings/api adresinden API key alın
define('TMDB_BASE_URL', 'https://api.themoviedb.org/3');
define('TMDB_IMAGE_BASE_URL', 'https://image.tmdb.org/t/p');

// Uygulama ayarları
define('APP_NAME', 'Film Evi');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost'); // cPanel'de domain adresinizi güncelleyin

// Güvenlik ayarları
define('SESSION_LIFETIME', 3600 * 24 * 30); // 30 gün
define('CSRF_TOKEN_LIFETIME', 3600); // 1 saat

// Kullanıcı ayarları
define('USERS', [
    'irem' => [
        'name' => 'İrem',
        'color' => '#e91e63',
        'avatar' => '💖',
        'preferences' => ['drama', 'romance', 'comedy']
    ],
    'yusuf' => [
        'name' => 'Yusuf', 
        'color' => '#2196f3',
        'avatar' => '⭐',
        'preferences' => ['action', 'thriller', 'sci-fi']
    ]
]);

// Hata raporlama (production'da kapatın)
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Timezone ayarı
date_default_timezone_set('Europe/Istanbul');
?>