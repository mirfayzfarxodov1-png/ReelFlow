const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// Upload video
router.post('/upload', protect, upload.single('video'), async (req, res) => {
    try {
        const { title, description, hashtags } = req.body;
        const videoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        const video = await Video.create({
            title,
            description,
            videoUrl,
            user: req.user._id,
            hashtags: hashtags ? hashtags.split(',') : []
        });

        await User.findByIdAndUpdate(req.user._id, {
            $push: { videos: video._id }
        });

        res.status(201).json(video);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all videos (for home feed)
router.get('/feed', protect, async (req, res) => {
    try {
        const videos = await Video.find({ isPrivate: false })
            .populate('user', 'username avatar fullName')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single video
router.get('/:id', async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate('user', 'username avatar fullName followers')
            .populate('comments');
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        video.views += 1;
        await video.save();

        res.json(video);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Like video
router.put('/:id/like', protect, async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        if (video.likes.includes(req.user._id)) {
            video.likes = video.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            video.likes.push(req.user._id);
        }

        await video.save();
        res.json({ likes: video.likes.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user videos
router.get('/user/:userId', async (req, res) => {
    try {
        const videos = await Video.find({ user: req.params.userId, isPrivate: false })
            .sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
