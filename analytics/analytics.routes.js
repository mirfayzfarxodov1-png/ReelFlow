const express = require('express');
const router = express.Router();
const { protect } = require('../backend/middleware/auth');
const AnalyticsService = require('./analytics.service');

// Get video statistics
router.get('/video/:videoId', protect, async (req, res) => {
    try {
        const { period } = req.query;
        const stats = await AnalyticsService.getVideoStats(req.params.videoId, period);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user statistics
router.get('/user', protect, async (req, res) => {
    try {
        const { period } = req.query;
        const stats = await AnalyticsService.getUserStats(req.user._id, period);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get top videos
router.get('/top-videos', protect, async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const topVideos = await AnalyticsService.getTopVideos(req.user._id, parseInt(limit));
        res.json(topVideos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get platform stats (admin only)
router.get('/platform', protect, async (req, res) => {
    try {
        // Check if admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        
        const { period } = req.query;
        const stats = await AnalyticsService.getPlatformStats(period);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Track view (internal endpoint)
router.post('/track/view', async (req, res) => {
    try {
        const { videoId, userId, watchTime, completed } = req.body;
        await AnalyticsService.addView(videoId, userId, watchTime, completed);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Track like (internal endpoint)
router.post('/track/like', async (req, res) => {
    try {
        const { videoId } = req.body;
        await AnalyticsService.addLike(videoId);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
