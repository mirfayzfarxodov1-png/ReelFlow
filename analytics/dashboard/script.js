// API base URL
const API_URL = 'http://localhost:5000/api';
const token = localStorage.getItem('token');

let viewsChart, revenueChart, engagementChart, devicesChart, geoChart;
let currentPeriod = 'week';

// Initialize charts
function initCharts() {
    const ctx = document.getElementById('viewsChart').getContext('2d');
    viewsChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] },
        options: { responsive: true, maintainAspectRatio: true }
    });
    
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    revenueChart = new Chart(revenueCtx, {
        type: 'bar',
        data: { labels: [], datasets: [] },
        options: { responsive: true }
    });
    
    const engagementCtx = document.getElementById('engagementChart').getContext('2d');
    engagementChart = new Chart(engagementCtx, {
        type: 'doughnut',
        data: { labels: [], datasets: [] },
        options: { responsive: true }
    });
}

// Fetch and update data
async function fetchAnalytics() {
    try {
        const response = await fetch(`${API_URL}/analytics/user?period=${currentPeriod}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error('Error fetching analytics:', error);
    }
}

async function fetchTopVideos() {
    try {
        const response = await fetch(`${API_URL}/analytics/top-videos?limit=5`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const videos = await response.json();
        updateTopVideos(videos);
    } catch (error) {
        console.error('Error fetching top videos:', error);
    }
}

// Update UI
function updateUI(data) {
    // Summary stats
    document.getElementById('totalViews').textContent = formatNumber(data.summary?.totalViews || 0);
    document.getElementById('totalLikes').textContent = formatNumber(data.summary?.totalLikes || 0);
    document.getElementById('totalComments').textContent = formatNumber(data.summary?.totalComments || 0);
    document.getElementById('totalShares').textContent = formatNumber(data.summary?.totalShares || 0);
    document.getElementById('newFollowers').textContent = formatNumber(data.summary?.newFollowers || 0);
    document.getElementById('totalRevenue').textContent = `$${formatNumber(data.summary?.revenue || 0)}`;
    
    // Update charts
    if (data.dailyTrend && data.dailyTrend.length > 0) {
        const labels = data.dailyTrend.map(d => new Date(d.date).toLocaleDateString());
        const views = data.dailyTrend.map(d => d.views);
        const revenue = data.dailyTrend.map(d => d.revenue);
        
        viewsChart.data = {
            labels: labels,
            datasets: [{
                label: 'Ko\'rishlar',
                data: views,
                borderColor: '#667eea',
                backgroundColor: 'transparent',
                tension: 0.4,
                fill: true
            }]
        };
        viewsChart.update();
        
        revenueChart.data = {
            labels: labels,
            datasets: [{
                label: 'Daromad ($)',
                data: revenue,
                backgroundColor: '#00c853',
                borderRadius: 8
            }]
        };
        revenueChart.update();
    }
    
    // Engagement chart
    engagementChart.data = {
        labels: ['Layklar', 'Izohlar', 'Ulashishlar'],
        datasets: [{
            data: [
                data.summary?.totalLikes || 0,
                data.summary?.totalComments || 0,
                data.summary?.totalShares || 0
            ],
            backgroundColor: ['#ff3040', '#0095f6', '#00c853']
        }]
    };
    engagementChart.update();
    
    // Update daily trend table
    updateDailyTrendTable(data.dailyTrend);
}

function updateTopVideos(videos) {
    const container = document.getElementById('topVideos');
    if (!container) return;
    
    container.innerHTML = videos.map(video => `
        <div class="video-item">
            <img src="${video.video?.thumbnailUrl || 'https://via.placeholder.com/80'}" alt="">
            <div class="video-info">
                <div class="video-title">${video.video?.title || 'No title'}</div>
                <div class="video-stats">
                    <span>👁️ ${formatNumber(video.stats?.totalViews || 0)}</span>
                    <span>❤️ ${formatNumber(video.stats?.totalLikes || 0)}</span>
                    <span>💬 ${formatNumber(video.stats?.totalComments || 0)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function updateDailyTrendTable(trend) {
    const tbody = document.getElementById('dailyTrendTable');
    if (!tbody || !trend) return;
    
    tbody.innerHTML = trend.map(day => `
        <tr>
            <td>${new Date(day.date).toLocaleDateString()}</td>
            <td>${formatNumber(day.views)}</td>
            <td>${formatNumber(day.likes)}</td>
            <td>${formatNumber(day.comments || 0)}</td>
            <td>${formatNumber(day.newFollowers)}</td>
            <td>$${formatNumber(day.revenue)}</td>
        </tr>
    `).join('');
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

// Period selector
document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPeriod = btn.dataset.period;
        fetchAnalytics();
    });
});

// Initialize
initCharts();
fetchAnalytics();
fetchTopVideos();
