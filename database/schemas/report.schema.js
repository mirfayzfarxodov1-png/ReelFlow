// ============ REPORT SCHEMA ============

const ReportSchema = {
    // Shikoyat qiluvchi
    reporter: {
        type: ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    
    // Shikoyat qilingan narsa
    targetId: {
        type: ObjectId,
        required: true,
        index: true
    },
    targetType: {
        type: String,
        enum: ['video', 'comment', 'user', 'story', 'message'],
        required: true
    },
    
    // Sabab
    reason: {
        type: String,
        required: true,
        enum: [
            'spam', 'harassment', 'hate_speech', 'violence',
            'nudity', 'copyright', 'fake', 'other'
        ]
    },
    reasonText: {
        type: String,
        maxlength: 500,
        default: ''
    },
    
    // Holati
    status: {
        type: String,
        enum: ['pending', 'reviewing', 'resolved', 'ignored'],
        default: 'pending',
        index: true
    },
    resolution: {
        type: String,
        enum: ['removed', 'warned', 'blocked', 'no_action'],
        default: null
    },
    
    // Moderator
    resolvedBy: {
        type: ObjectId,
        ref: 'User',
        default: null
    },
    resolutionNote: {
        type: String,
        maxlength: 500,
        default: ''
    },
    
    // Vaqt
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    resolvedAt: {
        type: Date,
        default: null
    }
};

// Indexes
ReportSchema.index({ targetId: 1, targetType: 1 });
ReportSchema.index({ status: 1, createdAt: -1 });
ReportSchema.index({ reporter: 1 });
