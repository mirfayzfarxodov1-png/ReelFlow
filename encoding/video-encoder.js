const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs = require('fs');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegInstaller.path);

class VideoEncoder {
    constructor() {
        this.resolutions = [
            { name: '360p', width: 640, height: 360, bitrate: '800k', audioBitrate: '96k' },
            { name: '480p', width: 854, height: 480, bitrate: '1200k', audioBitrate: '128k' },
            { name: '720p', width: 1280, height: 720, bitrate: '2500k', audioBitrate: '128k' },
            { name: '1080p', width: 1920, height: 1080, bitrate: '5000k', audioBitrate: '192k' }
        ];
    }

    // Video kodlash
    async encodeVideo(inputPath, outputDir, videoId) {
        const outputs = [];
        
        for (const res of this.resolutions) {
            const outputPath = path.join(outputDir, `${videoId}_${res.name}.mp4`);
            
            try {
                await new Promise((resolve, reject) => {
                    ffmpeg(inputPath)
                        .videoCodec('libx264')
                        .audioCodec('aac')
                        .size(`${res.width}x${res.height}`)
                        .videoBitrate(res.bitrate)
                        .audioBitrate(res.audioBitrate)
                        .format('mp4')
                        .outputOptions([
                            '-preset fast',
                            '-crf 23',
                            '-movflags +faststart'
                        ])
                        .on('start', (command) => {
                            console.log(`Encoding ${res.name}:`, command);
                        })
                        .on('progress', (progress) => {
                            console.log(`Processing ${res.name}: ${progress.percent}% done`);
                        })
                        .on('end', () => {
                            outputs.push({
                                resolution: res.name,
                                width: res.width,
                                height: res.height,
                                path: outputPath,
                                bitrate: res.bitrate,
                                size: fs.statSync(outputPath).size
                            });
                            resolve();
                        })
                        .on('error', (err) => {
                            reject(err);
                        })
                        .save(outputPath);
                });
            } catch (error) {
                console.error(`Error encoding ${res.name}:`, error);
            }
        }
        
        return outputs;
    }

    // HLS formatida kodlash (adaptive streaming)
    async encodeToHLS(inputPath, outputDir, videoId) {
        const outputPath = path.join(outputDir, `${videoId}.m3u8`);
        const segmentPath = path.join(outputDir, `${videoId}_%03d.ts`);
        
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .outputOptions([
                    '-codec: copy',
                    '-start_number 0',
                    '-hls_time 10',
                    '-hls_list_size 0',
                    '-hls_segment_filename', segmentPath,
                    '-f hls'
                ])
                .output(outputPath)
                .on('end', () => {
                    console.log('HLS encoding completed');
                    resolve({
                        playlist: outputPath,
                        segments: segmentPath,
                        duration: this.getVideoDuration(inputPath)
                    });
                })
                .on('error', (err) => {
                    reject(err);
                })
                .run();
        });
    }

    // Video ma'lumotlarini olish
    async getVideoInfo(inputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) reject(err);
                
                const videoStream = metadata.streams.find(s => s.codec_type === 'video');
                const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
                
                resolve({
                    duration: metadata.format.duration,
                    size: metadata.format.size,
                    bitrate: metadata.format.bit_rate,
                    format: metadata.format.format_name,
                    video: {
                        codec: videoStream?.codec_name,
                        width: videoStream?.width,
                        height: videoStream?.height,
                        fps: eval(videoStream?.r_frame_rate),
                        bitrate: videoStream?.bit_rate
                    },
                    audio: {
                        codec: audioStream?.codec_name,
                        channels: audioStream?.channels,
                        sampleRate: audioStream?.sample_rate,
                        bitrate: audioStream?.bit_rate
                    }
                });
            });
        });
    }

    // Video duration olish
    getVideoDuration(inputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(inputPath, (err, metadata) => {
                if (err) reject(err);
                resolve(metadata.format.duration);
            });
        });
    }

    // Videoni qisqartirish (trim)
    async trimVideo(inputPath, outputPath, startTime, duration) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .setStartTime(startTime)
                .duration(duration)
                .output(outputPath)
                .on('end', () => {
                    console.log('Video trimmed successfully');
                    resolve(outputPath);
                })
                .on('error', reject)
                .run();
        });
    }

    // Videoni birlashtirish (merge)
    async mergeVideos(videoPaths, outputPath) {
        const listFile = path.join(path.dirname(outputPath), 'list.txt');
        const listContent = videoPaths.map(p => `file '${p}'`).join('\n');
        fs.writeFileSync(listFile, listContent);
        
        return new Promise((resolve, reject) => {
            ffmpeg()
                .input(listFile)
                .inputOptions(['-f concat', '-safe 0'])
                .output(outputPath)
                .on('end', () => {
                    fs.unlinkSync(listFile);
                    resolve(outputPath);
                })
                .on('error', reject)
                .run();
        });
    }

    // Tezlikni o'zgartirish (speed)
    async changeSpeed(inputPath, outputPath, speed) {
        const filter = `setpts=${1/speed}*PTS`;
        const audioFilter = `atempo=${speed}`;
        
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoFilter(filter)
                .audioFilters(audioFilter)
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .run();
        });
    }

    // Videoni aylantirish (rotate)
    async rotateVideo(inputPath, outputPath, rotation) {
        const rotations = {
            90: 'transpose=1',
            180: 'transpose=2,transpose=2',
            270: 'transpose=2'
        };
        
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoFilter(rotations[rotation] || rotations[90])
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .run();
        });
    }

    // Videoni teskari aylantirish (reverse)
    async reverseVideo(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .videoFilter('reverse')
                .audioFilter('areverse')
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .run();
        });
    }

    // GIF yaratish
    async createGif(inputPath, outputPath, startTime, duration, width = 480) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .setStartTime(startTime)
                .duration(duration)
                .size(`${width}?`)
                .fps(10)
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .run();
        });
    }
}

module.exports = new VideoEncoder();
