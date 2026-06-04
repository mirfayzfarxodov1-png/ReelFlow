export function UploadPage({ onUpload, uploading, progress }) {
    return `
        <div class="page" id="upload-page">
            <div class="top-bar">
                <h1 class="page-title">Video yuklash</h1>
            </div>
            
            <div class="upload-container">
                <div class="upload-box" id="upload-box">
                    <div class="upload-icon">📹</div>
                    <h3>Video yuklash</h3>
                    <p>Video faylni tanlang yoki shu yerga tashlang</p>
                    <input type="file" id="video-file" accept="video/*" style="display:none">
                    <button class="upload-btn" id="select-video-btn">Video tanlash</button>
                    
                    ${uploading ? `
                        <div class="upload-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progress}%"></div>
                            </div>
                            <span class="progress-text">${progress}%</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}
