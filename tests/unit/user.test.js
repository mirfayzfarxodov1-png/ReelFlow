const request = require('supertest');
const app = require('../../backend/server');
const User = require('../../backend/models/User');

let token;
let userId;

beforeEach(async () => {
    const user = await User.create({
        username: 'testuser',
        email: 'test@test.com',
        password: 'password123'
    });
    userId = user._id;
    
    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'test@test.com',
            password: 'password123'
        });
    token = loginRes.body.token;
});

describe('User API', () => {
    describe('GET /api/users/:username', () => {
        it('should get user profile', async () => {
            const res = await request(app)
                .get('/api/users/testuser');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.username).toBe('testuser');
        });

        it('should return 404 for non-existent user', async () => {
            const res = await request(app)
                .get('/api/users/nonexistent');
            
            expect(res.statusCode).toBe(404);
        });
    });

    describe('PUT /api/users/profile', () => {
        it('should update user profile', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    fullName: 'Test User Updated',
                    bio: 'This is an updated bio'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.fullName).toBe('Test User Updated');
        });
    });

    describe('POST /api/users/follow/:userId', () => {
        let otherUserId;

        beforeEach(async () => {
            const otherUser = await User.create({
                username: 'otheruser',
                email: 'other@test.com',
                password: 'password123'
            });
            otherUserId = otherUser._id;
        });

        it('should follow user', async () => {
            const res = await request(app)
                .post(`/api/users/follow/${otherUserId}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.following).toBe(true);
        });

        it('should not follow self', async () => {
            const res = await request(app)
                .post(`/api/users/follow/${userId}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/users/search', () => {
        it('should search users', async () => {
            const res = await request(app)
                .get('/api/users/search?q=test');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });
});
