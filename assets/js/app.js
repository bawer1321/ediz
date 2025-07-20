/**
 * Film Evi - Ana JavaScript Uygulaması
 * Netflix tarzı modern web uygulaması
 * İrem & Yusuf için özel tasarlanmış
 */

class FilmEvi {
    constructor() {
        this.currentUser = null;
        this.apiBaseUrl = window.location.origin;
        this.isLoading = false;
        
        this.init();
    }

    /**
     * Uygulamayı başlat
     */
    init() {
        this.bindEvents();
        this.loadCurrentUser();
        this.initializeComponents();
        this.setupServiceWorker();
    }

    /**
     * Event listener'ları bağla
     */
    bindEvents() {
        // Kullanıcı kartları
        document.querySelectorAll('.user-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectUser(e));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.selectUser(e);
                }
            });
        });

        // Navigasyon linkleri
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Scroll olayları
        window.addEventListener('scroll', this.debounce(this.handleScroll.bind(this), 10));

        // Resize olayları
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 100));

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Page visibility API
        document.addEventListener('visibilitychange', () => this.handleVisibilityChange());

        // Online/offline status
        window.addEventListener('online', () => this.handleConnectionChange(true));
        window.addEventListener('offline', () => this.handleConnectionChange(false));
    }

    /**
     * Kullanıcı seçimi
     */
    async selectUser(event) {
        const card = event.currentTarget;
        const userId = card.dataset.user;
        
        if (!userId) return;

        // Loading state
        this.setCardLoading(card, true);
        
        try {
            const response = await this.apiCall('api/auth.php', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'select_user',
                    user_id: userId
                })
            });

            if (response.success) {
                this.currentUser = userId;
                this.updateUserDisplay(userId);
                
                // Animate card selection
                this.animateCardSelection(card);
                
                // Redirect after animation
                setTimeout(() => {
                    if (userId === 'couple') {
                        window.location.href = 'compatibility.php';
                    } else {
                        window.location.href = 'dashboard.php';
                    }
                }, 800);
            } else {
                this.showNotification('Kullanıcı seçimi başarısız!', 'error');
            }
        } catch (error) {
            console.error('User selection error:', error);
            this.showNotification('Bağlantı hatası!', 'error');
        } finally {
            this.setCardLoading(card, false);
        }
    }

    /**
     * Kart loading durumu
     */
    setCardLoading(card, loading) {
        if (loading) {
            card.classList.add('loading');
            card.style.pointerEvents = 'none';
        } else {
            card.classList.remove('loading');
            card.style.pointerEvents = 'auto';
        }
    }

    /**
     * Kart seçim animasyonu
     */
    animateCardSelection(card) {
        // Pulse effect
        card.style.transform = 'scale(1.05)';
        card.style.boxShadow = '0 20px 60px rgba(229, 9, 20, 0.6)';
        
        setTimeout(() => {
            card.style.transform = '';
            card.style.boxShadow = '';
        }, 300);

        // Ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.6);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (rect.width / 2 - size / 2) + 'px';
        ripple.style.top = (rect.height / 2 - size / 2) + 'px';
        
        card.style.position = 'relative';
        card.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    /**
     * Mevcut kullanıcıyı yükle
     */
    async loadCurrentUser() {
        try {
            const response = await this.apiCall('api/auth.php?action=get_current_user');
            if (response.success && response.user) {
                this.currentUser = response.user;
                this.updateUserDisplay(response.user);
            }
        } catch (error) {
            console.error('Load current user error:', error);
        }
    }

    /**
     * Kullanıcı görünümünü güncelle
     */
    updateUserDisplay(userId) {
        const userDisplay = document.getElementById('current-user-display');
        if (userDisplay && userId) {
            const userConfig = {
                'irem': { name: 'İrem', color: '#e91e63', avatar: '💖' },
                'yusuf': { name: 'Yusuf', color: '#2196f3', avatar: '⭐' },
                'couple': { name: 'Çift Modu', color: '#e50914', avatar: '👫' }
            };

            const config = userConfig[userId];
            if (config) {
                userDisplay.innerHTML = `
                    <span class="user-name">${config.name}</span>
                    <div class="user-indicator" style="background: ${config.color}"></div>
                `;
                userDisplay.style.borderColor = config.color;
            }
        }
    }

    /**
     * İstatistikleri yükle
     */
    async loadStats() {
        try {
            const response = await this.apiCall('api/stats.php?action=user_stats');
            if (response.success) {
                this.updateStatsDisplay(response.stats);
            }
        } catch (error) {
            console.error('Load stats error:', error);
        }
    }

    /**
     * İstatistik görünümünü güncelle
     */
    updateStatsDisplay(stats) {
        // İrem istatistikleri
        const iremStats = document.getElementById('irem-stats');
        if (iremStats && stats.irem) {
            iremStats.textContent = `${stats.irem.total_movies || 0} film izlendi`;
        }

        // Yusuf istatistikleri
        const yusufStats = document.getElementById('yusuf-stats');
        if (yusufStats && stats.yusuf) {
            yusufStats.textContent = `${stats.yusuf.total_movies || 0} film izlendi`;
        }

        // Uyumluluk skoru
        const compatibilityScore = document.getElementById('compatibility-score');
        if (compatibilityScore && stats.compatibility_score !== undefined) {
            compatibilityScore.textContent = `%${Math.round(stats.compatibility_score)}`;
        }
    }

    /**
     * Son aktiviteleri yükle
     */
    async loadRecentActivity() {
        try {
            const response = await this.apiCall('api/activity.php?action=recent');
            if (response.success) {
                this.updateActivityDisplay(response.activities);
            }
        } catch (error) {
            console.error('Load activity error:', error);
        }
    }

    /**
     * Aktivite görünümünü güncelle
     */
    updateActivityDisplay(activities) {
        const activityContainer = document.getElementById('recent-activity');
        if (!activityContainer) return;

        if (!activities || activities.length === 0) {
            activityContainer.innerHTML = `
                <div class="empty-state">
                    <p>Henüz aktivite yok. İlk filminizi ekleyerek başlayın! 🎬</p>
                </div>
            `;
            return;
        }

        const activitiesHTML = activities.map(activity => `
            <div class="activity-item" data-aos="fade-up">
                <div class="activity-icon">
                    <i class="${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <h4>${activity.title}</h4>
                    <p>${activity.description}</p>
                    <small>${this.formatTimeAgo(activity.created_at)}</small>
                </div>
            </div>
        `).join('');

        activityContainer.innerHTML = activitiesHTML;
        
        // Animate in
        this.observeElements('.activity-item');
    }

    /**
     * Aktivite ikonu al
     */
    getActivityIcon(type) {
        const icons = {
            'movie_added': 'fas fa-plus',
            'movie_watched': 'fas fa-eye',
            'movie_rated': 'fas fa-star',
            'movie_reviewed': 'fas fa-comment',
            'list_created': 'fas fa-list',
            'list_updated': 'fas fa-edit'
        };
        return icons[type] || 'fas fa-film';
    }

    /**
     * Zaman farkını formatla
     */
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Az önce';
        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        
        return date.toLocaleDateString('tr-TR');
    }

    /**
     * Navigasyon işlemi
     */
    handleNavigation(event) {
        const link = event.currentTarget;
        const href = link.getAttribute('href');
        
        // External links
        if (href.startsWith('http')) {
            return;
        }
        
        // Update active state
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Smooth page transition
        this.pageTransition(href);
    }

    /**
     * Sayfa geçiş animasyonu
     */
    pageTransition(href) {
        document.body.style.transition = 'opacity 0.3s ease-out';
        document.body.style.opacity = '0.7';
        
        setTimeout(() => {
            window.location.href = href;
        }, 150);
    }

    /**
     * Scroll işlemi
     */
    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Navigation background opacity
        const nav = document.querySelector('.main-nav');
        if (nav) {
            const opacity = Math.min(scrollTop / 100, 1);
            nav.style.backgroundColor = `rgba(0, 0, 0, ${0.8 + opacity * 0.2})`;
        }

        // Parallax effect for hero
        const hero = document.querySelector('.hero-section');
        if (hero && scrollTop < window.innerHeight) {
            hero.style.transform = `translateY(${scrollTop * 0.5}px)`;
        }
    }

    /**
     * Resize işlemi
     */
    handleResize() {
        // Responsive navigation adjustments
        const isMobile = window.innerWidth < 768;
        
        document.querySelectorAll('.nav-link span').forEach(span => {
            span.style.display = isMobile ? 'none' : 'block';
        });
    }

    /**
     * Klavye kısayolları
     */
    handleKeyboard(event) {
        // Ctrl/Cmd + K for search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.openSearch();
        }
        
        // Number keys for user selection
        if (!event.ctrlKey && !event.metaKey && !event.altKey) {
            const num = parseInt(event.key);
            if (num >= 1 && num <= 3) {
                const userCards = document.querySelectorAll('.user-card');
                if (userCards[num - 1]) {
                    userCards[num - 1].click();
                }
            }
        }
        
        // Escape key
        if (event.key === 'Escape') {
            this.closeModals();
        }
    }

    /**
     * Arama aç
     */
    openSearch() {
        // Bu fonksiyon discover.php'de implement edilecek
        if (window.location.pathname.includes('discover')) {
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.focus();
            }
        } else {
            window.location.href = 'discover.php';
        }
    }

    /**
     * Modal'ları kapat
     */
    closeModals() {
        document.querySelectorAll('.modal, .overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    /**
     * Sayfa görünürlük değişimi
     */
    handleVisibilityChange() {
        if (document.visibilityState === 'visible') {
            // Sayfa tekrar görünür olduğunda verileri yenile
            this.refreshData();
        }
    }

    /**
     * Bağlantı durumu değişimi
     */
    handleConnectionChange(isOnline) {
        const message = isOnline ? 
            'Bağlantı yeniden kuruldu! 🌐' : 
            'Bağlantı kesildi. Offline modda çalışıyorsunuz. 📶';
        
        this.showNotification(message, isOnline ? 'success' : 'warning');
        
        if (isOnline) {
            this.refreshData();
        }
    }

    /**
     * Verileri yenile
     */
    async refreshData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        
        try {
            await Promise.all([
                this.loadStats(),
                this.loadRecentActivity()
            ]);
        } catch (error) {
            console.error('Refresh data error:', error);
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * API çağrısı
     */
    async apiCall(url, options = {}) {
        const defaultOptions = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        };

        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/${url}`, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    /**
     * Bildirim göster
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease-out;
            max-width: 400px;
            min-width: 250px;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        if (duration > 0) {
            setTimeout(() => {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }, duration);
        }
    }

    /**
     * Bildirim rengi al
     */
    getNotificationColor(type) {
        const colors = {
            'success': '#10b981',
            'error': '#ef4444',
            'warning': '#f59e0b',
            'info': '#3b82f6'
        };
        return colors[type] || colors.info;
    }

    /**
     * Element observer (intersection)
     */
    observeElements(selector) {
        const elements = document.querySelectorAll(selector);
        
        if (!elements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            element.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
            observer.observe(element);
        });
    }

    /**
     * Debounce utility
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle utility
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Komponenleri başlat
     */
    initializeComponents() {
        // Lazy loading for images
        this.setupLazyLoading();
        
        // Intersection observer for animations
        this.observeElements('.feature-card, .activity-item');
        
        // Initialize tooltips
        this.setupTooltips();
        
        // Setup keyboard navigation
        this.setupKeyboardNavigation();
    }

    /**
     * Lazy loading
     */
    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * Tooltip'ları kur
     */
    setupTooltips() {
        const elements = document.querySelectorAll('[data-tooltip]');
        
        elements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                this.showTooltip(e.target, e.target.dataset.tooltip);
            });
            
            element.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        });
    }

    /**
     * Tooltip göster
     */
    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 0.5rem 0.75rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            pointer-events: none;
            z-index: 10000;
            opacity: 0;
            transform: translateY(-5px);
            transition: opacity 0.2s ease-out, transform 0.2s ease-out;
        `;

        document.body.appendChild(tooltip);

        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';

        setTimeout(() => {
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translateY(0)';
        }, 10);

        this.currentTooltip = tooltip;
    }

    /**
     * Tooltip gizle
     */
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.style.opacity = '0';
            setTimeout(() => {
                if (this.currentTooltip) {
                    this.currentTooltip.remove();
                    this.currentTooltip = null;
                }
            }, 200);
        }
    }

    /**
     * Klavye navigasyonu
     */
    setupKeyboardNavigation() {
        const focusableElements = document.querySelectorAll(`
            .user-card, .action-btn, .nav-link, 
            input, button, select, textarea, 
            [tabindex]:not([tabindex="-1"])
        `);

        focusableElements.forEach((element, index) => {
            element.setAttribute('tabindex', element.tabIndex === -1 ? -1 : 0);
        });
    }

    /**
     * Service Worker kurulumu
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }
}

/**
 * CSS animations ekle
 */
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    .notification {
        font-family: var(--font-primary);
        font-weight: 500;
    }

    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: background-color 0.2s;
    }

    .notification-close:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }

    .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--netflix-text-gray);
    }

    .loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 24px;
        height: 24px;
        margin: -12px 0 0 -12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top: 2px solid var(--netflix-red);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);

/**
 * Uygulamayı başlat
 */
document.addEventListener('DOMContentLoaded', () => {
    window.filmEvi = new FilmEvi();
});

/**
 * Global utility fonksiyonlar
 */
window.FilmEviUtils = {
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('tr-TR');
    },
    
    formatRating: (rating) => {
        return parseFloat(rating).toFixed(1);
    },
    
    generateGradient: (color1, color2) => {
        return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
    },
    
    getGenreColor: (genre) => {
        const colors = {
            'Action': '#ff6b6b',
            'Drama': '#4ecdc4',
            'Comedy': '#45b7d1',
            'Romance': '#f093fb',
            'Thriller': '#6c5ce7',
            'Horror': '#fd79a8',
            'Sci-Fi': '#00cec9',
            'Fantasy': '#a29bfe'
        };
        return colors[genre] || '#74b9ff';
    }
};