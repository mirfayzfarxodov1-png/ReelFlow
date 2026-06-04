const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

class ThumbnailGenerator {
    
    // Video thumbnail yaratish
    async generateThumbnail(videoPath, outputPath, timestamp = '00:00:05') {
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: [timestamp],
                    filename: path.basename(outputPath),
                    folder: path.dirname(outputPath),
                    size: '1280x720'
                })
                .on('end', () => {
                    console.log('Thumbnail generated:', outputPath);
                    resolve(outputPath);
                })
                .on('error', reject);
        });
    }

    // Bir nechta thumbnail yaratish
    async generateMultipleThumbnails(videoPath, outputDir, videoId, count = 5) {
        const timestamps = [];
        const duration = await this.getVideoDuration(videoPath);
        const interval = duration / (count + 1);
        
        for (let i = 1; i <= count; i++) {
            timestamps.push(interval * i);
        }
        
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: timestamps,
                    filename: `${videoId}_%s.jpg`,
                    folder: outputDir,
                    size: '640x360'
                })
                .on('end', () => {
                    const thumbnails = timestamps.map((t, i) => ({
                        timestamp: t,
                        path: path.join(outputDir, `${videoId}_${i + 1}.jpg`)
                    }));
                    resolve(thumbnails);
                })
                .on('error', reject);
        });
    }

    // Sprite sheet yaratish (video preview uchun)
    async generateSpriteSheet(videoPath, outputPath, videoId) {
        const cols = 5;
        const rows = 5;
        const total = cols * rows;
        const duration = await this.getVideoDuration(videoPath);
        const interval = duration / total;
        
        const timestamps = [];
        for (let i = 0; i < total; i++) {
            timestamps.push(interval * i);
        }
        
        const tempDir = path.join(path.dirname(outputPath), 'temp_sprites');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }
        
        // Generate individual thumbnails
        const thumbnails = [];
        for (let i = 0; i < timestamps.length; i++) {
            const thumbPath = path.join(tempDir, `thumb_${i}.jpg`);
            await this.generateThumbnailAtTime(videoPath, thumbPath, timestamps[i], '160x90');
            thumbnails.push(thumbPath);
        }
        
        // Combine into sprite sheet
        return new Promise((resolve, reject) => {
            const filter = `tile=${cols}x${rows}`;
            ffmpeg()
                .input(`concat:${thumbnails.join('|')}`)
                .inputOptions(['-f image2', '-r 1'])
                .videoFilter(filter)
                .output(outputPath)
                .on('end', () => {
                    // Clean up temp files
                    thumbnails.forEach(f => fs.unlinkSync(f));
                    fs.rmdirSync(tempDir);
                    resolve(outputPath);
                })
                .on('error', reject)
                .run();
        });
    }

    async generateThumbnailAtTime(videoPath, outputPath, timestamp, size = '320x180') {
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: [timestamp],
                    filename: path.basename(outputPath),
                    folder: path.dirname(outputPath),
                    size: size
                })
                .on('end', () => resolve(outputPath))
                .on('error', reject);
        });
    }

    getVideoDuration(videoPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) reject(err);
                resolve(metadata.format.duration);
            });
        });
    }
}

module.exports = new ThumbnailGenerator();
