class CallHandler {
    constructor(io, socket) {
        this.io = io;
        this.socket = socket;
    }

    startCall(data) {
        const { receiverId, callType, offer } = data;
        const receiverSocketId = this.getUserSocketId(receiverId);
        
        if (receiverSocketId) {
            this.io.to(receiverSocketId).emit('call:incoming', {
                callerId: this.socket.userId,
                callerName: this.socket.user.username,
                callerAvatar: this.socket.user.avatar,
                callType,
                offer,
                callId: this.socket.id
            });
        } else {
            this.socket.emit('call:offline', { receiverId });
        }
    }

    acceptCall(data) {
        const { callerId, answer } = data;
        const callerSocketId = this.getUserSocketId(callerId);
        
        if (callerSocketId) {
            this.io.to(callerSocketId).emit('call:accepted', { 
                answer,
                receiverId: this.socket.userId,
                receiverName: this.socket.user.username
            });
        }
    }

    rejectCall(data) {
        const { callerId } = data;
        const callerSocketId = this.getUserSocketId(callerId);
        
        if (callerSocketId) {
            this.io.to(callerSocketId).emit('call:rejected', { 
                receiverId: this.socket.userId,
                reason: data.reason || 'busy'
            });
        }
    }

    iceCandidate(data) {
        const { receiverId, candidate } = data;
        const receiverSocketId = this.getUserSocketId(receiverId);
        
        if (receiverSocketId) {
            this.io.to(receiverSocketId).emit('call:ice-candidate', { 
                candidate,
                fromId: this.socket.userId
            });
        }
    }

    endCall(data) {
        const { receiverId } = data;
        const receiverSocketId = this.getUserSocketId(receiverId);
        
        if (receiverSocketId) {
            this.io.to(receiverSocketId).emit('call:ended', { 
                byId: this.socket.userId,
                duration: data.duration
            });
        }
    }

    getUserSocketId(userId) {
        return global.onlineUsers?.get(userId);
    }
}

module.exports = CallHandler;
