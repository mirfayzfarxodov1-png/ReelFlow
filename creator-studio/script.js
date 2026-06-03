// ============ CREATOR PANEL SCRIPT ============
// Bu kod faqat ilova yaratuvchisiga (sizga) ko'rinadi

// ============ MA'LUMOTLAR ============

// Tizimda mavjud foydalanuvchilar (backend dan keladi)
let users = [
    { id: 1, username: 'dilnoza_07', fullName: 'Dilnoza', email: 'dilnoza@mail.com', avatar: 'https://randomuser.me/api/portraits/women/1.jpg', videoCount: 24, followerCount: 1240, isVerified: false, verifiedBadge: 'none', profileBg: 'default', likeIcon: 'default', animationFrame: 'none', nameStyle: 'default' },
    { id: 2, username: 'javohir_22', fullName: 'Javohir', email: 'javohir@mail.com', avatar: 'https://randomuser.me/api/portraits/men/2.jpg', videoCount: 56, followerCount: 3420, isVerified: false, verifiedBadge: 'none', profileBg: 'default', likeIcon: 'default', animationFrame: 'none', nameStyle: 'default' },
    { id: 3, username: 'mehronaa', fullName: 'Mehrona', email: 'mehrona@mail.com', avatar: 'https://randomuser.me/api/portraits/women/3.jpg', videoCount: 12, followerCount: 890, isVerified: false, verifiedBadge: 'none', profileBg: 'default', likeIcon: 'default', animationFrame: 'none', nameStyle: 'default' },
    { id: 4, username: 'bekzod_blog', fullName: 'Bekzod', email: 'bekzod@mail.com', avatar: 'https://randomuser.me/api/portraits/men/4.jpg', videoCount: 89, followerCount: 5600, isVerified: false, verifiedBadge: 'none', profileBg: 'default', likeIcon: 'default', animationFrame: 'none', nameStyle: 'default' },
    { id: 5, username: 'madina_kitobxon', fullName: 'Madina', email: 'madina@mail.com', avatar: 'https://randomuser.me/api/portraits/women/5.jpg', videoCount: 34, followerCount: 2100, isVerified: false, verifiedBadge: 'none', profileBg: 'default', likeIcon: 'default', animationFrame: 'none', nameStyle: 'default' }
];

let currentUser = null;
let selectedBackground = 'default';
let selectedLikeIcon = 'default';
let selectedBadge = 'none';
let selectedFrame = 'none';
let selectedNameStyle = 'default';

// ============ PROFIL FONLARI ============
const backgrounds = [
    { id: 'default', name: 'Standart', preview: '🌑', style: 'default' },
    { id: 'gradient1', name: 'Binafsha', preview: '💜', style: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient2', name: 'Qizil', preview: '❤️', style: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { id: 'gradient3', name: 'Yashil', preview: '💚', style: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { id: 'gradient4', name: 'To'q sariq', preview: '🧡', style: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { id: 'ocean', name: 'Okean', preview: '🌊', style: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)' },
    { id: 'sunset', name: 'Quyosh botishi', preview: '🌅', style: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)' },
    { id: 'forest', name: 'O'rmon', preview: '🌲', style: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' }
];

// ============ LAYK IKONKALARI ============
const likeIcons = [
    { id: 'default', name: 'Standart', icon: '❤️', animation: 'none' },
    { id: 'heart', name: 'Yurak', icon: '💖', animation: 'pulse' },
    { id: 'star', name: 'Yulduz', icon: '⭐', animation: 'rotate' },
    { id: 'fire', name: 'Olov', icon: '🔥', animation: 'bounce' },
    { id: 'clap', name: 'Qars', icon: '👏', animation: 'shake' },
    { id: 'crown', name: 'Toj', icon: '👑', animation: 'spin' }
];

// ============ ANIMATSIYALI RAMKALAR ============
const frames = [
    { id: 'none', name: 'Yo\'q', preview: '⬜' },
    { id: 'pulse', name: 'Puls', preview: '💓', animation: 'pulse-border' },
    { id: 'rainbow', name: 'Kamalak', preview: '🌈', animation: 'rainbow-border' },
    { id: 'glow', name: 'Yorug\'lik', preview: '✨', animation: 'glow' },
    { id: 'rotate', name: 'Aylanma', preview: '🔄', animation: 'rotate-border' }
];

// ============ ISM USLUBLARI ============
const nameStyles = [
    { id: 'default', name: 'Standart', style: 'normal', preview: 'Oddiy ism' },
    { id: 'bold', name: 'Qalin', style: 'bold', preview: 'Qalin ism' },
    { id: 'gradient', name: 'Gradient', style: 'gradient-text', preview: 'Gradient' },
    { id: 'glow', name: 'Yorug\'', style: 'glow-text', preview: 'Yorqin' },
    { id: 'shadow', name: 'Soya', style: 'shadow-text', preview: 'Soyali' }
];

// ============ LOAD FUNCTIONS ============
function loadBackgroundOptions() {
    const container = document.getElementById('backgroundOptions');
    container.innerHTML = backgrounds.map(bg => `
        <div class="option-card" data-bg="${bg.id}" onclick="selectBackground('${bg.id}')">
            <div class="option-preview">${bg.preview}</div>
            <span>${bg.name}</span>
        </div>
    `).join('');
}

function loadLikeIconOptions() {
    const container = document.getElementById('likeIconOptions');
    container.innerHTML = likeIcons.map(icon => `
        <div class="option-card" data-icon="${icon.id}" onclick="selectLikeIcon('${icon.id}')">
            <div class="option-preview">${icon.icon}</div>
            <span>${icon.name}</span>
        </div>
    `).join('');
}

function loadFrameOptions() {
    const container = document.getElementById('frameOptions');
    container.innerHTML = frames.map(frame => `
        <div class="option-card" data-frame="${frame.id}" onclick="selectFrame('${frame.id}')">
            <div class="option-preview">${frame.preview}</div>
            <span>${frame.name}</span>
        </div>
    `).join('');
}

function loadNameStyleOptions() {
    const container = document.getElementById('nameStyleOptions');
    container.innerHTML = nameStyles.map(style => `
        <div class="option-card" data-style="${style.id}" onclick="selectNameStyle('${style.id}')">
            <div class="option-preview">${style.preview}</div>
            <span>${style.name}</span>
        </div>
    `).join('');
}

// ============ SELECT FUNCTIONS ============
function selectBackground(bgId) {
    selectedBackground = bgId;
    document.querySelectorAll('[data-bg]').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-bg="${bgId}"]`).classList.add('selected');
    updatePreview();
}

function selectLikeIcon(iconId) {
    selectedLikeIcon = iconId;
    document.querySelectorAll('[data-icon]').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-icon="${iconId}"]`).classList.add('selected');
    updatePreview();
}

function selectBadge(badgeType) {
    selectedBadge = badgeType;
    document.querySelectorAll('.badge-card').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-badge="${badgeType}"]`).classList.add('selected');
    updatePreview();
}

function selectFrame(frameId) {
    selectedFrame = frameId;
    document.querySelectorAll('[data-frame]').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-frame="${frameId}"]`).classList.add('selected');
    updatePreview();
}

function selectNameStyle(styleId) {
    selectedNameStyle = styleId;
    document.querySelectorAll('[data-style]').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-style="${styleId}"]`).classList.add('selected');
    updatePreview();
}

// ============ PREVIEW UPDATE ============
function updatePreview() {
    const previewDiv = document.getElementById('userPreview');
    if (!previewDiv || !currentUser) return;
    
    let badgeHtml = '';
    if (selectedBadge === 'gold') badgeHtml = '<span class="gold-badge" style="font-size:18px; margin-left:5px;">⭐</span>';
    else if (selectedBadge === 'diamond') badgeHtml = '<span class="diamond-badge" style="font-size:18px; margin-left:5px;">💎</span>';
    else if (selectedBadge === 'rainbow') badgeHtml = '<span class="rainbow-badge" style="font-size:18px; margin-left:5px;">🌈</span>';
    else if (selectedBadge === 'crown') badgeHtml = '<span class="crown-badge" style="font-size:18px; margin-left:5px;">👑</span>';
    
    let frameClass = '';
    if (selectedFrame === 'pulse') frameClass = 'pulse-border';
    else if (selectedFrame === 'rainbow') frameClass = 'rainbow-border';
    else if (selectedFrame === 'glow') frameClass = 'glow-border';
    else if (selectedFrame === 'rotate') frameClass = 'rotate-border';
    
    let nameClass = '';
    if (selectedNameStyle === 'bold') nameClass = 'bold-text';
    else if (selectedNameStyle === 'gradient') nameClass = 'gradient-text';
    else if (selectedNameStyle === 'glow') nameClass = 'glow-text';
    else if (selectedNameStyle === 'shadow') nameClass = 'shadow-text';
    
    previewDiv.innerHTML = `
        <div class="avatar-preview ${frameClass}" style="width:50px; height:50px; border-radius:50%; overflow:hidden;">
            <img src="${currentUser.avatar}" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <div>
            <span class="${nameClass}" style="font-size:16px; font-weight:${selectedNameStyle === 'bold' ? 'bold' : 'normal'}">@${currentUser.username}</span>
            ${badgeHtml}
        </div>
        <div class="like-preview">
            Like: ${likeIcons.find(i => i.id === selectedLikeIcon)?.icon || '❤️'}
        </div>
    `;
}

// ============ SEARCH USER ============
document.getElementById('searchUserBtn').addEventListener('click', () => {
    const searchInput = document.getElementById('userSearchInput');
    const username = searchInput.value.trim().replace('@', '');
    
    const user = users.find(u => u.username === username);
    const resultDiv = document.getElementById('searchResult');
    
    if (user) {
        currentUser = user;
        resultDiv.innerHTML = `
            <div class="user-found">
                <img src="${user.avatar}" alt="">
                <div>
                    <strong>@${user.username}</strong>
                    <p>${user.fullName} • ${user.videoCount} video • ${user.followerCount} kuzatuvchi</p>
                </div>
                <button onclick="selectThisUser()" style="background:#667eea; border:none; padding:8px 20px; border-radius:8px; color:#fff; cursor:pointer;">Tanlash</button>
            </div>
        `;
        resultDiv.classList.add('show');
    } else {
        resultDiv.innerHTML = `<p style="color:#ff3b30;">❌ Foydalanuvchi topilmadi: @${username}</p>`;
        resultDiv.classList.add('show');
    }
});

function selectThisUser() {
    // Load user's current settings
    selectedBackground = currentUser.profileBg || 'default';
    selectedLikeIcon = currentUser.likeIcon || 'default';
    selectedBadge = currentUser.verifiedBadge || 'none';
    selectedFrame = currentUser.animationFrame || 'none';
    selectedNameStyle = currentUser.nameStyle || 'default';
    
    // Update UI selections
    document.querySelectorAll('[data-bg]').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-bg="${selectedBackground}"]`)?.classList.add('selected');
    
    document.querySelectorAll('[data-icon]').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-icon="${selectedLikeIcon}"]`)?.classList.add('selected');
    
    document.querySelectorAll('.badge-card').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-badge="${selectedBadge}"]`)?.classList.add('selected');
    
    document.querySelectorAll('[data-frame]').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-frame="${selectedFrame}"]`)?.classList.add('selected');
    
    document.querySelectorAll('[data-style]').forEach(el => el.classList.remove('selected'));
    document.querySelector(`[data-style="${selectedNameStyle}"]`)?.classList.add('selected');
    
    updatePreview();
    document.getElementById('customizationPanel').style.display = 'block';
    document.getElementById('searchResult').classList.remove('show');
}

// ============ APPLY CREATOR CODE ============
const validCodes = [
    'REELFLOW_ADMIN_2024',
    'CREATOR_ACCESS',
    'VIP_DECORATION',
    'ULTRA_CUSTOM'
];

document.getElementById('applyCodeBtn').addEventListener('click', () => {
    const codeInput = document.getElementById('creatorCodeInput');
    const code = codeInput.value.trim();
    const statusDiv = document.getElementById('codeStatus');
    
    if (validCodes.includes(code)) {
        statusDiv.innerHTML = '✅ Kod to\'g\'ri! Siz akkauntlarni bezashingiz mumkin';
        statusDiv.className = 'code-status success';
        document.getElementById('searchSection').style.display = 'block';
    } else {
        statusDiv.innerHTML = '❌ Noto\'g\'ri kod! Iltimos to\'g\'ri kodni kiriting';
        statusDiv.className = 'code-status error';
    }
});

// ============ SAVE CHANGES ============
document.getElementById('saveChangesBtn').addEventListener('click', () => {
    if (!currentUser) return;
    
    // Update user data
    currentUser.profileBg = selectedBackground;
    currentUser.likeIcon = selectedLikeIcon;
    currentUser.verifiedBadge = selectedBadge;
    currentUser.animationFrame = selectedFrame;
    currentUser.nameStyle = selectedNameStyle;
    currentUser.isVerified = selectedBadge !== 'none';
    
    // Update in users array
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
        users[index] = currentUser;
    }
    
    // Save to localStorage for demo
    localStorage.setItem('reelflow_users', JSON.stringify(users));
    
    // Show success modal
    document.getElementById('successModal').classList.add('show');
    
    // Apply changes to user's profile (would be API call)
    console.log('Changes saved for user:', currentUser.username);
    console.log('New settings:', {
        background: selectedBackground,
        likeIcon: selectedLikeIcon,
        badge: selectedBadge,
        frame: selectedFrame,
        nameStyle: selectedNameStyle
    });
});

// ============ RESET USER ============
document.getElementById('resetUserBtn').addEventListener('click', () => {
    if (!currentUser) return;
    
    selectedBackground = 'default';
    selectedLikeIcon = 'default';
    selectedBadge = 'none';
    selectedFrame = 'none';
    selectedNameStyle = 'default';
    
    // Reset UI
    document.querySelectorAll('[data-bg]').forEach(el => el.classList.remove('selected'));
    document.querySelector('[data-bg="default"]').classList.add('selected');
    
    document.querySelectorAll('[data-icon]').forEach(el => el.classList.remove('selected'));
    document.querySelector('[data-icon="default"]').classList.add('selected');
    
    document.querySelectorAll('.badge-card').forEach(el => el.classList.remove('selected'));
    document.querySelector('[data-badge="none"]').classList.add('selected');
    
    document.querySelectorAll('[data-frame]').forEach(el => el.classList.remove('selected'));
    document.querySelector('[data-frame="none"]').classList.add('selected');
    
    document.querySelectorAll('[data-style]').forEach(el => el.classList.remove('selected'));
    document.querySelector('[data-style="default"]').classList.add('selected');
    
    updatePreview();
});

function closeModal() {
    document.getElementById('successModal').classList.remove('show');
}

// ============ INIT ============
function init() {
    loadBackgroundOptions();
    loadLikeIconOptions();
    loadFrameOptions();
    loadNameStyleOptions();
    
    // Load saved users from localStorage
    const saved = localStorage.getItem('reelflow_users');
    if (saved) {
        users = JSON.parse(saved);
    }
}

init();
