// ============ DATABASE INITIALIZATION ============

const mongoose = require('mongoose');

async function initDatabase() {
    try {
        // Create indexes
        await createIndexes();
        
        // Create collections
        await createCollections();
        
        // Seed initial data
        await seedInitialData();
        
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
}

async function createIndexes() {
    // User indexes
    await db.collection('users').createIndexes([
        { key: { username: 1 }, unique: true },
        { key: { email: 1 }, unique: true },
        { key: { createdAt: -1 } },
        { key: { 'stats.followerCount': -1 } }
    ]);
    
    // Video indexes
    await db.collection('videos').createIndexes([
        { key: { user: 1, createdAt: -1 } },
        { key: { views: -1 } },
        { key: { likesCount: -1 } },
        { key: { hashtags: 1 } },
        { key: { title: 'text', description: 'text' } }
    ]);
    
    // Comment indexes
    await db.collection('comments').createIndexes([
        { key: { video: 1, createdAt: -1 } },
        { key: { user: 1, createdAt: -1 } },
        { key: { parentComment: 1 } }
    ]);
    
    // Message indexes
    await db.collection('messages').createIndexes([
        { key: { chatId: 1, createdAt: -1 } },
        { key: { sender: 1, receiver: 1 } },
        { key: { isRead: 1 } }
    ]);
    
    // Notification indexes
    await db.collection('notifications').createIndexes([
        { key: { user: 1, createdAt: -1 } },
        { key: { user: 1, isRead: 1 } }
    ]);
    
    // Report indexes
    await db.collection('reports').createIndexes([
        { key: { targetId: 1, targetType: 1 } },
        { key: { status: 1, createdAt: -1 } }
    ]);
    
    console.log('Indexes created');
}

async function createCollections() {
    const collections = [
        'users', 'videos', 'comments', 'messages', 
        'stories', 'notifications', 'reports', 'payments', 
        'analytics', 'highlights', 'music'
    ];
    
    for (const collection of collections) {
        const exists = await db.listCollections({ name: collection }).hasNext();
        if (!exists) {
            await db.createCollection(collection);
            console.log(`Created collection: ${collection}`);
        }
    }
}

async function seedInitialData() {
    // Foydalanuvchi o'zi qo'shadi
}

module.exports = { initDatabase };
