import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getSocket } from '../utils/socket';

export default function MessagesScreen({ navigation }) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadConversations();
    }, [])
  );

  const loadConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await api.get(`/users/search?q=${query}&limit=10`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    searchUsers(text);
  };

  const startChat = (userId, username, avatar) => {
    navigation.navigate('Chat', { userId, username, avatar });
    setShowSearch(false);
    setSearchQuery('');
  };

  const formatTime = (date) => {
    const now = new Date();
    const msgDate = new Date(date);
    const diff = now - msgDate;
    const days = Math.floor(diff / 86400000);
    
    if (days > 7) return msgDate.toLocaleDateString();
    if (days > 1) return `${days} kun oldin`;
    if (diff > 86400000) return 'Kecha';
    
    const hours = Math.floor(diff / 3600000);
    if (hours > 0) return `${hours} soat oldin`;
    
    const minutes = Math.floor(diff / 60000);
    if (minutes > 0) return `${minutes} daqiqa oldin`;
    
    return 'Hozirgina';
  };

  const renderConversation = ({ item }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => startChat(item.user._id, item.user.username, item.user.avatar)}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
        {item.user.isOnline && <View style={styles.onlineDot} />}
      </View>
      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={styles.username}>@{item.user.username}</Text>
          <Text style={styles.time}>{formatTime(item.lastMessage?.createdAt)}</Text>
        </View>
        <View style={styles.messagePreview}>
          <Text style={styles.messageText} numberOfLines={1}>
            {item.lastMessage?.sender === user?._id ? 'Siz: ' : ''}
            {item.lastMessage?.text || item.lastMessage?.image ? '📷 Rasm' : '📹 Video'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.searchResultItem}
      onPress={() => startChat(item._id, item.username, item.avatar)}
    >
      <Image source={{ uri: item.avatar }} style={styles.searchAvatar} />
      <View>
        <Text style={styles.searchUsername}>@{item.username}</Text>
        {item.fullName && <Text style={styles.searchFullName}>{item.fullName}</Text>}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Xabarlar</Text>
        <TouchableOpacity onPress={() => setShowSearch(!showSearch)}>
          <Icon name="search-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <Icon name="search-outline" size={20} color="#888" />
            <TextInput
              style={styles.searchInput}
              placeholder="Qidiruv..."
              placeholderTextColor="#888"
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Icon name="close-circle" size={20} color="#888" />
              </TouchableOpacity>
            )}
          </View>
          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item._id}
              renderItem={renderSearchResult}
              style={styles.searchResults}
            />
          )}
        </View>
      )}

      {/* Conversations */}
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.user._id}
        renderItem={renderConversation}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={60} color="#333" />
            <Text style={styles.emptyText}>Xabarlar yo'q</Text>
            <Text style={styles.emptySubtext}>Birovga xabar yozing</Text>
          </View>
        }
      />
    </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold'
  },
  searchContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16
  },
  searchResults: {
    maxHeight: 300,
    marginTop: 8
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12
  },
  searchAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  searchUsername: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  },
  searchFullName: {
    color: '#888',
    fontSize: 13
  },
  conversationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    alignItems: 'center'
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00c853',
    borderWidth: 2,
    borderColor: '#000'
  },
  conversationInfo: {
    flex: 1
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  time: {
    color: '#888',
    fontSize: 11
  },
  messagePreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  messageText: {
    color: '#888',
    fontSize: 13,
    flex: 1
  },
  unreadBadge: {
    backgroundColor: '#0095f6',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6
  },
  unreadCount: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600'
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center'
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginTop: 16
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8
  }
});
