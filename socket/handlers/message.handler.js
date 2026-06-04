const Message = require('../../backend/models/Message');
const User = require('../../backend/models/User');
const PushService = require('../../notifications/push.service');

class MessageHandler {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
    }

    async sendMessage(data) {
        const { receiverId, text, image, video, voice } = data;
        
        try {
            const message = await Message.create({
                sender: this.socket.userId,
                receiver: receiverId,
                text: text || '',
                image: image || '',
                video: video || '',
                voice: voice || '',
                chatId: [this.socket.userId, receiverId].sort().join('_')
            });

            const populatedMessage = await message
                .populate('sender', 'username avatar fullName')
                .populate('receiver', 'username avatar fullName');
            
            // Send to receiver if online
            const receiverSocketId = this.getUserSocketId(receiverId);
            if (receiverSocketId) {
                this.io.to(receiverSocketId).emit('message:receive', populatedMessage);
            } else {
                // Send push notification
                const receiver = await User.findById(receiverId);
                if (receiver && receiver.notificationSettings?.messages) {
                    await PushService.sendMessageNotification(
                        receiverId,
                        this.socket.user.username,
                        this.socket.user.avatar,
                        text || 'Image sent',
                        message._id
                    );
                }
            }
            
            this.socket.emit('message:sent', populatedMessage);
        } catch (error) {
            this.socket.emit('message:error', { error: error.message });
        }
    }

    async markAsRead(data) {
        const { messageIds, senderId } = data;
        
        try {
            await Message.updateMany(
                { _id: { $in: messageIds } },
                { isRead: true, readAt: new Date() }
            );
            
            const senderSocketId = this.getUserSocketId(senderId);
            if (senderSocketId) {
                this.io.to(senderSocketId).emit('message:read', { 
                    messageIds, 
                    readerId: this.socket.userId 
                });
            }
        } catch (error) {
            console.error('Mark read error:', error);
        }
    }

    async getChatHistory(data) {
        const { userId, limit = 50, before } = data;
        
        try {
            let query = {
                $or: [
                    { sender: this.socket.userId, receiver: userId },
                    { sender: userId, receiver: this.socket.userId }
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
            
            this.socket.emit('message:history', { messages: messages.reverse(), userId });
        } catch (error) {
            this.socket.emit('message:error', { error: error.message });
        }
    }

    getUserSocketId(userId) {
        // This would be imported from main socket server
        return global.onlineUsers?.get(userId);
    }
}

module.exports = MessageHandler;
