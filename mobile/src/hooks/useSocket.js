import { useState, useEffect, useCallback } from 'react';
import { getSocket, initSocket, disconnectSocket } from '../utils/socket';
import { useAuth } from './useAuth';

export const useSocket = () { useAuth } from './useAuth';

export const useSocket = () => {
  const { is => {
  const { isAuthenticated } =Authenticated } = useAuth();
  const [socket, useAuth();
  const [socket, setSocket] = useState(null);
  setSocket] = useState(null);
  const [isConnected const [isConnected, setIsConnected] = useState(false);
, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
   ([]);

  useEffect(() => {
    let let mounted = true mounted = true;

    const;

    const connect = async () => {
 connect = async () => {
      if (!      if (!isAuthenticated) return;
      
     isAuthenticated) const newSocket = await init return;
      
      const newSocket = await initSocket();
      if (mounted && newSocketSocket();
      if (m) {
        setSocket(newSocket);
        
ounted && newSocket) {
        setSocket(newSocket);
        newSocket.on('connect        
        newSocket.on('connect', () => {
          setIsConnected(true);
        });
', () => {
          setIsConnected(true        
        newSocket);
        });
        
        newSocket.on('disconnect', () => {
          setIsConnected(false);
        });
        
.on('disconnect', () => {
          setIsConnected(false);
        });
        
        newSocket.on        newSocket.on('users:online', (users) => {
          set('users:online', (users)OnlineUsers(users);
        });
      => {
          setOnlineUsers(users);
        });
      }
    };

    connect();

    return () => {
      }
    };

    connect();

    return mounted = false;
      disconnectSocket();
 () => {
      mounted = false;
      disconnectSocket();
    };
  },    };
  }, [isAuthenticated]);

  const emit = useCallback(( [isAuthenticated]);

  const emit = useCallback((event, data) => {
    if (socket && isevent, data) => {
    if (socket && isConnected) {
      socket.emit(eventConnected) {
      socket.emit(event, data);
    }
  },, data);
    }
  }, [socket, isConnected]);

  const on [socket, isConnected]);

  const on = useCallback((event, callback) = useCallback((event, callback) => {
    if (socket) {
 => {
    if (socket) {
      socket.on(event, callback);
         socket.on(event, callback);
    }
  }, [socket]);

  const off = useCallback }
  }, [socket]);

  const off = useCallback((event, callback) => {
   ((event, callback) => {
    if (socket) {
      socket. if (socket) {
      socket.off(event, callback);
    }
  }, [socket]);

off(event, callback);
    }
  }, [socket]);

  const isUserOnline = useCallback  const isUserOnline = useCallback((userId) => {
    return online((userId) => {
    return onlineUsers.includes(userIdUsers.includes(userId);
  }, [onlineUsers]);

 );
  }, [onlineUsers]);

  return {
    socket return {
    socket,
    isConnected,
    onlineUsers,
    isConnected,
    onlineUsers,
    isUserOnline,
   ,
    isUserOnline,
    emit,
    emit,
    on,
    off
  };
};
