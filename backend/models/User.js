const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    // Asosiy ma'lumotlar
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    fullName: {
        type: String,
        default: '',
        maxlength: 50
    },
    bio: {
        type: String,
        default: '',
        maxlength: 150
    },
    avatar: {
        type: String,
        default: 'https://reelflow.com/default-avatar.png'
    },
    website: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    
    // Ijtimoiy ma'lumotlar
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    savedVideos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video'
    }],
    savedStories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story'
    }],
    
    // Hisob holati
    isVerified: {
        type: Boolean,
        default: false
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    
    // Moderatsiya
    reportCount: {
        type: Number,
        default: 0
    },
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    mutedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // Statistika (cache)
    stats: {
        videoCount: { type: Number, default: 0 },
        storyCount: { type: Number, default: 0 },
        followerCount: { type: Number, default: 0 },
        followingCount: { type: Number, default: 0 },
        totalLikes: { type: Number, default: 0 },
        totalViews: { type: Number, default: 0 }
    },
    
    // Monetizatsiya
    wallet: {
        balance: { type: Number, default: 0 },
        totalEarned: { type: Number, default: 0 },
        totalWithdrawn: { type: Number, default: 0 }
    },
    
    // ============ PUSH NOTIFICATION QISMI ============
    
    // Device tokenlar (FCM uchun)
    deviceTokens: [{
        token: {
            type: String,
            required: true
        },
        deviceType: {
            type: String,
            enum: ['ios', 'android', 'web'],
            default: 'mobile'
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        lastUsed: {
            type: Date,
            default: Date.now
        }
    }],
    
    // Notification sozlamalari
    notificationSettings: {
        likes: { type: Boolean, default: true },
        comments: { type: Boolean, default: true },
        follows: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        mentions: { type: Boolean, default: true },
        shares: { type: Boolean, default: true },
        gifts: { type: Boolean, default: true },
        earnings: { type: Boolean, default: true },
        subscriptions: { type: Boolean, default: true },
        live: { type: Boolean, default: true },
        achievements: { type: Boolean, default: true },
        reportResolved: { type: Boolean, default: true }
    },
    
    // ============ PUSH NOTIFICATION QISMI TUGADI ============
    
    // Xavfsizlik
    twoFactorEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: String,
        default: ''
    },
    lastLogin: {
        type: Date,
        default: null
    },
    lastLoginIP: {
        type: String,
        default: ''
    },
    
    // Token
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerificationToken: String,
    emailVerified: {
        type: Boolean,
        default: false
    },
    
    // Vaqt
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    this.updatedAt = Date.now();
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Indexes
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'stats.followerCount': -1 });
UserSchema.index({ deviceTokens: 1 });

module.exports = mongoose.model('User', UserSchema);
