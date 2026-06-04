export function PlayerControls({ isPlaying, isMuted, volume, onPlay, onPause, onMute, onVolumeChange, onFullscreen }) {
    return `
        <div class="player-controls">
            <button class="control-btn" id="play-pause-btn">
                ${isPlaying ? '⏸️' : '▶️'}
            </button>
            
            <div class="progress-container">
                <span class="current-time" id="current-time">0:00</span>
                <div class="progress-bar" id="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                <span class="total-time" id="total-time">0:00</span>
            </div>
            
            <div class="volume-control">
                <button class="control-btn" id="mute-btn">
                    ${isMuted ? '🔇' : volume > 0.5 ? '🔊' : '🔉'}
                </button>
                <input type="range" class="volume-slider" id="volume-slider" min="0" max="1" step="0.01" value="${volume}">
            </div>
            
            <button class="control-btn" id="fullscreen-btn">⛶</button>
        </div>
    `;
}
