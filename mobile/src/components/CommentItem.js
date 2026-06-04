import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

export default function CommentItem({ comment, currentUserId, onDelete, onLike }) {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likesCount || 0);
  const [showReplies, setShowReplies] = useState(false);

  const isOwn = comment.user?._id === currentUserId;

  const handleLike = () => {
    if (isLiked) {
      setLikesCount(prev => prev - 1);
    } else {
      setLikesCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
    onLike();
  };

  const formatNumber = (num) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hozirgina';
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    if (days < 7) return `${days} kun oldin`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: comment.user?.avatar }} style={styles.avatar} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.username}>@{comment.user?.username}</Text>
          <Text style={styles.time}>{formatTime(comment.createdAt)}</Text>
        </View>
        
        <Text style={styles.text}>{comment.text}</Text>
        
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Icon
              name={isLiked ? 'heart' : 'heart-outline'}
              size={16}
              color={isLiked ? '#ff3040' : '#888'}
            />
            {likesCount > 0 && <Text style={styles.actionText}>{formatNumber(likesCount)}</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Icon name="chatbubble-outline" size={16} color="#888" />
            {comment.replyCount > 0 && <Text style={styles.actionText}>{comment.replyCount}</Text>}
          </TouchableOpacity>
          
          {isOwn && (
            <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
              <Icon name="trash-outline" size={16} color="#ff3b30" />
            </TouchableOpacity>
          )}
        </View>
        
        {comment.replies && comment.replies.length > 0 && (
          <TouchableOpacity onPress={() => setShowReplies(!showReplies)}>
            <Text style={styles.showRepliesText}>
              {showReplies ? 'Yashirish' : `${comment.replies.length} ta javobni ko'rish`}
            </Text>
          </TouchableOpacity>
        )}
        
        {showReplies && comment.replies?.map((reply) => (
          <CommentItem
            key={reply._id}
            comment={reply}
            currentUserId={currentUserId}
            onDelete={() => onDelete(reply._id)}
            onLike={() => onLike(reply._id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18
  },
  content: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4
  },
  username: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600'
  },
  time: {
    color: '#888',
    fontSize: 11
  },
  text: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  actionText: {
    color: '#888',
    fontSize: 11
  },
  showRepliesText: {
    color: '#0095f6',
    fontSize: 12,
    marginTop: 4
  }
});
