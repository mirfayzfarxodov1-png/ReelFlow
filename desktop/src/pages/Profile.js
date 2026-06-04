import { VideoCard } from '../components/VideoCard.js';

export function ProfilePage({ user, videos, onPlay, onEditProfile }) {
    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return `
        <div class="page" id="profile-page">
            <div class="top-bar">
                <h1 class="page-title">Profil</h1>
                <button class="edit-profile-btn" id="edit-profile-btn">✏️ Tahrirlash</button>
            </div>
            
            <div class="profile-header">
                <img src="${user?.avatar || '../assets/images/default-avatar.png'}" class="profile-avatar">
                <div class="profile-info">
                    <h2>@${user?.username}</h2>
                    <p>${user?.bio || 'Bio mavjud emas'}</p>
                    <div class="profile-stats">
                        <div class="stat-item">
                            <div class="stat-number">${formatNumber(user?.stats?.videoCount || 0)}</div>
                            <div class="stat-label">Videolar</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${formatNumber(user?.stats?.followerCount || 0)}</div>
                            <div class="stat-label">Kuzatuvchilar</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${formatNumber(user?.stats?.followingCount || 0)}</div>
                            <div class="stat-label">Kuzatilgan</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="videos-grid" id="profile-videos">
                ${videos.map(video => VideoCard({ video, onPlay })).join('')}
            </div>
        </div>
    `;
}
