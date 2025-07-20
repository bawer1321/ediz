<?php
session_start();
require_once 'config/database.php';

// Kullanıcı seçimi kontrolü
$current_user = $_SESSION['current_user'] ?? null;
?>
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎬 Film Evi - İrem & Yusuf</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <!-- Hero Section -->
    <div class="hero-section">
        <div class="hero-gradient"></div>
        <div class="hero-content">
            <div class="container">
                <div class="hero-text">
                    <h1 class="hero-title">
                        <span class="gradient-text">🎬 Film Evi</span>
                        <span class="subtitle">İrem & Yusuf'un Sinema Dünyası</span>
                    </h1>
                    <p class="hero-description">
                        Netflix kalitesinde modern film takip deneyimi. Birlikte keşfedin, puanlayın ve anılarınızı ölümsüzleştirin.
                    </p>
                </div>

                <!-- Kullanıcı Seçimi -->
                <div class="user-selection">
                    <h2 class="section-title">Kimsin Sen? 👤</h2>
                    <div class="user-cards">
                        <div class="user-card" data-user="irem">
                            <div class="user-avatar">
                                <i class="fas fa-heart"></i>
                            </div>
                            <h3>İrem</h3>
                            <p>Drama & Romance Kraliçesi</p>
                            <div class="user-stats">
                                <span id="irem-stats">Loading...</span>
                            </div>
                        </div>

                        <div class="user-card" data-user="yusuf">
                            <div class="user-avatar">
                                <i class="fas fa-star"></i>
                            </div>
                            <h3>Yusuf</h3>
                            <p>Action & Thriller Ustası</p>
                            <div class="user-stats">
                                <span id="yusuf-stats">Loading...</span>
                            </div>
                        </div>

                        <div class="user-card user-card-couple" data-user="couple">
                            <div class="user-avatar">
                                <i class="fas fa-users"></i>
                            </div>
                            <h3>Birlikte</h3>
                            <p>Çift Modunda İzleyin</p>
                            <div class="compatibility-score">
                                <span id="compatibility-score">Loading...</span>
                                <small>Uyumluluk Skoru</small>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="quick-actions">
                    <a href="discover.php" class="action-btn primary">
                        <i class="fas fa-search"></i>
                        Film Keşfet
                    </a>
                    <a href="dashboard.php" class="action-btn secondary">
                        <i class="fas fa-chart-bar"></i>
                        İstatistikler
                    </a>
                    <a href="lists.php" class="action-btn secondary">
                        <i class="fas fa-list"></i>
                        Listelerim
                    </a>
                </div>
            </div>
        </div>
    </div>

    <!-- Features Section -->
    <section class="features-section">
        <div class="container">
            <h2 class="section-title">🌟 Özellikler</h2>
            <div class="features-grid">
                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-heart"></i>
                    </div>
                    <h3>Çift Uyumluluğu</h3>
                    <p>Puanlama benzerliğinizi analiz edin, en uyumlu olduğunuz türleri keşfedin.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h3>AI Önerileri</h3>
                    <p>İzleme geçmişinize dayalı akıllı film önerileri alın.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <h3>Detaylı İstatistikler</h3>
                    <p>İzleme alışkanlıklarınızı analiz edin, kişisel trendlerinizi keşfedin.</p>
                </div>

                <div class="feature-card">
                    <div class="feature-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>500K+ Film</h3>
                    <p>TMDB veritabanından milyonlarca film ve kapsamlı detaylar.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Recent Activity -->
    <section class="activity-section">
        <div class="container">
            <h2 class="section-title">📈 Son Aktiviteler</h2>
            <div id="recent-activity" class="activity-grid">
                <!-- Dinamik içerik yüklenecek -->
            </div>
        </div>
    </section>

    <!-- Navigation Menu -->
    <nav class="main-nav">
        <div class="nav-container">
            <div class="nav-brand">
                <span class="brand-icon">🎬</span>
                <span class="brand-text">Film Evi</span>
            </div>
            <div class="nav-links">
                <a href="index.php" class="nav-link active">
                    <i class="fas fa-home"></i>
                    <span>Ana Sayfa</span>
                </a>
                <a href="discover.php" class="nav-link">
                    <i class="fas fa-search"></i>
                    <span>Keşfet</span>
                </a>
                <a href="lists.php" class="nav-link">
                    <i class="fas fa-list"></i>
                    <span>Listeler</span>
                </a>
                <a href="dashboard.php" class="nav-link">
                    <i class="fas fa-chart-bar"></i>
                    <span>İstatistikler</span>
                </a>
                <a href="profile.php" class="nav-link">
                    <i class="fas fa-user"></i>
                    <span>Profil</span>
                </a>
            </div>
            <div class="nav-user">
                <div class="current-user" id="current-user-display">
                    <?php if ($current_user): ?>
                        <span class="user-name"><?= ucfirst($current_user) ?></span>
                        <div class="user-indicator"></div>
                    <?php else: ?>
                        <span class="user-name">Kullanıcı Seç</span>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </nav>

    <script src="assets/js/app.js"></script>
    <script>
        // Kullanıcı seçimi işlemi
        document.addEventListener('DOMContentLoaded', function() {
            const userCards = document.querySelectorAll('.user-card');
            
            userCards.forEach(card => {
                card.addEventListener('click', function() {
                    const userId = this.dataset.user;
                    selectUser(userId);
                });
            });

            // İstatistikleri yükle
            loadUserStats();
            loadRecentActivity();
        });

        function selectUser(userId) {
            fetch('api/auth.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'select_user', user_id: userId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = 'dashboard.php';
                }
            });
        }

        function loadUserStats() {
            fetch('api/stats.php?action=user_stats')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('irem-stats').textContent = 
                            `${data.stats.irem.total_movies} film izlendi`;
                        document.getElementById('yusuf-stats').textContent = 
                            `${data.stats.yusuf.total_movies} film izlendi`;
                        document.getElementById('compatibility-score').textContent = 
                            `%${data.stats.compatibility_score}`;
                    }
                });
        }

        function loadRecentActivity() {
            fetch('api/activity.php?action=recent')
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        const activityContainer = document.getElementById('recent-activity');
                        activityContainer.innerHTML = data.activities.map(activity => `
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="${activity.icon}"></i>
                                </div>
                                <div class="activity-content">
                                    <h4>${activity.title}</h4>
                                    <p>${activity.description}</p>
                                    <small>${activity.time_ago}</small>
                                </div>
                            </div>
                        `).join('');
                    }
                });
        }
    </script>
</body>
</html>