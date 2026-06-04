const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../backend/models/User');
const Message = require('../backend/models/Message');

let io;
const onlineUsers = new Map(); // userId -> socketId
const userSockets = new Map(); // socketId -> userId
const typingUsers = new Map(); // chatId -> { userId, timeout }

function initSocket(server) {
    io = socketIO(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Authentication middleware
    io.use(async (socket, next) => {
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
    });

    io.on('connection', (socket) => {
        console.log(`🔗 User connected: ${socket.user.username} (${socket.id})`);
        
        // Add to online users
        onlineUsers.set(socket.userId, socket.id);
        userSockets.set(socket.id, socket.userId);
        
        // Broadcast online status
        io.emit('users:online', Array.from(onlineUsers.keys()));
        
        // Send online users to new user
        socket.emit('users:online', Array.from(onlineUsers.keys()));

        // ============ MESSAGE HANDLERS ============
        
        // Send message
        socket.on('message:send', async (data) => {
            const { receiverId, text, image, video, voice } = data;
            
            try {
                const message = await Message.create({
                    sender: socket.userId,
                    receiver: receiverId,
                    text: text || '',
                    image: image || '',
                    video: video || '',
                    voice: voice || '',
                    chatId: [socket.userId, receiverId].sort().join('_')
                });

                const populatedMessage = await message.populate('sender', 'username avatar fullName');
                const populatedMessage2 = await populatedMessage.populate('receiver', 'username avatar fullName');
                
                // Send to receiver if online
                const receiverSocketId = onlineUsers.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('message:receive', populatedMessage2);
                }
                
                // Send confirmation to sender
                socket.emit('message:sent', populatedMessage2);
                
                // Send notification to offline user
                if (!receiverSocketId) {
                    // Trigger push notification
                    socket.emit('message:offline', { receiverId, message: populatedMessage2 });
                }
            } catch (error) {
                socket.emit('message:error', { error: error.message });
            }
        });

        // Typing indicator
        socket.on('message:typing', (data) => {
            const { receiverId, isTyping, chatId } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('message:typing', {
                    senderId: socket.userId,
                    username: socket.user.username,
                    isTyping,
                    chatId
                });
            }
        });

        // Mark messages as read
        socket.on('message:read', async (data) => {
            const { messageIds, senderId } = data;
            
            try {
                await Message.updateMany(
                    { _id: { $in: messageIds } },
                    { isRead: true, readAt: new Date() }
                );
                
                const senderSocketId = onlineUsers.get(senderId);
                if (senderSocketId) {
                    io.to(senderSocketId).emit('message:read', { 
                        messageIds, 
                        readerId: socket.userId 
                    });
                }
                
                socket.emit('message:read-confirm', { messageIds });
            } catch (error) {
                console.error('Mark read error:', error);
            }
        });

        // Delete message
        socket.on('message:delete', async (data) => {
            const { messageId, forEveryone } = data;
            
            try {
                const message = await Message.findById(messageId);
                
                if (!message) {
                    return socket.emit('message:delete-error', { error: 'Message not found' });
                }
                
                // Check if user is sender
                if (message.sender.toString() !== socket.userId) {
                    return socket.emit('message:delete-error', { error: 'Not authorized' });
                }
                
                if (forEveryone) {
                    await Message.findByIdAndDelete(messageId);
                } else {
                    await Message.findByIdAndUpdate(messageId, { isDeleted: true });
                }
                
                // Notify receiver
                const receiverSocketId = onlineUsers.get(message.receiver.toString());
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('message:deleted', { 
                        messageId, 
                        forEveryone 
                    });
                }
                
                socket.emit('message:deleted-confirm', { messageId });
            } catch (error) {
                socket.emit('message:delete-error', { error: error.message });
            }
        });

        // Get chat history
        socket.on('message:history', async (data) => {
            const { userId, limit = 50, before } = data;
            
            try {
                let query = {
                    $or: [
                        { sender: socket.userId, receiver: userId },
                        { sender: userId, receiver: socket.userId }
                    ]
                };
                
                if (before) {
                    query.createdAt = { $lt: new Date(before) };
                }
                
                const messages = await Message.find(query)
                    .populate('sender', 'username avatar fullName')
                    .populate('receiver', 'username avatar fullName')
                    .sort({ createdAt: -1 })
                    .limit(limit);
                
                socket.emit('message:history', { messages: messages.reverse(), userId });
            } catch (error) {
                socket.emit('message:error', { error: error.message });
            }
        });

        // Get conversations list
        socket.on('conversations:list', async () => {
            try {
                const conversations = await Message.aggregate([
                    {
                        $match: {
                            $or: [
                                { sender: mongoose.Types.ObjectId(socket.userId) },
                                { receiver: mongoose.Types.ObjectId(socket.userId) }
                            ]
                        }
                    },
                    {
                        $sort: { createdAt: -1 }
                    },
                    {
                        $group: {
                            _id: {
                                $cond: [
                                    { $eq: ['$sender', mongoose.Types.ObjectId(socket.userId)] },
                                    '$receiver',
                                    '$sender'
                                ]
                            },
                            lastMessage: { $first: '$$ROOT' },
                            unreadCount: {
                                $sum: {
                                    $cond: [
                                        { 
                                            $and: [
                                                { $eq: ['$receiver', mongoose.Types.ObjectId(socket.userId)] },
                                                { $eq: ['$isRead', false] }
                                            ]
                                        },
                                        1,
                                        0
                                    ]
                                }
                            }
                        }
                    }
                ]);
                
                // Populate user details
                const userIds = conversations.map(c => c._id);
                const users = await User.find({ _id: { $in: userIds } })
                    .select('username avatar fullName isVerified');
                
                const result = conversations.map(conv => ({
                    user: users.find(u => u._id.toString() === conv._id.toString()),
                    lastMessage: conv.lastMessage,
                    unreadCount: conv.unreadCount
                }));
                
                socket.emit('conversations:list', result);
            } catch (error) {
                socket.emit('error', { error: error.message });
            }
        });

        // ============ CALL HANDLERS ============
        
        // Start call
        socket.on('call:start', (data) => {
            const { receiverId, callType, offer } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('call:incoming', {
                    callerId: socket.userId,
                    callerName: socket.user.username,
                    callerAvatar: socket.user.avatar,
                    callType,
                    offer,
                    callId: socket.id
                });
            } else {
                socket.emit('call:offline', { receiverId });
            }
        });

        // Accept call
        socket.on('call:accept', (data) => {
            const { callerId, answer } = data;
            const callerSocketId = onlineUsers.get(callerId);
            
            if (callerSocketId) {
                io.to(callerSocketId).emit('call:accepted', { 
                    answer,
                    receiverId: socket.userId,
                    receiverName: socket.user.username
                });
            }
        });

        // Reject call
        socket.on('call:reject', (data) => {
            const { callerId } = data;
            const callerSocketId = onlineUsers.get(callerId);
            
            if (callerSocketId) {
                io.to(callerSocketId).emit('call:rejected', { 
                    receiverId: socket.userId,
                    reason: data.reason || 'busy'
                });
            }
        });

        // ICE candidate
        socket.on('call:ice-candidate', (data) => {
            const { receiverId, candidate } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('call:ice-candidate', { 
                    candidate,
                    fromId: socket.userId
                });
            }
        });

        // End call
        socket.on('call:end', (data) => {
            const { receiverId } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('call:ended', { 
                    byId: socket.userId,
                    duration: data.duration
                });
            }
        });

        // ============ PRESENCE HANDLERS ============
        
        // User typing status
        socket.on('presence:typing', (data) => {
            const { receiverId, chatId, isTyping } = data;
            const receiverSocketId = onlineUsers.get(receiverId);
            
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('presence:typing', {
                    userId: socket.userId,
                    username: socket.user.username,
                    chatId,
                    isTyping
                });
            }
        });

        // Seen status
        socket.on('presence:seen', async (data) => {
            const { userId } = data;
            const userSocketId = onlineUsers.get(userId);
            
            if (userSocketId) {
                io.to(userSocketId).emit('presence:seen', {
                    userId: socket.userId,
                    seenAt: new Date()
                });
            }
        });

        // ============ DISCONNECT ============
        
        socket.on('disconnect', () => {
            console.log(`🔌 User disconnected: ${socket.user?.username} (${socket.id})`);
            
            onlineUsers.delete(socket.userId);
            userSockets.delete(socket.id);
            
            io.emit('users:online', Array.from(onlineUsers.keys()));
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

function isUserOnline(userId) {
    return onlineUsers.has(userId);
}

function getUserSocketId(userId) {
    return onlineUsers.get(userId);
}

module.exports = { initSocket, getIO, isUserOnline, getUserSocketId };
