import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import StoryCircle from '../components/StoryCircle';
import VideoCard from '../components/VideoCard';
import { getFeed } from '../utils/api';

export default function HomeScreen({ navigation }) {
  const [videos, setVideos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [feedType, setFeedType] = useState('foryou');

  const stories = [
    { id: '1', username: 'qoshish', avatar: null, isAdd: true },
    { id: '2', username: 'dilnoza_07', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
    { id: '3', username: 'javohir_22', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: '4', username: 'mehronaa', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' },
  ];

  useEffect(() => {
    loadVideos();
  }, [feedType]);

  const loadVideos = async () => {
    try {
      const data = await getFeed(feedType);
      setVideos(data);
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVideos();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Stories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storiesContainer}
      >
        {stories.map((story) => (
          <StoryCircle key={story.id} story={story} />
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

      {/* Videos Feed */}
      <FlatList
        data={videos}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <VideoCard video={item} navigation={navigation} />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        showsVerticalScrollIndicator={false}
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
});
