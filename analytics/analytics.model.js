const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
    // Qaysi entity uchun
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    entityType: {
        type: String,
        enum: ['user', 'video', 'channel', 'story'],
        required: true
    },
    
    // Vaqt davri
    period: {
        type: String,
        enum: ['hour', 'day', 'week', 'month', 'year'],
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    
    // Asosiy statistika
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    saves: { type: Number, default: 0 },
    
    // Engagement
    engagementRate: { type: Number, default: 0 },
    averageWatchTime: { type: Number, default: 0 }, // seconds
    completionRate: { type: Number, default: 0 }, // percentage
    
    // Foydalanuvchi statistikasi
    newFollowers: { type: Number, default: 0 },
    lostFollowers: { type: Number, default: 0 },
    
    // Video statistikasi
    videoCount: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 }, // seconds
    
    // Daromad
    revenue: { type: Number, default: 0 },
    adRevenue: { type: Number, default: 0 },
    giftRevenue: { type: Number, default: 0 },
    
    // Demografiya (qo'shimcha kolleksiyada)
    demographics: {
        ageGroups: Map,
        genders: Map,
        countries: Map,
        cities: Map,
        devices: Map,
        sources: Map
    },
    
    createdAt: { type: Date, default: Date.now }
});

// Indexes
AnalyticsSchema.index({ entityId: 1, period: 1, date: 1 });
AnalyticsSchema.index({ date: -1 });
AnalyticsSchema.index({ entityType: 1, date: -1 });

module.exports = mongoose.model('Analytics', AnalyticsSchema);
