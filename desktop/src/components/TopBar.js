export function TopBar({ title, onSearch, onNotification }) {
    return `
        <div class="top-bar">
            <h1 class="page-title">${title}</h1>
            <div class="header-actions">
                <input type="text" class="search-input" placeholder="Qidiruv..." id="global-search">
                <button class="notification-btn" id="notification-btn">🔔</button>
            </div>
        </div>
    `;
}
