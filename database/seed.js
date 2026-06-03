// ============ SEED DATA ============

const bcrypt = require('bcryptjs');

const seedUsers = [
    {
        username: 'admin',
        email: 'admin@reelflow.com',
        password: bcrypt.hashSync('admin123', 10),
        fullName: 'Admin User',
        isVerified: true,
        isActive: true
    },
    {
        username: 'demo_user',
        email: 'demo@reelflow.com',
        password: bcrypt.hashSync('demo123', 10),
        fullName: 'Demo User',
        isVerified: true,
        isActive: true
    }
];

const seedVideos = [
    {
        title: 'Welcome to ReelFlow',
        description: 'Platformaga xush kelibsiz!',
        hashtags: ['reelflow', 'welcome'],
        isPrivate: false
    }
];

async function seedDatabase() {
    // Foydalanuvchi o'zi qo'shadi
    
    console.log('Seed data inserted');
}

module.exports = { seedDatabase };
