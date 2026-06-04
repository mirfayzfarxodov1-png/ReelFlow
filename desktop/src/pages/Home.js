import { VideoCard } from '../components/VideoCard.js';
import { TopBar } from '../components/TopBar.js';

export function HomePage({ videos, onPlay, onSearch }) {
    return `
        <div class="page active" id="home-page">
            ${TopBar({ title: 'Bosh sahifa', onSearch })}
            <div class="videos-grid" id="videos-grid">
                ${videos.map(video => VideoCard({ video, onPlay })).join('')}
            </div>
        </div>
    `;
}
