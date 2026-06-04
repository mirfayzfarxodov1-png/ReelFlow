class PresenceHandler {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
        this.typingTimeouts = new Map();
    }

    typing(data) {
        const { receiverId, chatId, isTyping } = data;
        const receiverSocketId = this.getUserSocketId(receiverId);
        
        if (receiverSocketId) {
            this.io.to(receiverSocketId).emit('presence:typing', {
                userId: this.socket.userId,
                username: this.socket.user.username,
                chatId,
                isTyping
            });
        }
        
        // Auto clear typing after 3 seconds
        if (isTyping) {
            const timeoutKey = `${this.socket.userId}_${receiverId}`;
            if (this.typingTimeouts.has(timeoutKey)) {
                clearTimeout(this.typingTimeouts.get(timeoutKey));
            }
            
            const timeout = setTimeout(() => {
                if (receiverSocketId) {
                    this.io.to(receiverSocketId).emit('presence:typing', {
                        userId: this.socket.userId,
                        username: this.socket.user.username,
                        chatId,
                        isTyping: false
                    });
                }
                this.typingTimeouts.delete(timeoutKey);
            }, 3000);
            
            this.typingTimeouts.set(timeoutKey, timeout);
        }
    }

    seen(data) {
        const { userId } = data;
        const userSocketId = this.getUserSocketId(userId);
        
        if (userSocketId) {
            this.io.to(userSocketId).emit('presence:seen', {
                userId: this.socket.userId,
                seenAt: new Date()
            });
        }
    }

    getUserSocketId(userId) {
        return global.onlineUsers?.get(userId);
    }
}

module.exports = PresenceHandler;
