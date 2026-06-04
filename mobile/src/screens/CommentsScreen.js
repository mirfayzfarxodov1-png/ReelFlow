import React, { useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CommentItem from '../components/CommentItem';

export default function CommentsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { videoId } = route.params;
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const response = await api.get(`/comments/${videoId}`);
      setComments(response.data);
    } catch (error) {
      console.error('Load comments error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setSending(true);
    try {
      const response = await api.post(`/comments/${videoId}`, { text: newComment });
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (error) {
      Alert.alert('Xato', 'Izoh qo\'shib bo\'lmadi');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      'Izohni o\'chirish',
      'Bu izohni o\'chirmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'O\'chirish',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/comments/${commentId}`);
              setComments(prev => prev.filter(c => c._id !== commentId));
            } catch (error) {
              Alert.alert('Xato', 'Izohni o\'chirib bo\'lmadi');
            }
          }
        }
      ]
    );
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await api.post(`/comments/${commentId}/like`);
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          return { ...comment, isLiked: response.data.liked, likesCount: response.data.likesCount };
        }
        return comment;
      }));
    } catch (error) {
      console.error('Like comment error:', error);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Izohlar</Text>
        <Text style={styles.headerCount}>{comments.length}</Text>
      </View>

      {/* Comments List */}
      <FlatList
        data={comments}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <CommentItem
            comment={item}
            currentUserId={user?._id}
            onDelete={() => handleDeleteComment(item._id)}
            onLike={() => handleLikeComment(item._id)}
          />
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Hozircha izohlar yo'q</Text>
            <Text style={styles.emptySubtext}>Birinchi izoh qoldiring!</Text>
          </View>
        }
      />

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Izoh yozish..."
          placeholderTextColor="#888"
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, (!newComment.trim() || sending) && styles.disabledButton]}
          onPress={handleAddComment}
          disabled={!newComment.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="send" size={20} color="#fff" />
          )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    gap: 16
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center'
  },
  headerCount: {
    color: '#888',
    fontSize: 14
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center'
  },
  emptyText: {
    color: '#888',
    fontSize: 16
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
    marginTop: 8
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#1a1a1a'
  }
});
