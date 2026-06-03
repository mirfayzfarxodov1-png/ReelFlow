// ============ ANALYTICS SCHEMA ============

const AnalyticsSchema = {
    // Foydalanuvchi yoki video
    entityId: {
        type: ObjectId,
        required: true,
        index: true
    },
    entityType: {
        type: String,
        enum: ['user', 'video', 'story', 'channel'],
        required: true
    },
    
    // Vaqt davri
    period: {
        type: String,
        enum: ['hour', 'day', 'week', 'month'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    
    // Statistika
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: {
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
    
    // Engagement
    engagementRate: {
        type: Number,
        default: 0
    },
    averageWatchTime: {
        type: Number,
        default: 0
    },
    completionRate: {
        type: Number,
        default: 0
    },
    
    // Tomoshabinlar
    uniqueViewers: {
        type: Number,
        default: 0
    },
    newFollowers: {
        type: Number,
        default: 0
    },
    
    // Demografiya (ajratilgan kolleksiya)
    demographics: {
        ageGroups: Map,
        genders: Map,
        locations: Map,
        devices: Map
    },
    
    // Vaqt
    createdAt: {
        type: Date,
        default: Date.now
    }
};

// Indexes
AnalyticsSchema.index({ entityId: 1, period: 1, date: 1 });
AnalyticsSchema.index({ date: -1 });
