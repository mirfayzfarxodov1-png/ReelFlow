// ============ NOTIFICATION SCHEMA ============

const NotificationSchema = {
    // Qabul qiluvchi
    user: {
        type: ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Turi
    type: {
        type: String,
        enum: [
            'like', 'comment', 'follow', 'mention',
            'share', 'message', 'verified', 'achievement',
            'report_resolved', 'video_approved', 'live_start'
        ],
        required: true,
        index: true
    },
    
    // Aloqalar
    from: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    targetId: {
        type: ObjectId,
        required: true
    },
    targetType: {
        type: String,
        enum: ['video', 'comment', 'story', 'user'],
        required: true
    },
    
    // Kontent
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
    
    // Holati
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    isClicked: {
        type: Boolean,
        default: false
    },
    
    // Vaqt
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    readAt: {
        type: Date,
        default: null
    }
};

// Indexes
NotificationSchema.index({ user: 1, createdAt: -1 });
NotificationSchema.index({ user: 1, isRead: 1 });
