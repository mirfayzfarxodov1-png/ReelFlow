// PAGE NAVIGATION
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const pageId = item.dataset.page;
        
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        pages.forEach(page => page.classList.remove('active'));
        const activePage = document.getElementById(`${pageId}-page`);
        if (activePage) {
            activePage.classList.add('active');
        }
    });
});

// FEED TABS
const feedTabs = document.querySelectorAll('.feed-tab');

feedTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        feedTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

// PROFILE TABS
const profileTabs = document.querySelectorAll('.profile-tab');

profileTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        profileTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

// SEARCH TABS
const searchTabs = document.querySelectorAll('.search-tab');

searchTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        searchTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

console.log('ReelFlow ready');
