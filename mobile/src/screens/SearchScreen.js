import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../utils/api';

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    try {
      const response = await api.get('/search/trending');
      setTrending(response.data);
    } catch (error) {
      console.error('Load trending error:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const endpoint = activeTab === 'users' ? '/users/search' : `/videos/search?q=${searchQuery}`;
      const response = await api.get(endpoint, { params: { q: searchQuery } });
      setResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timeout = setTimeout(handleSearch, 500);
      return () => clearTimeout(timeout);
    }
  }, [searchQuery, activeTab]);

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userItem}
      onPress={() => navigation.navigate('Profile', { userId: item._id })}
    >
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <Text style={styles.username}>@{item.username}</Text>
        {item.fullName && <Text style={styles.fullName}>{item.fullName}</Text>}
      </View>
      <Text style={styles.followerCount}>{item.stats?.followerCount || 0} kuzatuvchi</Text>
    </TouchableOpacity>
  );

  const renderVideoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.videoItem}
      onPress={() => navigation.navigate('VideoPlayer', { videoId: item._id })}
    >
      <Image source={{ uri: item.thumbnailUrl }} style={styles.videoThumbnail} />
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.videoUser}>@{item.user?.username}</Text>
        <View style={styles.videoStats}>
          <Text style={styles.videoStat}>👁️ {formatNumber(item.views)}</Text>
          <Text style={styles.videoStat}>❤️ {formatNumber(item.likesCount)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Qidiruv..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'users' && styles.activeTab]} onPress={() => setActiveTab('users')}>
          <Text style={[styles.tabText, activeTab === 'users' && styles.activeTabText]}>Foydalanuvchilar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'videos' && styles.activeTab]} onPress={() => setActiveTab('videos')}>
          <Text style={[styles.tabText, activeTab === 'videos' && styles.activeTabText]}>Videolar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'hashtags' && styles.activeTab]} onPress={() => setActiveTab('hashtags')}>
          <Text style={[styles.tabText, activeTab === 'hashtags' && styles.activeTabText]}>Hashtaglar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#fff" />
      ) : searchQuery.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item._id}
          renderItem={activeTab === 'users' ? renderUserItem : renderVideoItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Hech narsa topilmadi</Text>
          }
        />
      ) : (
        <View style={styles.trendingContainer}>
          <Text style={styles.trendingTitle}>Trenddagi qidiruvlar</Text>
          {trending.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.trendingItem}
              onPress={() => setSearchQuery(item)}
            >
              <Text style={styles.trendingRank}>#{index + 1}</Text>
              <Text style={styles.trendingText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    marginBottom: 12
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#fff'
  },
  tabText: {
    color: '#888',
    fontSize: 14
  },
  activeTabText: {
    color: '#fff'
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111'
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12
  },
  userInfo: {
    flex: 1
  },
  username: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15
  },
  fullName: {
    color: '#888',
    fontSize: 13
  },
  followerCount: {
    color: '#888',
    fontSize: 12
  },
  videoItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111'
  },
  videoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12
  },
  videoInfo: {
    flex: 1
  },
  videoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  videoUser: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4
  },
  videoStats: {
    flexDirection: 'row',
    gap: 12
  },
  videoStat: {
    color: '#888',
    fontSize: 11
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 50
  },
  trendingContainer: {
    paddingHorizontal: 16
  },
  trendingTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
  trendingRank: {
    color: '#888',
    fontSize: 16,
    width: 40
  },
  trendingText: {
    color: '#fff',
    fontSize: 15
  }
});
