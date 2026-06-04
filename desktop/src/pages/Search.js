import { VideoCard } from '../components/VideoCard.js';
import { TopBar } from '../components/TopBar.js';

export function SearchPage({ results, onPlay, onSearch }) {
    return `
        <div class="page" id="search-page">
            ${TopBar({ title: 'Qidiruv', onSearch })}
            <div class="search-results" id="search-results">
                ${results.length > 0 ? `
                    <div class="videos-grid">
                        ${results.map(video => VideoCard({ video, onPlay })).join('')}
                    </div>
                ` : `
                    <div class="empty-state">
                        <div class="empty-icon">🔍</div>
                        <h3>Hech narsa topilmadi</h3>
                        <p>Qidiruv so'zini o'zgartirib ko'ring</p>
                    </div>
                `}
            </div>
        </div>
    `;
}
