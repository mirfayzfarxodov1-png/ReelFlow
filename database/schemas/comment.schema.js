// ============ COMMENT SCHEMA ============

const CommentSchema = {
    // Asosiy ma'lumotlar
    text: {
        type: String,
        required: true,
        maxlength: 300
    },
    
    // Aloqalar
    user: {
        type: ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    video: {
        type: ObjectId,
        ref: 'Video',
        required: true,
        index: true
    },
    
    // Reply tizimi
    parentComment: {
        type: ObjectId,
        ref: 'Comment',
        default: null,
        index: true
    },
    replies: [{
        type: ObjectId,
        ref: 'Comment'
    }],
    replyCount: {
        type: Number,
        default: 0
    },
    
    // Statistika
    likes: [{
        type: ObjectId,
        ref: 'User'
    }],
    likesCount: {
        type: Number,
        default: 0
    },
    
    // Holati
    isPinned: {
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
    
    // Moderatsiya
    reportCount: {
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
    }
};

// Indexes
CommentSchema.index({ video: 1, createdAt: -1 });
CommentSchema.index({ user: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1, createdAt: 1 });
