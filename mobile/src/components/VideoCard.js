import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../utils/api';

const { width } = Dimensions.get('window');

export default function VideoCard({ video, navigation }) {
  const [isLiked, setIsLiked] = useState(video.isLiked || false);
  const [likesCount, setLikesCount] = useState(video.likesCount || 0);
  const [isSaved, setIsSaved] = useState(video.isSaved || false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const handleLike = async () => {
    try {
      if (isLiked) {
        setLikesCount(prev => prev - 1);
      } else {
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
      await api.post(`/videos/${video._id}/like`);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaved(!isSaved);
      await api.post(`/videos/${video._id}/save`);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleShare = () => {
    // Share functionality
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.userInfo}
          onPress={() => navigation.navigate('Profile', { userId: video.user?._id })}
        >
          <Image source={{ uri: video.user?.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>@{video.user?.username}</Text>
            <Text style={styles.time}>{formatTime(video.createdAt)}</Text>
          </View>
        </TouchableOpacity>
        
        {!video.user?.isFollowing && (
          <TouchableOpacity style={styles.followBtn}>
            <Text style={styles.followText}>Kuzatish</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Video */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setIsPlaying(!isPlaying)}
      >
        <Video
          ref={videoRef}
          source={{ uri: video.videoUrl }}
          style={styles.video}
          paused={!isPlaying}
          muted={isMuted}
          resizeMode="cover"
          repeat={true}
          poster={video.thumbnailUrl}
          posterResizeMode="cover"
        />
        
        {/* Play/Pause Button */}
        {!isPlaying && (
          <View style={styles.playIcon}>
            <Icon name="play-circle" size={50} color="#fff" />
          </View>
        )}
        
        {/* Mute Button */}
        <TouchableOpacity
          style={styles.muteButton}
          onPress={() => setIsMuted(!isMuted)}
        >
          <Icon name={isMuted ? 'volume-mute' : 'volume-high'} size={20} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            size={28}
            color={isLiked ? '#ff3040' : '#fff'}
          />
          <Text style={styles.actionText}>{formatNumber(likesCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Comments', { videoId: video._id })}
          style={styles.actionBtn}
        >
          <Icon name="chatbubble-outline" size={26} color="#fff" />
          <Text style={styles.actionText}>{formatNumber(video.commentsCount || 0)}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
          <Icon name="paper-plane-outline" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={styles.actionBtn}>
          <Icon
            name={isSaved ? 'bookmark' : 'bookmark-outline'}
            size={26}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      <View style={styles.caption}>
        <Text style={styles.captionText}>
          <Text style={styles.username} onPress={() => navigation.navigate('Profile', { userId: video.user?._id })}>
            @{video.user?.username}
          </Text>{' '}
          {video.title}
        </Text>
        {video.hashtags?.length > 0 && (
          <Text style={styles.hashtags}>
            {video.hashtags.map(tag => `#${tag}`).join(' ')}
          </Text>
        )}
      </View>

      {/* Comments Preview */}
      {video.commentsCount > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate('Comments', { videoId: video._id })}
          style={styles.commentsPreview}
        >
          <Text style={styles.commentsText}>
            Barcha {formatNumber(video.commentsCount)} ta izohni ko'rish
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const formatTime = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Hozirgina';
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  if (hours < 24) return `${hours} soat oldin`;
  return `${days} kun oldin`;
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  username: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  time: {
    color: '#888',
    fontSize: 11,
  },
  followBtn: {
    backgroundColor: '#0095f6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  followText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  video: {
    width: width,
    height: width * 1.78,
    backgroundColor: '#111',
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
  muteButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
  },
  caption: {
    paddingHorizontal: 12,
  },
  captionText: {
    color: '#fff',
    fontSize: 14,
  },
  hashtags: {
    color: '#0095f6',
    fontSize: 13,
    marginTop: 4,
  },
  commentsPreview: {
    paddingHorizontal: 12,
    marginTop: 8,
  },
  commentsText: {
    color: '#888',
    fontSize: 13,
  },
});
