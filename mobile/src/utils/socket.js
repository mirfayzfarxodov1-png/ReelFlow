import io from 'socket.io-client';
import { getToken } from './storage';

let socket = null;

export const initSocket = async () => {
  const token = await getToken();
  const SOCKET_URL = 'http://10.0.2.2:5000'; // Android emulator
  
  if (!token) return null;
  
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

export const endCall = (receiverId, duration) => {
  if (socket) {
    socket.emit('call:end', { receiverId, duration });
  }
};
