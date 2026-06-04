import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket = null;

export const connectSocket = async () => {
    const token = await AsyncStorage.getItem('token');
    const SOCKET_URL = 'http://localhost:5000';
    
    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });
    
    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket.id);
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
    });
    
    socket.on('connect_error', (error) => {
        console.log('🔌 Socket error:', error.message);
    });
    
    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Message functions
export const sendMessage = (receiverId, text, image, video, voice) => {
    if (socket) {
        socket.emit('message:send', { receiverId, text, image, video, voice });
    }
};

export const markMessagesAsRead = (messageIds, senderId) => {
    if (socket) {
        socket.emit('message:read', { messageIds, senderId });
    }
};

export const getChatHistory = (userId, limit = 50, before = null) => {
    if (socket) {
        socket.emit('message:history', { userId, limit, before });
    }
};

export const getConversations = () => {
    if (socket) {
        socket.emit('conversations:list');
    }
};

export const sendTyping = (receiverId, chatId, isTyping) => {
    if (socket) {
        socket.emit('presence:typing', { receiverId, chatId, isTyping });
    }
};

// Call functions
export const startCall = (receiverId, callType, offer) => {
    if (socket) {
        socket.emit('call:start', { receiverId, callType, offer });
    }
};

export const acceptCall = (callerId, answer) => {
    if (socket) {
        socket.emit('call:accept', { callerId, answer });
    }
};

export const rejectCall = (callerId, reason = 'busy') => {
    if (socket) {
        socket.emit('call:reject', { callerId, reason });
    }
};

export const sendICECandidate = (receiverId, candidate) => {
    if (socket) {
        socket.emit('call:ice-candidate', { receiverId, candidate });
    }
};

export const endCall = (receiverId, duration) => {
    if (socket) {
        socket.emit('call:end', { receiverId, duration });
    }
};
