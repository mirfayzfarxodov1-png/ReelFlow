const Queue = require('bull');
const VideoEncoder = require('./video-encoder');
const ThumbnailGenerator = require('./thumbnail-generator');
const Watermark = require('./watermark');
const path = require('path');
const fs = require('fs');

// Create queues
const videoEncodingQueue = new Queue('video encoding', {
    redis: { port: 6379, host: 'localhost' }
});

const thumbnailQueue = new Queue('thumbnail generation', {
    redis: { port: 6379, host: 'localhost' }
});

// Video encoding worker
videoEncodingQueue.process(async (job) => {
    const { inputPath, outputDir, videoId, options } = job.data;
    
    try {
        console.log(`Starting encoding for video: ${videoId}`);
        
        // Get video info
        const videoInfo = await VideoEncoder.getVideoInfo(inputPath);
        
        // Encode to different resolutions
        const encodedVideos = await VideoEncoder.encodeVideo(inputPath, outputDir, videoId);
        
        // Generate HLS stream
        const hlsStream = await VideoEncoder.encodeToHLS(inputPath, outputDir, videoId);
        
        // Generate thumbnails
        const thumbnails = await ThumbnailGenerator.generateMultipleThumbnails(
            inputPath, 
            path.join(outputDir, 'thumbnails'), 
            videoId, 
            5
        );
        
        // Generate sprite sheet
        const spriteSheet = await ThumbnailGenerator.generateSpriteSheet(
            inputPath,
            path.join(outputDir, `${videoId}_sprite.jpg`),
            videoId
        );
        
        // Add watermark if option enabled
        let watermarkedPath = inputPath;
        if (options.addWatermark) {
            const watermarkOutput = path.join(outputDir, `${videoId}_watermarked.mp4`);
            watermarkedPath = await Watermark.addTextWatermark(
                inputPath,
                watermarkOutput,
                'ReelFlow',
                { x: 10, y: 10 }
            );
        }
        
        return {
            videoId,
            videoInfo,
            encodedVideos,
            hlsStream,
            thumbnails,
            spriteSheet,
            watermarkedPath,
            status: 'completed'
        };
        
    } catch (error) {
        console.error(`Encoding failed for ${videoId}:`, error);
        throw error;
    }
});

// Thumbnail generation worker
thumbnailQueue.process(async (job) => {
    const { videoPath, outputDir, videoId } = job.data;
    
    try {
        const mainThumbnail = await ThumbnailGenerator.generateThumbnail(
            videoPath,
            path.join(outputDir, `${videoId}_main.jpg`),
            '00:00:03'
        );
        
        const thumbnails = await ThumbnailGenerator.generateMultipleThumbnails(
            videoPath,
            outputDir,
            videoId,
            10
        );
        
        return {
            videoId,
            mainThumbnail,
            thumbnails,
            status: 'completed'
        };
        
    } catch (error) {
        console.error(`Thumbnail generation failed for ${videoId}:`, error);
        throw error;
    }
});

// Add job to queue
async function addToEncodingQueue(inputPath, outputDir, videoId, options = {}) {
    const job = await videoEncodingQueue.add({
        inputPath,
        outputDir,
        videoId,
        options
    });
    
    return job;
}

// Add thumbnail job to queue
async function addToThumbnailQueue(videoPath, outputDir, videoId) {
    const job = await thumbnailQueue.add({
        videoPath,
        outputDir,
        videoId
    });
    
    return job;
}

// Get job status
async function getJobStatus(jobId) {
    const job = await videoEncodingQueue.getJob(jobId);
    if (!job) return null;
    
    const state = await job.getState();
    const progress = job.progress();
    const result = job.returnvalue;
    
    return {
        id: jobId,
        state,
        progress,
        result
    };
}

module.exports = {
    addToEncodingQueue,
    addToThumbnailQueue,
    getJobStatus,
    videoEncodingQueue,
    thumbnailQueue
};
