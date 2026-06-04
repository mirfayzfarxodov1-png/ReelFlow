const express = require('express');
const router = express.Router();
const { protect } = require('../backend/middleware/auth');
const Notification = require('./notification.model');
const PushService = require('./push.service');

// Get user notifications
router.get('/', protect, async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly = false } = req.query;
        
        const query = { userId: req.user._id };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }
        
        const notifications = await Notification.find(query)
            .populate('from', 'username avatar fullName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));
        
        const total = await Notification.countDocuments(query);
        
        res.json({
            notifications,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get unread count
router.get('/unread/count', protect, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user._id,
            isRead: false
        });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark notification as read
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { isRead: true, readAt: new Date() },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true, readAt: new Date() }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete notification
router.delete('/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json({ message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register device token
router.post('/device-token', protect, async (req, res) => {
    try {
        const { token, deviceType } = req.body;
        
        if (!token) {
            return res.status(400).json({ message: 'Device token required' });
        }
        
        await PushService.saveDeviceToken(req.user._id, token, deviceType || 'mobile');
        res.json({ message: 'Device token registered' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Remove device token
router.delete('/device-token', protect, async (req, res) => {
    try {
        const { token } = req.body;
        await PushService.removeDeviceToken(req.user._id, token);
        res.json({ message: 'Device token removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Test notification
router.post('/test', protect, async (req, res) => {
    try {
        const { title, body } = req.body;
        const notification = await PushService.sendNotification(
            req.user._id,
            title || 'Test Notification',
            body || 'Bu test xabari',
            { type: 'test' },
            'test'
        );
        res.json({ message: 'Test notification sent', notification });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
