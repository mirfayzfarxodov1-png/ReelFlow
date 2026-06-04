const request = require('supertest');
const app = require('../../backend/server');
const User = require('../../backend/models/User');
const Video = require('../../backend/models/Video');
const Comment = require('../../backend/models/Comment');

let token;
let videoId;

beforeEach(async () => {
    const user = await User.create({
        username: 'commentuser',
        email: 'comment@test.com',
        password: 'password123'
    });
    
    const video = await Video.create({
        title: 'Test Video',
        videoUrl: 'http://test.com/video.mp4',
        user: user._id,
        isPrivate: false
    });
    videoId = video._id;
    
    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'comment@test.com',
            password: 'password123'
        });
    token = loginRes.body.token;
});

describe('Comment API', () => {
    describe('GET /api/comments/:videoId', () => {
        it('should get comments', async () => {
            const res = await request(app)
                .get(`/api/comments/${videoId}`);
            
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('POST /api/comments/:videoId', () => {
        it('should add comment', async () => {
            const res = await request(app)
                .post(`/api/comments/${videoId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ text: 'Test comment' });
            
            expect(res.statusCode).toBe(201);
            expect(res.body.text).toBe('Test comment');
        });
    });

    describe('POST /api/comments/:commentId/like', () => {
        let commentId;

        beforeEach(async () => {
            const comment = await Comment.create({
                text: 'Test comment',
                user: (await User.findOne({ username: 'commentuser' }))._id,
                video: videoId
            });
            commentId = comment._id;
        });

        it('should like comment', async () => {
            const res = await request(app)
                .post(`/api/comments/${commentId}/like`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toBe(200);
            expect(res.body.liked).toBe(true);
        });
    });
});
