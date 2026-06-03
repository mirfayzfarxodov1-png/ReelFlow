// ============ USER SCHEMA ============

const UserSchema = {
    // Asosiy ma'lumotlar
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
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
        type: ObjectId,
        ref: 'User',
        index: true
    }],
    following: [{
        type: ObjectId,
        ref: 'User',
        index: true
    }],
    savedVideos: [{
        type: ObjectId,
        ref: 'Video'
    }],
    savedStories: [{
        type: ObjectId,
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
        type: ObjectId,
        ref: 'User'
    }],
    mutedUsers: [{
        type: ObjectId,
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
        default: Date.now,
        index: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
};

// Indexes
UserSchema.index({ username: 'text', fullName: 'text' });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ 'stats.followerCount': -1 });
