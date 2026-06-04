export function SettingsPage({ settings, onUpdate, onClearCache, onLogout, appVersion, platform }) {
    return `
        <div class="page" id="settings-page">
            <div class="top-bar">
                <h1 class="page-title">Sozlamalar</h1>
            </div>
            
            <div class="settings-container">
                <div class="settings-section">
                    <h3 class="settings-title">Umumiy</h3>
                    <div class="setting-item">
                        <span class="setting-label">Qora rejim</span>
                        <label class="switch">
                            <input type="checkbox" id="dark-mode" ${settings.theme === 'dark' ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Avtomatik yangilanish</span>
                        <label class="switch">
                            <input type="checkbox" id="auto-update" ${settings.autoUpdate !== false ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Ilova versiyasi</span>
                        <span>${appVersion}</span>
                    </div>
                    <div class="setting-item">
                        <span class="setting-label">Platforma</span>
                        <span>${platform}</span>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3 class="settings-title">Video</h3>
                    <div class="setting-item">
                        <span class="setting-label">Video sifati</span>
                        <select id="video-quality">
                            <option value="auto" ${settings.videoQuality === 'auto' ? 'selected' : ''}>Avtomatik</option>
                            <option value="1080p" ${settings.videoQuality === '1080p' ? 'selected' : ''}>1080p</option>
                            <option value="720p" ${settings.videoQuality === '720p' ? 'selected' : ''}>720p</option>
                            <option value="480p" ${settings.videoQuality === '480p' ? 'selected' : ''}>480p</option>
                        </select>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3 class="settings-title">Ma'lumotlar</h3>
                    <div class="setting-item">
                        <span class="setting-label">Kesh tozalash</span>
                        <button class="danger-btn" id="clear-cache-btn">Tozalash</button>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3 class="settings-title">Hisob</h3>
                    <div class="setting-item">
                        <span class="setting-label">Chiqish</span>
                        <button class="danger-btn" id="logout-btn">Chiqish</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}
