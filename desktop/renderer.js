// DOM Elements
const pageContainer = document.getElementById('page-container');
const navItems = document.querySelectorAll('.nav-item');

// API Service
const API_URL = 'http://localhost:5000/api';
let currentUser = null;

// Pages
const pages = {
    home: '<div class="page active" id="home-page"><div class="top-bar"><h1 class="page-title">Bosh sahifa</h1></div><div class="videos-grid" id="videos-grid"></div></div>',
    search: '<div class="page" id="search-page"><div class="top-bar"><h1 class="page-title">Qidiruv</h1><input type="text" class="search-input" placeholder="Qidiruv..." id="search-input"></div><div class="videos-grid" id="search-results"></div></div>',
    upload: '<div class="page" id="upload-page"><div class="upload-container"><div class="upload-box"><div class="upload-icon">📹</div><h3>Video yuklash</h3><p>Video faylni tanlang yoki shu yerga tashlang</p><input type="file" id="video-file" accept="video/*" style="display:none"><button class="upload-btn" id="select-video-btn">Video tanlash</button></div></div></div>',
    profile: '<div class="page" id="profile-page"><div class="profile-header" id="profile-header"></div><div class="videos-grid" id="profile-videos"></div></div>',
    settings: '<div class="page" id="settings-page"><div class="settings-container"><div class="settings-section"><h3 class="settings-title">Umumiy</h3><div class="setting-item"><span class="setting-label">Ilova versiyasi</span><span id="app-version">1.0.0</span></div><div class="setting-item"><span class="setting-label">Platforma</span><span id="platform"></span></div></div><div class="settings-section"><h3 class="settings-title">Hisob</h3><div class="setting-item"><span class="setting-label">Kesh tozalash</span><button id="clear-cache-btn" style="background:#1a1a1a;border:none;padding:6px 12px;border-radius:6px;color:#fff;cursor:pointer">Tozalash</button></div><div class="setting-item"><span class="setting-label">Chiqish</span><button id="logout-btn" style="background:#ff3b30;border:none;padding:6px 12px;border-radius:6px;color:#fff;cursor:pointer">Chiqish</button></div></div></div></div>'
};

// Load page
function loadPage(pageName) {
    if (!pages[pageName]) return;
    
    pageContainer.innerHTML = pages[pageName];
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const activePage = document.getElementById(`${pageName}-page`);
    if (activePage) activePage.classList.add('active');
    
    // Initialize page specific functions
    if (pageName === 'home') loadVideos();
    if (pageName === 'profile') loadProfile();
    if (pageName === 'settings') initSettings();
    if (pageName === 'search') initSearch();
    if (pageName === 'upload') initUpload();
}

// Navigation
navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = item.dataset.page;
        
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        loadPage(pageName);
    });
});

// Load videos for home
async function loadVideos() {
    try {
        const response = await fetch(`${API_URL}/videos/feed`, {
            headers: getHeaders()
        });
        const videos = await response.json();
        
        const grid = document.getElementById('videos-grid');
        if (grid) {
            grid.innerHTML = videos.map(video => `
                <div class="video-card" onclick="playVideo('${video._id}')">
                    <div class="video-thumbnail">
                        <img src="${video.thumbnailUrl}" alt="${video.title}">
                        <span class="video-duration">${formatDuration(video.duration)}</span>
                    </div>
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-user">@${video.user?.username}</div>
                        <div class="video-stats">
                            <span>👁️ ${formatNumber(video.views)}</span>
                            <span>❤️ ${formatNumber(video.likesCount)}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Load videos error:', error);
    }
}

// Load profile
async function loadProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            loadPage('home');
            return;
        }
        
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: getHeaders()
        });
        currentUser = await response.json();
        
        const header = document.getElementById('profile-header');
        if (header) {
            header.innerHTML = `
                <img src="${currentUser.avatar}" class="profile-avatar">
                <div>
                    <h2>@${currentUser.username}</h2>
                    <p>${currentUser.bio || ''}</p>
                    <div class="profile-stats">
                        <div class="stat-item"><div class="stat-number">${formatNumber(currentUser.stats?.videoCount)}</div><div class="stat-label">Videolar</div></div>
                        <div class="stat-item"><div class="stat-number">${formatNumber(currentUser.stats?.followerCount)}</div><div class="stat-label">Kuzatuvchilar</div></div>
                        <div class="stat-item"><div class="stat-number">${formatNumber(currentUser.stats?.followingCount)}</div><div class="stat-label">Kuzatilgan</div></div>
                    </div>
                </div>
            `;
        }
        
        // Load user videos
        const videosResponse = await fetch(`${API_URL}/users/${currentUser._id}/videos`, {
            headers: getHeaders()
        });
        const videos = await videosResponse.json();
        
        const grid = document.getElementById('profile-videos');
        if (grid) {
            grid.innerHTML = videos.map(video => `
                <div class="video-card" onclick="playVideo('${video._id}')">
                    <div class="video-thumbnail">
                        <img src="${video.thumbnailUrl}">
                    </div>
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-stats">👁️ ${formatNumber(video.views)}</div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

// Settings
function initSettings() {
    document.getElementById('app-version').textContent = window.electron?.app?.getVersion() || '1.0.0';
    document.getElementById('platform').textContent = window.electron?.app?.getPlatform() || 'web';
    
    document.getElementById('clear-cache-btn')?.addEventListener('click', () => {
        localStorage.clear();
        alert('Kesh tozalandi!');
    });
    
    document.getElementById('logout-btn')?.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        currentUser = null;
        loadPage('home');
    });
}

// Search
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async (e) => {
            const query = e.target.value;
            if (query.length < 2) return;
            
            try {
                const response = await fetch(`${API_URL}/videos/search?q=${query}`, {
                    headers: getHeaders()
                });
                const results = await response.json();
                
                const container = document.getElementById('search-results');
                if (container) {
                    container.innerHTML = results.map(video => `
                        <div class="video-card" onclick="playVideo('${video._id}')">
                            <div class="video-thumbnail"><img src="${video.thumbnailUrl}"></div>
                            <div class="video-info"><div class="video-title">${video.title}</div></div>
                        </div>
                    `).join('');
                }
            } catch (error) {
                console.error('Search error:', error);
            }
        }, 500));
    }
}

// Upload
function initUpload() {
    const selectBtn = document.getElementById('select-video-btn');
    const fileInput = document.getElementById('video-file');
    
    selectBtn?.addEventListener('click', () => {
        fileInput?.click();
    });
    
    fileInput?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const formData = new FormData();
        formData.append('video', file);
        formData.append('title', file.name);
        
        try {
            const response = await fetch(`${API_URL}/videos/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: formData
            });
            
            if (response.ok) {
                alert('Video yuklandi!');
                loadPage('home');
            }
        } catch (error) {
            console.error('Upload error:', error);
        }
    });
}

// Helper functions
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function debounce(func, wait) {
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

function playVideo(videoId) {
    // Video player functionality
    console.log('Play video:', videoId);
}

// Load home page on start
loadPage('home');

// Electron IPC listeners
if (window.electron) {
    window.electron.theme.onChanged((event, isDark) => {
        document.body.classList.toggle('dark-theme', isDark);
    });
    
    window.electron.updater.onUpdateAvailable(() => {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = 'Yangi versiya mavjud! Yuklanmoqda...';
        document.body.appendChild(notification);
    });
    
    window.electron.updater.onUpdateDownloaded(() => {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = 'Yangilanish tayyor! Qayta ishga tushirish kerak. <button id="restart-btn">Qayta ishga tushirish</button>';
        document.body.appendChild(notification);
        
        document.getElementById('restart-btn')?.addEventListener('click', () => {
            window.electron.updater.restartApp();
        });
    });
}
