import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import VideoCard from '../components/VideoCard';
import StoryCircle from '../components/StoryCircle';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [feedType, setFeedType] = useState('foryou');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadVideos = async (refresh = false) => {
    if (refresh) {
      setPage(1);
      setHasMore(true);
    }
    
    if (!hasMore && !refresh) return;
    
    try {
      const response = await api.get(`/videos/feed?type=${feedType}&page=${refresh ? 1 : page}&limit=10`);
      const newVideos = response.data.videos || response.data;
      
      if (refresh) {
        setVideos(newVideos);
      } else {
        setVideos(prev => [...prev, ...newVideos]);
      }
      
      setHasMore(newVideos.length === 10);
      setPage(prev => prev + 1);
    } catch (error) {
      console.error('Load videos error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadStories = async () => {
    try {
      const response = await api.get('/stories/following');
      setStories(response.data);
    } catch (error) {
      console.error('Load stories error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadVideos(true);
      loadStories();
    }, [feedType])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadVideos(true);
  };

  const renderHeader = () => (
    <>
      {/* Stories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storiesContainer}
      >
        <TouchableOpacity style={styles.storyItem} onPress={() => navigation.navigate('CreateStory')}>
          <View style={[styles.storyRing, styles.addRing]}>
            <Icon name="add" size={30} color="#fff" />
          </View>
          <Text style={styles.storyName}>Qo'shish</Text>
        </TouchableOpacity>
        
        {stories.map(story => (
          <StoryCircle key={story._id} story={story} navigation={navigation} />
        ))}
      </ScrollView>

      {/* Feed Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity onPress={() => setFeedType('foryou')}>
          <Text style={[styles.tabText, feedType === 'foryou' && styles.activeTab]}>
            Siz uchun
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFeedType('following')}>
          <Text style={[styles.tabText, feedType === 'following' && styles.activeTab]}>
            Kuzatayotganlar
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#fff" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={videos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <VideoCard video={item} navigation={navigation} />
        )}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        showsVerticalScrollIndicator={false}
        onEndReached={() => loadVideos()}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  storiesContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  storyItem: {
    alignItems: 'center',
    marginRight: 16,
  },
  storyRing: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#f09433',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addRing: {
    borderColor: '#333',
  },
  storyName: {
    color: '#ccc',
    fontSize: 11,
    marginTop: 6,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    gap: 20,
  },
  tabText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '600',
  },
  activeTab: {
    color: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#fff',
    paddingBottom: 8,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
