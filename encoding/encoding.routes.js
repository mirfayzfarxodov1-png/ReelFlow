const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../backend/middleware/auth');
const VideoEncoder = require('./video-encoder');
const ThumbnailGenerator = require('./thumbnail-generator');
const Watermark = require('./watermark');
const { addToEncodingQueue, getJobStatus } = require('./queue-worker');
const Video = require('../backend/models/Video');

// Configure multer for video upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads/temp');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `temp_${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid video format'));
        }
    }
});

// Upload and encode video
router.post('/upload', protect, upload.single('video'), async (req, res) => {
    try {
        const { title, description, hashtags, addWatermark } = req.body;
        const tempPath = req.file.path;
        const videoId = new mongoose.Types.ObjectId();
        
        // Get video info
        const videoInfo = await VideoEncoder.getVideoInfo(tempPath);
        
        // Create video record
        const video = await Video.create({
            _id: videoId,
            title,
            description,
            user: req.user._id,
            hashtags: hashtags ? hashtags.split(',') : [],
            duration: videoInfo.duration,
            size: videoInfo.size,
            status: 'processing'
        });
        
        // Create output directory
        const outputDir = path.join(__dirname, `../uploads/videos/${videoId}`);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Add to encoding queue
        const job = await addToEncodingQueue(tempPath, outputDir, videoId.toString(), {
            addWatermark: addWatermark === 'true'
        });
        
        res.json({
            videoId,
            jobId: job.id,
            message: 'Video uploaded, encoding started',
            videoInfo
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get encoding status
router.get('/status/:jobId', protect, async (req, res) => {
    try {
        const status = await getJobStatus(req.params.jobId);
        res.json(status);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Generate thumbnail for existing video
router.post('/thumbnail/:videoId', protect, async (req, res) => {
    try {
        const video = await Video.findById(req.params.videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        const videoPath = video.videoUrl.replace('/uploads/', './uploads/');
        const outputDir = path.join(__dirname, `../uploads/thumbnails/${video._id}`);
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const thumbnail = await ThumbnailGenerator.generateThumbnail(
            videoPath,
            path.join(outputDir, 'main.jpg'),
            req.body.timestamp || '00:00:03'
        );
        
        video.thumbnailUrl = `/uploads/thumbnails/${video._id}/main.jpg`;
        await video.save();
        
        res.json({ thumbnail: video.thumbnailUrl });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add watermark to video
router.post('/watermark/:videoId', protect, async (req, res) => {
    try {
        const video = await Video.findById(req.params.videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        if (video.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        
        const videoPath = video.videoUrl.replace('/uploads/', './uploads/');
        const outputDir = path.dirname(videoPath);
        const outputPath = path.join(outputDir, `watermarked_${path.basename(videoPath)}`);
        
        const watermarked = await Watermark.addTextWatermark(
            videoPath,
            outputPath,
            req.user.username,
            { x: 10, y: 10, fontSize: 20 }
        );
        
        video.watermarkedUrl = watermarked.replace('./uploads/', '/uploads/');
        await video.save();
        
        res.json({ watermarkedUrl: video.watermarkedUrl });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get video info
router.get('/info/:videoId', protect, async (req, res) => {
    try {
        const video = await Video.findById(req.params.videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        const videoPath = video.videoUrl.replace('/uploads/', './uploads/');
        const info = await VideoEncoder.getVideoInfo(videoPath);
        
        res.json(info);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Trim video
router.post('/trim/:videoId', protect, async (req, res) => {
    try {
        const { startTime, duration } = req.body;
        const video = await Video.findById(req.params.videoId);
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }
        
        const videoPath = video.videoUrl.replace('/uploads/', './uploads/');
        const outputDir = path.dirname(videoPath);
        const outputPath = path.join(outputDir, `trimmed_${Date.now()}.mp4`);
        
        const trimmed = await VideoEncoder.trimVideo(videoPath, outputPath, startTime, duration);
        
        res.json({ trimmedUrl: trimmed.replace('./uploads/', '/uploads/') });
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
