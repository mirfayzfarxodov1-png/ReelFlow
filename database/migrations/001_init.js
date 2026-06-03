// ============ MIGRATION 001: INIT ============

async function up(db) {
    // Create collections
    await db.createCollection('users');
    await db.createCollection('videos');
    await db.createCollection('comments');
    await db.createCollection('messages');
    await db.createCollection('stories');
    await db.createCollection('notifications');
    await db.createCollection('reports');
    await db.createCollection('payments');
    await db.createCollection('analytics');
    
    // Create indexes
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('videos').createIndex({ user: 1, createdAt: -1 });
    await db.collection('videos').createIndex({ views: -1 });
    await db.collection('comments').createIndex({ video: 1, createdAt: -1 });
    await db.collection('messages').createIndex({ chatId: 1, createdAt: -1 });
    await db.collection('notifications').createIndex({ user: 1, createdAt: -1 });
    
    console.log('Migration 001 completed');
}

async function down(db) {
    const collections = [
        'users', 'videos', 'comments', 'messages',
        'stories', 'notifications', 'reports', 'payments', 'analytics'
    ];
    
    for (const collection of collections) {
        await db.collection(collection).drop();
    }
    
    console.log('Migration 001 rolled back');
}

module.exports = { up, down };
