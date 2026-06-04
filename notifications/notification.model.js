const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: [
            'like', 'comment', 'follow', 'mention',
            'share', 'message', 'verified', 'achievement',
            'report_resolved', 'video_approved', 'live_start',
            'subscription', 'gift', 'earning'
        ],
        required: true
    },
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId
    },
    targetType: {
        type: String,
        enum: ['video', 'comment', 'story', 'user', 'message']
    },
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    data: {
        type: Map,
        of: String,
        default: {}
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    isClicked: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    readAt: {
        type: Date,
        default: null
    }
});

// Indexes
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
