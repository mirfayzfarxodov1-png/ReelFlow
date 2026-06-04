const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../backend/models/User');
const Message = require('../backend/models/Message');

let io;
const onlineUsers = new Map();

function initSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return next(new Error('User not found'));
            }
            
            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.username}`);
        
        onlineUsers.set(socket.user._id.toString(), socket.id);
        io.emit('users:online', Array.from(onlineUsers.keys()));

        socket.on('message:send', async (data) => {
            const { receiverId, text, image, voice } = data;
            
            const message = await Message.create({
                sender: socket.user._id,
                receiver: receiverId,
                text: text || '',
                image: image || '',
                voice: voice || ''
            });

            const populatedMessage = await message.populate('sender', 'username avatar');
            
            const receiverSocketId = onlineUsers.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('message:receive', populatedMessage);
            }
            
            socket.emit('message:sent', populatedMessage);
        });

        socket.on('message:typing', (data) => {
            const { receiverId, isTyping } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('message:typing', {
                    senderId: socket.user._id,
                    username: socket.user.username,
                    isTyping
                });
            }
        });

        socket.on('message:read', async (data) => {
            const { messageIds, senderId } = data;
            await Message.updateMany(
                { _id: { $in: messageIds } },
                { isRead: true, readAt: new Date() }
            );
            
            const senderSocketId = onlineUsers.get(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit('message:read', { messageIds });
            }
        });

        socket.on('call:start', (data) => {
            const { receiverId, callType, offer } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('call:incoming', {
                    callerId: socket.user._id,
                    callerName: socket.user.username,
                    callerAvatar: socket.user.avatar,
                    callType,
                    offer
                });
            }
        });

        socket.on('call:accept', (data) => {
            const { callerId, answer } = data;
            const callerSocketId = onlineUsers.get(callerId);
            
            if (callerSocketId) {
                io.to(callerSocketId).emit('call:accepted', { answer });
            }
        });

        socket.on('call:reject', (data) => {
            const { callerId } = data;
            const callerSocketId = onlineUsers.get(callerId);
            
            if (callerSocketId) {
                io.to(callerSocketId).emit('call:rejected');
            }
        });

        socket.on('call:ice-candidate', (data) => {
            const { receiverId, candidate } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('call:ice-candidate', { candidate });
            }
        });

        socket.on('disconnect', () => {
            onlineUsers.delete(socket.user._id.toString());
            io.emit('users:online', Array.from(onlineUsers.keys()));
            console.log(`User disconnected: ${socket.user.username}`);
        });
    });

    return io;
}

function getIO() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}

module.exports = { initSocket, getIO };
