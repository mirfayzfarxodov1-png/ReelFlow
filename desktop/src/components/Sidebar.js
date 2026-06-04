export function Sidebar({ currentPage, onNavigate, user, onLogout }) {
    const menuItems = [
        { id: 'home', name: 'Bosh sahifa', icon: '🏠' },
        { id: 'search', name: 'Qidiruv', icon: '🔍' },
        { id: 'upload', name: 'Yuklash', icon: '📤' },
        { id: 'profile', name: 'Profil', icon: '👤' },
        { id: 'settings', name: 'Sozlamalar', icon: '⚙️' }
    ];

    return `
        <aside class="sidebar">
            <div class="logo">
                <div class="logo-icon">🎬</div>
                <h1>ReelFlow</h1>
            </div>
            
            <nav class="nav-menu">
                ${menuItems.map(item => `
                    <a href="#" class="nav-item ${currentPage === item.id ? 'active' : ''}" data-page="${item.id}">
                        <span class="nav-icon">${item.icon}</span>
                        <span>${item.name}</span>
                    </a>
                `).join('')}
            </nav>
            
            <div class="sidebar-footer">
                ${user ? `
                    <div class="user-info">
                        <img src="${user.avatar || '../assets/images/default-avatar.png'}" class="user-avatar">
                        <div class="user-details">
                            <span class="username">@${user.username}</span>
                            <button class="logout-btn" id="logout-btn">Chiqish</button>
                        </div>
                    </div>
                ` : `
                    <button class="login-btn" id="login-btn">Kirish</button>
                `}
            </div>
        </aside>
    `;
}
