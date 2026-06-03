// ============ STORY SCHEMA ============

const StorySchema = {
    // Asosiy ma'lumotlar
    user: {
        type: ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
    },
    
    // Kontent
    caption: {
        type: String,
        maxlength: 100,
        default: ''
    },
    backgroundColor: {
        type: String,
        default: '#000000'
    },
    musicId: {
        type: ObjectId,
        ref: 'Music',
        default: null
    },
    
    // Interaktivlik
    allowReplies: {
        type: Boolean,
        default: true
    },
    allowSharing: {
        type: Boolean,
        default: true
    },
    
    // Statistika
    views: [{
        type: ObjectId,
        ref: 'User'
    }],
    viewsCount: {
        type: Number,
        default: 0
    },
    replies: [{
        type: ObjectId,
        ref: 'StoryReply'
    }],
    
    // Highlight
    isHighlight: {
        type: Boolean,
        default: false
    },
    highlightId: {
        type: ObjectId,
        ref: 'Highlight',
        default: null
    },
    
    // Vaqt
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 24*60*60*1000),
        index: true
    }
};

// Indexes
StorySchema.index({ user: 1, createdAt: -1 });
StorySchema.index({ expiresAt: 1 });
