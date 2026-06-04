const request = require('supertest');
const app = require('../../backend/server');
const User = require('../../backend/models/User');

describe('Auth API', () => {
    describe('POST /api/auth/register', () => {
        it('should register new user', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'testuser',
                    email: 'test@test.com',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.username).toBe('testuser');
        });

        it('should not register with existing email', async () => {
            await User.create({
                username: 'existing',
                email: 'existing@test.com',
                password: 'password123'
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    username: 'newuser',
                    email: 'existing@test.com',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            await User.create({
                username: 'loginuser',
                email: 'login@test.com',
                password: 'password123'
            });
        });

        it('should login with correct credentials', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@test.com',
                    password: 'password123'
                });
            
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
        });

        it('should not login with wrong password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@test.com',
                    password: 'wrongpassword'
                });
            
            expect(res.statusCode).toBe(401);
        });
    });
});
