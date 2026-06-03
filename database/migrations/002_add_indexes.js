// ============ MIGRATION 002: ADD INDEXES ============

async function up(db) {
    // Users
    await db.collection('users').createIndex({ createdAt: -1 });
    await db.collection('users').createIndex({ 'stats.followerCount': -1 });
    await db.collection('users').createIndex({ username: 'text', fullName: 'text' });
    
    // Videos
    await db.collection('videos').createIndex({ hashtags: 1 });
    await db.collection('videos').createIndex({ likesCount: -1 });
    await db.collection('videos').createIndex({ title: 'text', description: 'text' });
    await db.collection('videos').createIndex({ isPrivate: 1, createdAt: -1 });
    
    // Comments
    await db.collection('comments').createIndex({ user: 1, createdAt: -1 });
    await db.collection('comments').createIndex({ parentComment: 1 });
    await db.collection('comments').createIndex({ isPinned: 1 });
    
    // Messages
    await db.collection('messages').createIndex({ sender: 1, receiver: 1 });
    await db.collection('messages').createIndex({ isRead: 1 });
    
    // Notifications
    await db.collection('notifications').createIndex({ user: 1, isRead: 1 });
    
    // Reports
    await db.collection('reports').createIndex({ status: 1, createdAt: -1 });
    await db.collection('reports').createIndex({ targetId: 1, targetType: 1 });
    
    // Stories
    await db.collection('stories').createIndex({ expiresAt: 1 });
    await db.collection('stories').createIndex({ user: 1, createdAt: -1 });
    
    // Payments
    await db.collection('payments').createIndex({ user: 1, createdAt: -1 });
    await db.collection('payments').createIndex({ status: 1 });
    await db.collection('payments').createIndex({ transactionId: 1 }, { unique: true, sparse: true });
    
    // Analytics
    await db.collection('analytics').createIndex({ entityId: 1, period: 1, date: 1 });
    await db.collection('analytics').createIndex({ date: -1 });
    
    console.log('Migration 002 completed');
}

async function down(db) {
    // Drop indexes
    await db.collection('users').dropIndex('username_text_fullName_text');
    await db.collection('videos').dropIndex('title_text_description_text');
    
    console.log('Migration 002 rolled back');
}

module.exports = { up, down };
