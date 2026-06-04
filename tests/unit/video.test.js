const request = require('supertest');
const app = require('../../backend/server');
const User = require('../../backend/models/User');
const Video = require('../../backend/models/Video');

let token;
let userId;

beforeEach(async () => {
    const user = await User.create({
        username: 'videouser',
        email: 'video@test.com',
        password: 'password123'
    });
    userId = user._id;
    
    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'video@test.com',
            password: 'password123'
        });
    token = loginRes.body.token;
});

describe('Video API', () => {
    describe('POST /api/videos/upload', () => {
        it('should upload video', async () => {
            const res = await request(app)
                .post('/api/videos/upload')
                .set('Authorization', `Bearer ${token}`)
                .field('title', 'Test Video')
                .field('description', 'Test Description')
                .attach('video', Buffer.from('test'), 'test.mp4');
            
            expect(res.statusCode).toBe(201);
            expect(res.body.title).toBe('Test Video');
        });
    });

    describe('GET /api/videos/feed', () => {
        beforeEach(async () => {
            await Video.create({
                title: 'Test Video 1',
                videoUrl: 'http://test.com/video1.mp4',
                user: userId,
                isPrivate: false
            });
            await Video.create({
                title: 'Test Video 2',
                videoUrl: 'http://test.com/video2.mp4',
                user: userId,
                isPrivate: false
            });
        });

        it('should get video feed', async () => {
            const res = await request(app)
                .get('/api/videos/feed')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.length).toBeGreaterThan(0);
        });
    });

    describe('PUT /api/videos/:id/like', () => {
        let videoId;

        beforeEach(async () => {
            const video = await Video.create({
                title: 'Like Test',
                videoUrl: 'http://test.com/like.mp4',
                user: userId,
                isPrivate: false
            });
            videoId = video._id;
        });

        it('should like video', async () => {
            const res = await request(app)
                .put(`/api/videos/${videoId}/like`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(200);
            
            const video = await Video.findById(videoId);
            expect(video.likes.length).toBe(1);
        });
    });
});
