// Socket.IO event nomlari konstanta sifatida
const SOCKET_EVENTS = {
    // Connection
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECTION: 'connection',
    
    // Users
    USERS_ONLINE: 'users:online',
    USER_JOINED: 'user:joined',
    USER_LEFT: 'user:left',
    
    // Messages
    MESSAGE_SEND: 'message:send',
    MESSAGE_SENT: 'message:sent',
    MESSAGE_RECEIVE: 'message:receive',
    MESSAGE_TYPING: 'message:typing',
    MESSAGE_READ: 'message:read',
    MESSAGE_DELETE: 'message:delete',
    MESSAGE_DELETED: 'message:deleted',
    MESSAGE_HISTORY: 'message:history',
    MESSAGE_ERROR: 'message:error',
    
    // Conversations
    CONVERSATIONS_LIST: 'conversations:list',
    
    // Calls
    CALL_START: 'call:start',
    CALL_INCOMING: 'call:incoming',
    CALL_ACCEPT: 'call:accept',
    CALL_ACCEPTED: 'call:accepted',
    CALL_REJECT: 'call:reject',
    CALL_REJECTED: 'call:rejected',
    CALL_ICE_CANDIDATE: 'call:ice-candidate',
    CALL_END: 'call:end',
    CALL_ENDED: 'call:ended',
    CALL_OFFLINE: 'call:offline',
    
    // Presence
    PRESENCE_TYPING: 'presence:typing',
    PRESENCE_SEEN: 'presence:seen',
    
    // Error
    ERROR: 'error'
};

module.exports = SOCKET_EVENTS;
