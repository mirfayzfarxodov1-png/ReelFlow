const mongoose = require('mongoose');
const User = require('../../backend/models/User');
const Video = require('../../backend/models/Video');
const Comment = require('../../backend/models/Comment');

describe('Database Integration', () => {
    describe('User Model', () => {
        it('should create user with valid data', async () => {
            const user = await User.create({
                username: 'dbuser',
                email: 'db@test.com',
                password: 'password123'
            });
            
            expect(user.username).toBe('dbuser');
            expect(user.email).toBe('db@test.com');
        });

        it('should hash password', async () => {
            const user = await User.create({
                username: 'hashuser',
                email: 'hash@test.com',
                password: 'mypassword'
            });
            
            expect(user.password).not.toBe('mypassword');
            expect(user.password.length).toBeGreaterThan(20);
        });

        it('should find user by email', async () => {
            await User.create({
                username: 'finduser',
                email: 'find@test.com',
                password: 'password123'
            });
            
            const user = await User.findOne({ email: 'find@test.com' });
            expect(user).not.toBeNull();
            expect(user.username).toBe('finduser');
        });
    });

    describe('Video Model', () => {
        let userId;

        beforeEach(async () => {
            const user = await User.create({
                username: 'videodbuser',
                email: 'videodb@test.com',
                password: 'password123'
            });
            userId = user._id;
        });

        it('should create video', async () => {
            const video = await Video.create({
                title: 'DB Test Video',
                videoUrl: 'http://test.com/dbvideo.mp4',
                user: userId,
                isPrivate: false
            });
            
            expect(video.title).toBe('DB Test Video');
            expect(video.views).toBe(0);
        });

        it('should increment views', async () => {
            const video = await Video.create({
                title: 'Views Test',
                videoUrl: 'http://test.com/views.mp4',
                user: userId
            });
            
            video.views += 1;
            await video.save();
            
            const updated = await Video.findById(video._id);
            expect(updated.views).toBe(1);
        });
    });

    describe('Comment Model', () => {
        let userId;
        let videoId;

        beforeEach(async () => {
            const user = await User.create({
                username: 'commentdbuser',
                email: 'commentdb@test.com',
                password: 'password123'
            });
            userId = user._id;
            
            const video = await Video.create({
                title: 'Comment Test Video',
                videoUrl: 'http://test.com/commentvideo.mp4',
                user: userId
            });
            videoId = video._id;
        });

        it('should create comment', async () => {
            const comment = await Comment.create({
                text: 'Database test comment',
                user: userId,
                video: videoId
            });
            
            expect(comment.text).toBe('Database test comment');
            expect(comment.likesCount).toBe(0);
        });

        it('should create reply to comment', async () => {
            const parent = await Comment.create({
                text: 'Parent comment',
                user: userId,
                video: videoId
            });
            
            const reply = await Comment.create({
                text: 'Reply to comment',
                user: userId,
                video: videoId,
                parentComment: parent._id
            });
            
            expect(reply.parentComment.toString()).toBe(parent._id.toString());
        });
    });

    describe('Relationships', () => {
        it('should link user to videos', async () => {
            const user = await User.create({
                username: 'relationuser',
                email: 'relation@test.com',
                password: 'password123'
            });
            
            const video1 = await Video.create({
                title: 'Video 1',
                videoUrl: 'http://test.com/v1.mp4',
                user: user._id
            });
            
            const video2 = await Video.create({
                title: 'Video 2',
                videoUrl: 'http://test.com/v2.mp4',
                user: user._id
            });
            
            const userWithVideos = await User.findById(user._id).populate('videos');
            expect(userWithVideos.videos.length).toBe(2);
        });
    });
});
