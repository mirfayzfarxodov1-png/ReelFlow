import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function VideoPlayerScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { videoId } = route.params;
  
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const videoRef = useRef(null);

  useEffect(() => {
    loadVideo();
  }, [videoId]);

  const loadVideo = async () => {
    try {
      const response = await api.get(`/videos/${videoId}`);
      setVideo(response.data);
      setIsLiked(response.data.isLiked || false);
      setLikesCount(response.data.likesCount || 0);
      setIsSaved(response.data.isSaved || false);
    } catch (error) {
      console.error('Load video error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        setLikesCount(prev => prev - 1);
      } else {
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
      await api.post(`/videos/${videoId}/like`);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaved(!isSaved);
      await api.post(`/videos/${videoId}/save`);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleShare = () => {
    // Share functionality
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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

  if (!video) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Video topilmadi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      
      {/* Video Player */}
      <Video
        ref={videoRef}
        source={{ uri: video.videoUrl }}
        style={styles.video}
        paused={!isPlaying}
        muted={isMuted}
        resizeMode="cover"
        repeat={true}
        onLoad={(data) => setDuration(data.duration)}
        onProgress={(data) => setCurrentTime(data.currentTime)}
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="arrow-back" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Play/Pause Button */}
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => setIsPlaying(!isPlaying)}
      >
        {!isPlaying && <Icon name="play-circle" size={70} color="#fff" />}
      </TouchableOpacity>

      {/* Mute Button */}
      <TouchableOpacity style={styles.muteButton} onPress={() => setIsMuted(!isMuted)}>
        <Icon name={isMuted ? 'volume-mute' : 'volume-high'} size={24} color="#fff" />
      </TouchableOpacity>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(currentTime / duration) * 100}%` }]} />
        </View>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Right Actions */}
      <View style={styles.rightActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
          <Icon name={isLiked ? 'heart' : 'heart-outline'} size={32} color={isLiked ? '#ff3040' : '#fff'} />
          <Text style={styles.actionText}>{formatNumber(likesCount)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Comments', { videoId })}>
          <Icon name="chatbubble-outline" size={30} color="#fff" />
          <Text style={styles.actionText}>{formatNumber(video.commentsCount || 0)}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
          <Icon name={isSaved ? 'bookmark' : 'bookmark-outline'} size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Icon name="paper-plane-outline" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.avatarButton} onPress={() => navigation.navigate('Profile', { userId: video.user?._id })}>
          <Image source={{ uri: video.user?.avatar }} style={styles.avatar} />
        </TouchableOpacity>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <Text style={styles.username}>@{video.user?.username}</Text>
        <Text style={styles.title}>{video.title}</Text>
        {video.description ? <Text style={styles.description}>{video.description}</Text> : null}
        <View style={styles.hashtags}>
          {video.hashtags?.map((tag, index) => (
            <Text key={index} style={styles.hashtag}>#{tag}</Text>
          ))}
        </View>
      </View>
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
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: '#fff',
    fontSize: 18
  },
  video: {
    width: width,
    height: height,
    position: 'absolute',
    top: 0,
    left: 0
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 30,
    padding: 8
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -35,
    marginTop: -35,
    zIndex: 10
  },
  muteButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 10
  },
  progressContainer: {
    position: 'absolute',
    bottom: 80,
    left: 20,
    right: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  progressBar: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2
  },
  timeText: {
    color: '#fff',
    fontSize: 12
  },
  rightActions: {
    position: 'absolute',
    right: 10,
    bottom: 120,
    alignItems: 'center',
    gap: 24
  },
  actionButton: {
    alignItems: 'center'
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4
  },
  avatarButton: {
    marginTop: 10
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff'
  },
  bottomInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 80,
    gap: 6
  },
  username: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600'
  },
  title: {
    color: '#fff',
    fontSize: 14
  },
  description: {
    color: '#ccc',
    fontSize: 13
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  hashtag: {
    color: '#0095f6',
    fontSize: 13
  }
});
