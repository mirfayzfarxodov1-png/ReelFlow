import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getSocket } from '../utils/socket';

export default function ChatScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { userId, username, avatar } = route.params;
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    loadMessages();
    setupSocketListeners();
    
    navigation.setOptions({ title: `@${username}` });
    
    return () => {
      if (socket) {
        socket.off('message:receive');
        socket.off('message:typing');
      }
    };
  }, []);

  const loadMessages = async () => {
    try {
      const response = await api.get(`/messages/${userId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!socket) return;
    
    socket.on('message:receive', (message) => {
      if (message.sender._id === userId) {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      }
    });
    
    socket.on('message:typing', (data) => {
      if (data.senderId === userId) {
        setOtherUserTyping(data.isTyping);
      }
    });
  };

  const handleTyping = (text) => {
    setNewMessage(text);
    
    if (!socket) return;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    if (!isTyping && text.length > 0) {
      setIsTyping(true);
      socket.emit('message:typing', { receiverId: userId, isTyping: true });
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socket.emit('message:typing', { receiverId: userId, isTyping: false });
      }
    }, 1000);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');
    
    const tempMessage = {
      _id: Date.now().toString(),
      text: messageText,
      sender: { _id: user._id, username: user.username, avatar: user.avatar },
      receiver: { _id: userId },
      createdAt: new Date().toISOString(),
      isPending: true
    };
    
    setMessages(prev => [...prev, tempMessage]);
    scrollToBottom();
    
    try {
      if (socket) {
        socket.emit('message:send', { receiverId: userId, text: messageText });
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessage._id ? { ...msg, isPending: false, sent: true } : msg
        ));
      } else {
        const response = await api.post(`/messages/${userId}`, { text: messageText });
        setMessages(prev => prev.map(msg => 
          msg._id === tempMessage._id ? response.data : msg
        ));
      }
    } catch (error) {
      console.error('Send message error:', error);
      setMessages(prev => prev.map(msg => 
        msg._id === tempMessage._id ? { ...msg, isPending: false, error: true } : msg
      ));
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.sender._id === user._id;
    
    return (
      <View style={[styles.messageRow, isOwn ? styles.ownRow : styles.otherRow]}>
        {!isOwn && (
          <Image source={{ uri: avatar || item.sender?.avatar }} style={styles.messageAvatar} />
        )}
        <View style={[styles.messageBubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
          <Text style={[styles.messageText, isOwn ? styles.ownMessageText : styles.otherMessageText]}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.messageTime}>
              {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
            {isOwn && item.isPending && <ActivityIndicator size="small" color="#888" />}
            {isOwn && !item.isPending && item.sent && <Icon name="checkmark-done" size={14} color="#888" />}
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderMessage}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
        showsVerticalScrollIndicator={false}
      />
      
      {otherUserTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>{username} yozmoqda...</Text>
        </View>
      )}
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Xabar yozish..."
          placeholderTextColor="#888"
          value={newMessage}
          onChangeText={handleTyping}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newMessage.trim() || sending) && styles.disabledButton]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || sending}
        >
          <Icon name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  messageRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: 'flex-end'
  },
  ownRow: {
    justifyContent: 'flex-end'
  },
  otherRow: {
    justifyContent: 'flex-start'
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20
  },
  ownBubble: {
    backgroundColor: '#0095f6'
  },
  otherBubble: {
    backgroundColor: '#1a1a1a'
  },
  messageText: {
    fontSize: 15
  },
  ownMessageText: {
    color: '#fff'
  },
  otherMessageText: {
    color: '#fff'
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4
  },
  messageTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  typingText: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#222',
    backgroundColor: '#000',
    gap: 8
  },
  input: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100
  },
  sendButton: {
    backgroundColor: '#0095f6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#1a1a1a'
  }
});
