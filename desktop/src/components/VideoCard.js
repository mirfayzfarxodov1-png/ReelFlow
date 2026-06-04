/**
 * VideoCard komponenti - Desktop ilova uchun
 * Muallif: ReelFlow Team
 * Versiya: 1.0.0
 */

// ============ YORDAMCHI FUNKSIYALAR ============

/**
 * Raqamlarni formatlash (K, M)
 * @param {number} num - Formatlanadigan raqam
 * @returns {string} Formatlangan raqam
 */
const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

/**
 * Vaqtni formatlash (MM:SS)
 * @param {number} seconds - Sekundlarda vaqt
 * @returns {string} Formatlangan vaqt
 */
const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

/**
 * Sanani formatlash
 * @param {string} date - ISO date string
 * @returns {string} Formatlangan sana
 */
const formatDate = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Bugun';
    if (days === 1) return 'Kecha';
    if (days < 7) return `${days} kun oldin`;
    if (days < 30) return `${Math.floor(days / 7)} hafta oldin`;
    if (days < 365) return `${Math.floor(days / 30)} oy oldin`;
    return `${Math.floor(days / 365)} yil oldin`;
};

/**
 * Sarlavhani qisqartirish
 * @param {string} title - Asl sarlavha
 * @param {number} maxLength - Maksimal uzunlik
 * @returns {string} Qisqartirilgan sarlavha
 */
const truncateTitle = (title, maxLength = 60) => {
    if (!title) return 'Video nomi mavjud emas';
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
};

/**
 * Username ni formatlash
 * @param {string} username - Asl username
 * @returns {string} Formatlangan username
 */
const formatUsername = (username) => {
    if (!username) return 'anonymous';
    if (username.length > 20) return username.substring(0, 18) + '..';
    return username;
};

/**
 * Progress bar rangini aniqlash (agar kerak bo'lsa)
 * @param {number} views - Ko'rishlar soni
 * @returns {string} Rang kodi
 */
const getProgressColor = (views) => {
    if (views > 1000000) return '#ff3040';
    if (views > 500000) return '#ff6b4a';
    if (views > 100000) return '#ff9800';
    if (views > 50000) return '#00c853';
    return '#0095f6';
};

/**
 * Trending darajasini aniqlash
 * @param {number} views - Ko'rishlar soni
 * @param {number} likes - Layklar soni
 * @returns {string} Trending belgisi
 */
const getTrendingBadge = (views, likes) => {
    const engagement = (likes / (views || 1)) * 100;
    if (engagement > 10) return '🔥 Trending';
    if (engagement > 5) return '📈 Populyar';
    if (views > 100000) return '⭐ Viral';
    return '';
};

/**
 * Video sifatini aniqlash
 * @param {string} videoUrl - Video URL
 * @returns {string} Sifat belgisi
 */
const getQualityBadge = (videoUrl) => {
    if (!videoUrl) return '';
    if (videoUrl.includes('1080')) return 'HD';
    if (videoUrl.includes('720')) return 'HD';
    if (videoUrl.includes('4k')) return '4K';
    return 'SD';
};

/**
 * Rasm yuklanmagan holat uchun placeholder
 * @returns {string} Placeholder SVG
 */
const getImagePlaceholder = () => {
    return `
        <svg width="100%" height="100%" viewBox="0 0 300 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="300" height="500" fill="#1a1a1a"/>
            <path d="M150 200 L150 300 M100 250 L200 250" stroke="#333" stroke-width="4"/>
            <circle cx="150" cy="180" r="30" fill="#333"/>
            <text x="150" y="400" text-anchor="middle" fill="#666" font-size="14">Video</text>
        </svg>
    `;
};

/**
 * Like icon HTML
 * @param {boolean} isLiked - Like bosilganmi
 * @returns {string} Like icon HTML
 */
const getLikeIcon = (isLiked) => {
    return isLiked ? '❤️' : '🤍';
};

/**
 * View icon HTML
 * @returns {string} View icon
 */
const getViewIcon = () => '👁️';

/**
 * Comment icon HTML
 * @returns {string} Comment icon
 */
const getCommentIcon = () => '💬';

/**
 * Share icon HTML
 * @returns {string} Share icon
 */
const getShareIcon = () => '📤';

/**
 * Save icon HTML
 * @param {boolean} isSaved - Saqlanganmi
 * @returns {string} Save icon
 */
const getSaveIcon = (isSaved) => {
    return isSaved ? '🔖' : '📑';
};

/**
 * Verified badge
 * @param {boolean} isVerified - Tasdiqlanganmi
 * @returns {string} Verified badge HTML
 */
const getVerifiedBadge = (isVerified) => {
    if (!isVerified) return '';
    return '<span class="verified-badge" title="Tasdiqlangan akkaunt">✓</span>';
};

/**
 * Live badge
 * @param {boolean} isLive - Jonli efirmi
 * @returns {string} Live badge HTML
 */
const getLiveBadge = (isLive) => {
    if (!isLive) return '';
    return '<span class="live-badge">🔴 LIVE</span>';
};

/**
 * New badge
 * @param {string} createdAt - Yaratilgan sana
 * @returns {string} New badge HTML
 */
const getNewBadge = (createdAt) => {
    if (!createdAt) return '';
    const now = new Date();
    const created = new Date(createdAt);
    const hoursDiff = (now - created) / (1000 * 60 * 60);
    if (hoursDiff < 24) return '<span class="new-badge">NEW</span>';
    return '';
};

/**
 * Video menu itemlari
 * @param {string} videoId - Video ID
 * @returns {string} Menu HTML
 */
const getVideoMenu = (videoId) => {
    return `
        <div class="video-menu" data-video-id="${videoId}">
            <button class="menu-btn" data-action="share">${getShareIcon()} Ulashish</button>
            <button class="menu-btn" data-action="save">${getSaveIcon(false)} Saqlash</button>
            <button class="menu-btn" data-action="report">⚠️ Shikoyat qilish</button>
            <button class="menu-btn" data-action="download">⬇️ Yuklab olish</button>
        </div>
    `;
};

/**
 * Hover effektlari uchun CSS
 */
const getHoverStyles = () => {
    return `
        <style>
            .video-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 24px rgba(0,0,0,0.3);
                transition: all 0.3s ease;
            }
            .video-card:hover .video-thumbnail img {
                transform: scale(1.05);
                transition: transform 0.3s ease;
            }
            .video-card:hover .video-menu {
                opacity: 1;
                visibility: visible;
            }
        </style>
    `;
};

// ============ ASOSIY KOMPONENT ============

/**
 * VideoCard komponenti
 * @param {Object} props - Komponent parametrlari
 * @param {Object} props.video - Video ma'lumotlari
 * @param {Function} props.onPlay - Video ijro etish funksiyasi
 * @param {Function} props.onLike - Like bosish funksiyasi
 * @param {Function} props.onSave - Saqlash funksiyasi
 * @param {Function} props.onShare - Ulashish funksiyasi
 * @param {Function} props.onMenuAction - Menu action funksiyasi
 * @returns {string} HTML string
 */
export function VideoCard({ 
    video, 
    onPlay, 
    onLike, 
    onSave, 
    onShare, 
    onMenuAction,
    isLiked = false,
    isSaved = false,
    showMenu = true,
    showHoverEffects = true,
    size = 'normal' // small, normal, large
}) {
    // Validatsiya
    if (!video || !video._id) {
        console.error('VideoCard: video maʼlumotlari topilmadi');
        return '<div class="video-card error">Xato: Video maʼlumotlari yo\'q</div>';
    }

    // Ma'lumotlarni olish
    const videoId = video._id;
    const title = truncateTitle(video.title || 'No title', size === 'small' ? 40 : 60);
    const username = formatUsername(video.user?.username);
    const avatar = video.user?.avatar || 'https://via.placeholder.com/40';
    const thumbnail = video.thumbnailUrl || video.videoUrl?.replace('.mp4', '.jpg') || '';
    const duration = formatDuration(video.duration);
    const views = formatNumber(video.views || 0);
    const likes = formatNumber(video.likesCount || 0);
    const comments = formatNumber(video.commentsCount || 0);
    const date = formatDate(video.createdAt);
    const isVerified = video.user?.isVerified || false;
    const isLive = video.isLive || false;
    const quality = getQualityBadge(video.videoUrl);
    const trendingBadge = getTrendingBadge(video.views || 0, video.likesCount || 0);
    
    // Size ga qarab class
    const sizeClass = {
        small: 'video-card-small',
        normal: 'video-card',
        large: 'video-card-large'
    }[size] || 'video-card';

    // Thumbnail o'lchami
    const thumbnailSize = size === 'small' ? '120x180' : (size === 'large' ? '400x600' : '300x500');

    return `
        ${showHoverEffects ? getHoverStyles() : ''}
        
        <div class="${sizeClass}" data-video-id="${videoId}" data-video-title="${title}">
            
            <!-- Thumbnail Section -->
            <div class="video-thumbnail" onclick="onPlay && onPlay('${videoId}')">
                ${thumbnail ? `
                    <img 
                        src="${thumbnail}" 
                        alt="${title}"
                        loading="lazy"
                        onerror="this.src='data:image/svg+xml,${encodeURIComponent(getImagePlaceholder())}'"
                    >
                ` : getImagePlaceholder()}
                
                <!-- Badges -->
                <div class="video-badges">
                    ${getLiveBadge(isLive)}
                    ${getNewBadge(video.createdAt)}
                    ${quality ? `<span class="quality-badge">${quality}</span>` : ''}
                    ${trendingBadge ? `<span class="trending-badge">${trendingBadge}</span>` : ''}
                </div>
                
                <!-- Duration -->
                <span class="video-duration">${duration}</span>
                
                <!-- Progress Bar (watch history) -->
                ${video.watchProgress ? `
                    <div class="watch-progress">
                        <div class="watch-progress-fill" style="width: ${video.watchProgress}%"></div>
                    </div>
                ` : ''}
            </div>
            
            <!-- Info Section -->
            <div class="video-info">
                
                <!-- Avatar & Username -->
                <div class="video-header">
                    <img 
                        src="${avatar}" 
                        class="channel-avatar" 
                        alt="${username}"
                        onerror="this.src='https://via.placeholder.com/40'"
                    >
                    <div class="channel-info">
                        <div class="channel-name">
                            @${username}
                            ${getVerifiedBadge(isVerified)}
                        </div>
                        <div class="video-date">${date}</div>
                    </div>
                </div>
                
                <!-- Title -->
                <div class="video-title" title="${video.title || 'No title'}">
                    ${title}
                </div>
                
                <!-- Stats -->
                <div class="video-stats">
                    <div class="stat-item" title="Ko'rishlar">
                        <span class="stat-icon">${getViewIcon()}</span>
                        <span class="stat-value">${views}</span>
                    </div>
                    <div class="stat-item" title="Layklar">
                        <button class="like-btn ${isLiked ? 'liked' : ''}" data-action="like">
                            <span class="stat-icon">${getLikeIcon(isLiked)}</span>
                            <span class="stat-value">${likes}</span>
                        </button>
                    </div>
                    <div class="stat-item" title="Izohlar">
                        <span class="stat-icon">${getCommentIcon()}</span>
                        <span class="stat-value">${comments}</span>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="video-actions">
                    <button class="action-btn play-btn" data-action="play" title="Ko'rish">
                        ${getViewIcon()} Ko'rish
                    </button>
                    <button class="action-btn save-btn ${isSaved ? 'saved' : ''}" data-action="save" title="Saqlash">
                        ${getSaveIcon(isSaved)}
                    </button>
                    <button class="action-btn share-btn" data-action="share" title="Ulashish">
                        ${getShareIcon()}
                    </button>
                </div>
                
                <!-- Menu (hover da ko'rinadi) -->
                ${showMenu ? getVideoMenu(videoId) : ''}
                
            </div>
        </div>
    `;
}

// ============ EKSPORTLAR ============

export default VideoCard;

// Qo'shimcha helper funksiyalar
export const VideoCardUtils = {
    formatNumber,
    formatDuration,
    formatDate,
    truncateTitle,
    formatUsername,
    getTrendingBadge,
    getQualityBadge,
    getLikeIcon,
    getSaveIcon
};
