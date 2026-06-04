const Analytics = require('./analytics.model');
const Video = require('../backend/models/Video');
const User = require('../backend/models/User');
const Comment = require('../backend/models/Comment');

class AnalyticsService {
    
    // Ko'rish qo'shish
    async addView(videoId, userId, watchTime, completed) {
        const date = new Date();
        const hour = new Date(date.setMinutes(0, 0, 0));
        const day = new Date(date.setHours(0, 0, 0));
        
        // Update video analytics
        await Analytics.findOneAndUpdate(
            { entityId: videoId, entityType: 'video', period: 'hour', date: hour },
            { $inc: { views: 1, uniqueViews: userId ? 1 : 0, averageWatchTime: watchTime } },
            { upsert: true }
        );
        
        await Analytics.findOneAndUpdate(
            { entityId: videoId, entityType: 'video', period: 'day', date: day },
            { $inc: { views: 1, uniqueViews: userId ? 1 : 0, averageWatchTime: watchTime } },
            { upsert: true }
        );
        
        if (completed) {
            await Analytics.findOneAndUpdate(
                { entityId: videoId, entityType: 'video', period: 'day', date: day },
                { $inc: { completionRate: 1 } },
                { upsert: true }
            );
        }
    }
    
    // Layk qo'shish
    async addLike(videoId) {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        
        await Analytics.findOneAndUpdate(
            { entityId: videoId, entityType: 'video', period: 'day', date: day },
            { $inc: { likes: 1 } },
            { upsert: true }
        );
    }
    
    // Izoh qo'shish
    async addComment(videoId) {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        
        await Analytics.findOneAndUpdate(
            { entityId: videoId, entityType: 'video', period: 'day', date: day },
            { $inc: { comments: 1 } },
            { upsert: true }
        );
    }
    
    // Ulashish qo'shish
    async addShare(videoId) {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        
        await Analytics.findOneAndUpdate(
            { entityId: videoId, entityType: 'video', period: 'day', date: day },
            { $inc: { shares: 1 } },
            { upsert: true }
        );
    }
    
    // Kuzatuvchi qo'shish
    async addFollower(userId) {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        
        await Analytics.findOneAndUpdate(
            { entityId: userId, entityType: 'user', period: 'day', date: day },
            { $inc: { newFollowers: 1 } },
            { upsert: true }
        );
    }
    
    // Daromad qo'shish
    async addRevenue(userId, amount, type) {
        const day = new Date();
        day.setHours(0, 0, 0, 0);
        
        const update = type === 'ad' ? { adRevenue: amount } : { giftRevenue: amount };
        
        await Analytics.findOneAndUpdate(
            { entityId: userId, entityType: 'user', period: 'day', date: day },
            { $inc: { revenue: amount, ...update } },
            { upsert: true }
        );
    }
    
    // Video statistikasini olish
    async getVideoStats(videoId, period = 'week') {
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'day':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 7));
        }
        
        const stats = await Analytics.aggregate([
            {
                $match: {
                    entityId: mongoose.Types.ObjectId(videoId),
                    entityType: 'video',
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    totalComments: { $sum: '$comments' },
                    totalShares: { $sum: '$shares' },
                    avgWatchTime: { $avg: '$averageWatchTime' },
                    completionRate: { $avg: '$completionRate' }
                }
            }
        ]);
        
        return stats[0] || {
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            avgWatchTime: 0,
            completionRate: 0
        };
    }
    
    // Foydalanuvchi statistikasini olish
    async getUserStats(userId, period = 'month') {
        const now = new Date();
        const startDate = new Date(now.setMonth(now.getMonth() - 1));
        
        const stats = await Analytics.aggregate([
            {
                $match: {
                    entityId: mongoose.Types.ObjectId(userId),
                    entityType: 'user',
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    totalComments: { $sum: '$comments' },
                    totalShares: { $sum: '$shares' },
                    newFollowers: { $sum: '$newFollowers' },
                    revenue: { $sum: '$revenue' },
                    adRevenue: { $sum: '$adRevenue' },
                    giftRevenue: { $sum: '$giftRevenue' }
                }
            }
        ]);
        
        // Get daily trend
        const dailyTrend = await Analytics.find({
            entityId: userId,
            entityType: 'user',
            date: { $gte: startDate }
        }).sort({ date: 1 });
        
        return {
            summary: stats[0] || {
                totalViews: 0,
                totalLikes: 0,
                totalComments: 0,
                totalShares: 0,
                newFollowers: 0,
                revenue: 0,
                adRevenue: 0,
                giftRevenue: 0
            },
            dailyTrend: dailyTrend.map(d => ({
                date: d.date,
                views: d.views,
                likes: d.likes,
                newFollowers: d.newFollowers,
                revenue: d.revenue
            }))
        };
    }
    
    // Top videolar
    async getTopVideos(userId, limit = 10) {
        const videos = await Video.find({ user: userId })
            .select('_id title thumbnailUrl views likesCount');
        
        const videoIds = videos.map(v => v._id);
        
        const stats = await Analytics.aggregate([
            {
                $match: {
                    entityId: { $in: videoIds },
                    entityType: 'video',
                    period: 'day'
                }
            },
            {
                $group: {
                    _id: '$entityId',
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    totalComments: { $sum: '$comments' }
                }
            },
            { $sort: { totalViews: -1 } },
            { $limit: limit }
        ]);
        
        return stats.map(stat => {
            const video = videos.find(v => v._id.toString() === stat._id.toString());
            return {
                video,
                stats: stat
            };
        });
    }
    
    // Platforma umumiy statistikasi (admin)
    async getPlatformStats(period = 'week') {
        const now = new Date();
        const startDate = new Date(now.setDate(now.getDate() - 7));
        
        const stats = await Analytics.aggregate([
            {
                $match: {
                    date: { $gte: startDate },
                    period: 'day'
                }
            },
            {
                $group: {
                    _id: null,
                    totalViews: { $sum: '$views' },
                    totalLikes: { $sum: '$likes' },
                    totalComments: { $sum: '$comments' },
                    totalShares: { $sum: '$shares' },
                    totalRevenue: { $sum: '$revenue' }
                }
            }
        ]);
        
        // Active users
        const activeUsers = await Analytics.distinct('entityId', {
            entityType: 'user',
            date: { $gte: startDate },
            views: { $gt: 0 }
        });
        
        return {
            summary: stats[0] || {
                totalViews: 0,
                totalLikes: 0,
                totalComments: 0,
                totalShares: 0,
                totalRevenue: 0
            },
            activeUsers: activeUsers.length,
            period
        };
    }
}

module.exports = new AnalyticsService();
