const request = require('supertest');
const app = require('../../backend/server');
const User = require('../../backend/models/User');
const Video = require('../../backend/models/Video');

describe('Integration Tests', () => {
    let token;
    let userId;
    let videoId;

    // Full user flow test
    describe('Complete User Flow', () => {
        it('should register user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'flowuser',
                    email: 'flow@test.com',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(201);
            token = res.body.token;
            userId = res.body._id;
        });

        it('should login user', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'flow@test.com',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body.token).toBeDefined();
        });

        it('should upload video', async () => {
            const res = await request(app)
                .post('/api/videos/upload')
                .set('Authorization', `Bearer ${token}`)
                .field('title', 'Integration Test Video')
                .attach('video', Buffer.from('test'), 'test.mp4');
            
            expect(res.statusCode).toBe(201);
            videoId = res.body._id;
        });

        it('should like video', async () => {
            const res = await request(app)
                .put(`/api/videos/${videoId}/like`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(200);
        });

        it('should get video feed', async () => {
            const res = await request(app)
                .get('/api/videos/feed')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    // Social interaction flow
    describe('Social Interaction Flow', () => {
        let user2Token;
        let user2Id;

        beforeAll(async () => {
            // Create second user
            const user2 = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'user2',
                    email: 'user2@test.com',
                    password: 'password123'
                });
            user2Token = user2.body.token;
            user2Id = user2.body._id;
        });

        it('should follow user', async () => {
            const res = await request(app)
                .post(`/api/users/follow/${userId}`)
                .set('Authorization', `Bearer ${user2Token}`);
            
            expect(res.statusCode).toBe(200);
        });

        it('should add comment on video', async () => {
            const res = await request(app)
                .post(`/api/comments/${videoId}`)
                .set('Authorization', `Bearer ${user2Token}`)
                .send({ text: 'Nice video!' });
            
            expect(res.statusCode).toBe(201);
        });
    });
});
