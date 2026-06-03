// ============ VIDEO SCHEMA ============

const VideoSchema = {
    // Asosiy ma'lumotlar
    title: {
        type: String,
        required: true,
        maxlength: 100,
        index: true
    },
    description: {
        type: String,
        maxlength: 500,
        default: ''
    },
    videoUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        default: ''
    },
    
    // Foydalanuvchi
    user: {
        type: ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Statistika
    views: {
        type: Number,
        default: 0,
        index: true
    },
    likes: [{
        type: ObjectId,
        ref: 'User'
    }],
    likesCount: {
        type: Number,
        default: 0,
        index: true
    },
    comments: [{
        type: ObjectId,
        ref: 'Comment'
    }],
    commentsCount: {
        type: Number,
        default: 0
    },
    shares: {
        type: Number,
        default: 0
    },
    saves: {
        type: Number,
        default: 0
    },
    
    // Video ma'lumotlari
    duration: {
        type: Number,
        default: 0
    },
    size: {
        type: Number,
        default: 0
    },
    resolution: {
        type: String,
        default: '720p'
    },
    
    // Kontent
    hashtags: [{
        type: String,
        index: true
    }],
    mentions: [{
        type: ObjectId,
        ref: 'User'
    }],
    musicId: {
        type: ObjectId,
        ref: 'Music'
    },
    location: {
        type: String,
        default: ''
    },
    
    // Holati
    isPrivate: {
        type: Boolean,
        default: false,
        index: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdult: {
        type: Boolean,
        default: false
    },
    
    // Moderatsiya
    reportCount: {
        type: Number,
        default: 0
    },
    moderationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    
    // Monetizatsiya
    monetizationEnabled: {
        type: Boolean,
        default: false
    },
    adRevenue: {
        type: Number,
        default: 0
    },
    
    // Vaqt
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    publishedAt: {
        type: Date,
        default: Date.now,
        index: true
    }
};

// Indexes
VideoSchema.index({ title: 'text', description: 'text', hashtags: 'text' });
VideoSchema.index({ createdAt: -1, views: -1, likesCount: -1 });
VideoSchema.index({ user: 1, createdAt: -1 });
VideoSchema.index({ hashtags: 1, createdAt: -1 });
