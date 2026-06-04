import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import Video from 'react-native-video';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function UploadScreen({ navigation }) {
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [uploading, setUploading] = useState(false);

  const selectVideo = (useCamera = false) => {
    const options = {
      mediaType: 'video',
      videoQuality: 'high',
      includeBase64: false,
      maxDuration: 60
    };

    const callback = (response) => {
      if (response.didCancel) return;
      if (response.error) {
        Alert.alert('Xato', response.error);
        return;
      }
      const asset = response.assets[0];
      setVideo({
        uri: asset.uri,
        type: asset.type,
        name: asset.fileName
      });
      
      // Extract thumbnail
      if (asset.thumbnails && asset.thumbnails[0]) {
        setThumbnail({ uri: asset.thumbnails[0] });
      }
    };

    if (useCamera) {
      launchCamera(options, callback);
    } else {
      launchImageLibrary(options, callback);
    }
  };

  const handleUpload = async () => {
    if (!video) {
      Alert.alert('Xato', 'Video tanlang');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Xato', 'Video sarlavhasini kiriting');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('hashtags', hashtags);
    formData.append('isPrivate', isPrivate);
    formData.append('video', {
      uri: video.uri,
      type: video.type || 'video/mp4',
      name: video.name || 'video.mp4'
    });

    if (thumbnail) {
      formData.append('thumbnail', {
        uri: thumbnail.uri,
        type: 'image/jpeg',
        name: 'thumbnail.jpg'
      });
    }

    try {
      await api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      Alert.alert('Muvaffaqiyatli', 'Video yuklandi!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Xato', error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (uploading) {
    return (
      <View style={styles.uploadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.uploadingText}>Video yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Video Preview */}
      <TouchableOpacity
        style={styles.videoPreview}
        onPress={() => selectVideo()}
      >
        {video ? (
          <Video
            source={{ uri: video.uri }}
            style={styles.video}
            paused={true}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderPreview}>
            <Icon name="videocam" size={60} color="#888" />
            <Text style={styles.placeholderText}>Video tanlang</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.selectButton} onPress={() => selectVideo(false)}>
                <Text style={styles.selectButtonText}>GALEREYA</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.selectButton} onPress={() => selectVideo(true)}>
                <Text style={styles.selectButtonText}>KAMERA</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Form */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Sarlavha"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tavsif"
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
        <TextInput
          style={styles.input}
          placeholder="Hashtaglar (vergul bilan ajrating)"
          placeholderTextColor="#888"
          value={hashtags}
          onChangeText={setHashtags}
        />
        
        <TouchableOpacity
          style={styles.privateOption}
          onPress={() => setIsPrivate(!isPrivate)}
        >
          <Icon
            name={isPrivate ? 'checkbox' : 'square-outline'}
            size={24}
            color={isPrivate ? '#0095f6' : '#888'}
          />
          <Text style={styles.privateText}>Shaxsiy video</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.uploadButton, (!video || !title) && styles.disabledButton]}
          onPress={handleUpload}
          disabled={!video || !title}
        >
          <Text style={styles.uploadButtonText}>Yuklash</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  uploadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadingText: {
    color: '#fff',
    marginTop: 16
  },
  videoPreview: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#1a1a1a'
  },
  video: {
    width: '100%',
    height: '100%'
  },
  placeholderPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  placeholderText: {
    color: '#888',
    marginTop: 16,
    marginBottom: 24
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16
  },
  selectButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  selectButtonText: {
    color: '#fff',
    fontWeight: '600'
  },
  form: {
    padding: 16,
    gap: 16
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  privateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8
  },
  privateText: {
    color: '#fff',
    fontSize: 15
  },
  uploadButton: {
    backgroundColor: '#0095f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  disabledButton: {
    backgroundColor: '#1a1a1a'
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
