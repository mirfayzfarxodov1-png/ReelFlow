// ============ MESSAGE SCHEMA ============

const MessageSchema = {
    // Aloqalar
    sender: {
        type: ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    receiver: {
        type: ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    chatId: {
        type: String,
        required: true,
        index: true
    },
    
    // Kontent
    text: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    video: {
        type: String,
        default: ''
    },
    voice: {
        type: String,
        default: ''
    },
    file: {
        type: String,
        default: ''
    },
    sticker: {
        type: String,
        default: ''
    },
    gif: {
        type: String,
        default: ''
    },
    
    // Holati
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    isDelivered: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isDeletedForEveryone: {
        type: Boolean,
        default: false
    },
    
    // Reply
    replyTo: {
        type: ObjectId,
        ref: 'Message',
        default: null
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
    readAt: {
        type: Date,
        default: null
    }
};

// Indexes
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
MessageSchema.index({ isRead: 1 });
