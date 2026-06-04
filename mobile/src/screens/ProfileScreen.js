import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function ProfileScreen({ navigation, route }) {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('videos');
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const userId = route.params?.userId || currentUser?._id;
  const isOwnProfile = userId === currentUser?._id;

  const loadProfile = async () => {
    try {
      const response = await api.get(`/users/${userId}`);
      setProfile(response.data);
      setIsFollowing(response.data.isFollowing || false);
    } catch (error) {
      console.error('Load profile error:', error);
    }
  };

  const loadVideos = async () => {
    try {
      const response = await api.get(`/users/${userId}/videos`);
      setVideos(response.data);
    } catch (error) {
      console.error('Load videos error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfile();
      loadVideos();
    }, [userId])
  );

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await api.post(`/users/unfollow/${userId}`);
        setIsFollowing(false);
        setProfile(prev => ({
          ...prev,
          stats: { ...prev.stats, followerCount: prev.stats.followerCount - 1 }
        }));
      } else {
        await api.post(`/users/follow/${userId}`);
        setIsFollowing(true);
        setProfile(prev => ({
          ...prev,
          stats: { ...prev.stats, followerCount: prev.stats.followerCount + 1 }
        }));
      }
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  const renderVideoGrid = () => (
    <View style={styles.videoGrid}>
      {videos.map(video => (
        <TouchableOpacity
          key={video._id}
          style={styles.gridItem}
          onPress={() => navigation.navigate('VideoPlayer', { videoId: video._id })}
        >
          <Image source={{ uri: video.thumbnailUrl }} style={styles.gridImage} />
          <View style={styles.gridOverlay}>
            <Text style={styles.gridViews}>👁️ {formatNumber(video.views)}</Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { loadProfile(); loadVideos(); }} tintColor="#fff" />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: profile?.avatar }} style={styles.avatar} />
          {profile?.isVerified && (
            <View style={styles.verifiedBadge}>
              <Icon name="checkmark-circle" size={20} color="#0095f6" />
            </View>
          )}
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(profile?.stats?.videoCount || 0)}</Text>
            <Text style={styles.statLabel}>Videolar</Text>
          </View>
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Followers', { userId })}>
            <Text style={styles.statNumber}>{formatNumber(profile?.stats?.followerCount || 0)}</Text>
            <Text style={styles.statLabel}>Kuzatuvchilar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate('Following', { userId })}>
            <Text style={styles.statNumber}>{formatNumber(profile?.stats?.followingCount || 0)}</Text>
            <Text style={styles.statLabel}>Kuzatilgan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.username}>@{profile?.username}</Text>
        {profile?.fullName && <Text style={styles.fullName}>{profile.fullName}</Text>}
        {profile?.bio && <Text style={styles.bio}>{profile.bio}</Text>}
        {profile?.website && (
          <TouchableOpacity onPress={() => Linking.openURL(profile.website)}>
            <Text style={styles.website}>{profile.website}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {isOwnProfile ? (
          <>
            <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
              <Text style={styles.editButtonText}>Profilni tahrirlash</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('Settings')}>
              <Icon name="settings-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollow}
            >
              <Text style={styles.followButtonText}>
                {isFollowing ? 'Kuzatilmoqda' : 'Kuzatish'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.messageButton} onPress={() => navigation.navigate('Chat', { userId })}>
              <Icon name="chatbubble-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity style={[styles.tab, activeTab === 'videos' && styles.activeTab]} onPress={() => setActiveTab('videos')}>
          <Icon name="grid-outline" size={24} color={activeTab === 'videos' ? '#fff' : '#888'} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'saved' && styles.activeTab]} onPress={() => setActiveTab('saved')}>
          <Icon name="bookmark-outline" size={24} color={activeTab === 'saved' ? '#fff' : '#888'} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'liked' && styles.activeTab]} onPress={() => setActiveTab('liked')}>
          <Icon name="heart-outline" size={24} color={activeTab === 'liked' ? '#fff' : '#888'} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'videos' && renderVideoGrid()}
      {activeTab === 'saved' && <Text style={styles.placeholderText}>Saqlangan videolar</Text>}
      {activeTab === 'liked' && <Text style={styles.placeholderText}>Yoqqan videolar</Text>}
    </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center'
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 24
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#000',
    borderRadius: 12
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4
  },
  infoContainer: {
    paddingHorizontal: 16,
    marginBottom: 16
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  fullName: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 4
  },
  bio: {
    color: '#ccc',
    fontSize: 13,
    marginBottom: 4
  },
  website: {
    color: '#0095f6',
    fontSize: 13
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 20
  },
  editButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  settingsButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center'
  },
  followButton: {
    flex: 1,
    backgroundColor: '#0095f6',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  followingButton: {
    backgroundColor: '#1a1a1a'
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  messageButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center'
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#222',
    marginBottom: 4
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
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  gridItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#111'
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8
  },
  gridViews: {
    color: '#fff',
    fontSize: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  placeholderText: {
    color: '#888',
    textAlign: 'center',
    paddingVertical: 50
  }
});
