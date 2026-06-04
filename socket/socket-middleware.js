const jwt = require('jsonwebtoken');
const User = require('../backend/models/User');

// Authentication middleware
const authMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
            return next(new Error('Authentication required'));
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return next(new Error('User not found'));
        }
        
        socket.user = user;
        socket.userId = user._id.toString();
        next();
    } catch (error) {
        next(new Error('Invalid token'));
    }
};

// Rate limiting middleware
const rateLimiter = (limit = 10, windowMs = 60000) => {
    const requests = new Map();
    
    return (socket, next) => {
        const key = socket.userId;
        const now = Date.now();
        
        if (!requests.has(key)) {
            requests.set(key, []);
        }
        
        const userRequests = requests.get(key);
        const windowStart = now - windowMs;
        
        // Filter old requests
        const recentRequests = userRequests.filter(time => time > windowStart);
        
        if (recentRequests.length >= limit) {
            return next(new Error('Rate limit exceeded'));
        }
        
        recentRequests.push(now);
        requests.set(key, recentRequests);
        next();
    };
};

// Logging middleware
const loggingMiddleware = (socket, next) => {
    const startTime = Date.now();
    
    socket.onAny((event, ...args) => {
        const duration = Date.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${socket.userId} -> ${event} (${duration}ms)`);
    });
    
    next();
};

module.exports = { authMiddleware, rateLimiter, loggingMiddleware };
