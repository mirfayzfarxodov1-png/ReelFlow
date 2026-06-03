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

const { width } = Dimensions.get('window');

export default function VideoCard({ video, navigation }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(video.likes?.length || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(likesCount - 1);
    } else {
      setLikesCount(likesCount + 1);
    }
    setIsLiked(!isLiked);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.userInfo}>
          <Image source={{ uri: video.user?.avatar }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>@{video.user?.username}</Text>
            <Text style={styles.time}>2 soat oldin</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.followBtn}>Kuzatish</Text>
        </TouchableOpacity>
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
          resizeMode="cover"
          repeat={true}
          poster={video.thumbnailUrl}
          posterResizeMode="cover"
        />
        <View style={styles.playIcon}>
          {!isPlaying && <Icon name="play-circle" size={50} color="#fff" />}
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionBtn}>
          <Icon
            name={isLiked ? 'heart' : 'heart-outline'}
            size={28}
            color={isLiked ? '#ff3040' : '#fff'}
          />
          <Text style={styles.actionText}>{likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Comments', { videoId: video._id })}
          style={styles.actionBtn}
        >
          <Icon name="chatbubble-outline" size={26} color="#fff" />
          <Text style={styles.actionText}>{video.comments?.length || 0}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Icon name="paper-plane-outline" size={26} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSaved(!isSaved)} style={styles.actionBtn}>
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
          <Text style={styles.username}>@{video.user?.username}</Text> {video.title}
        </Text>
        <Text style={styles.hashtags}>{video.hashtags?.join(' ')}</Text>
      </View>
    </View>
  );
}

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
    color: '#0095f6',
    fontWeight: '600',
    fontSize: 13,
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
});
