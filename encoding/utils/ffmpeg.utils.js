const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

// Check if ffmpeg is installed
async function checkFFmpeg() {
    return new Promise((resolve) => {
        ffmpeg.getAvailableFormats((err, formats) => {
            if (err) {
                console.error('FFmpeg not found:', err);
                resolve(false);
            } else {
                console.log('FFmpeg is ready');
                resolve(true);
            }
        });
    });
}

// Get supported formats
async function getSupportedFormats() {
    return new Promise((resolve, reject) => {
        ffmpeg.getAvailableFormats((err, formats) => {
            if (err) reject(err);
            resolve(Object.keys(formats));
        });
    });
}

// Get supported codecs
async function getSupportedCodecs() {
    return new Promise((resolve, reject) => {
        ffmpeg.getAvailableCodecs((err, codecs) => {
            if (err) reject(err);
            resolve(codecs);
        });
    });
}

// Clean up temp files
function cleanupTempFiles(tempDir, hours = 24) {
    if (!fs.existsSync(tempDir)) return;
    
    const now = Date.now();
    const cutoff = now - (hours * 60 * 60 * 1000);
    
    fs.readdirSync(tempDir).forEach(file => {
        const filePath = path.join(tempDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtimeMs < cutoff) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up: ${file}`);
        }
    });
}

module.exports = {
    checkFFmpeg,
    getSupportedFormats,
    getSupportedCodecs,
    cleanupTempFiles
};
