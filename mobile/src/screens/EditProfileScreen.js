import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function EditProfileScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [website, setWebsite] = useState(user?.website || '');
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);

  const handleChangeAvatar = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      quality: 0.8
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) return;
      if (response.error) {
        Alert.alert('Xato', response.error);
        return;
      }
      const asset = response.assets[0];
      setAvatar(asset.uri);
    });
  };

  const handleSave = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('bio', bio);
    formData.append('website', website);
    
    if (avatar && avatar !== user?.avatar) {
      formData.append('avatar', {
        uri: avatar,
        type: 'image/jpeg',
        name: 'avatar.jpg'
      });
    }

    try {
      const response = await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUser(response.data);
      Alert.alert('Muvaffaqiyatli', 'Profil yangilandi', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Xato', error.response?.data?.message || 'Yangilashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Avatar Section */}
      <TouchableOpacity style={styles.avatarSection} onPress={handleChangeAvatar}>
        <Image source={{ uri: avatar || user?.avatar }} style={styles.avatar} />
        <View style={styles.changeAvatarBadge}>
          <Icon name="camera" size={16} color="#fff" />
        </View>
        <Text style={styles.changeAvatarText}>Rasmni o'zgartirish</Text>
      </TouchableOpacity>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>To'liq ism</Text>
          <TextInput
            style={styles.input}
            placeholder="Ismingiz"
            placeholderTextColor="#888"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="O'zingiz haqingizda"
            placeholderTextColor="#888"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.charCount}>{bio.length}/150</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Veb-sayt</Text>
          <TextInput
            style={styles.input}
            placeholder="https://..."
            placeholderTextColor="#888"
            value={website}
            onChangeText={setWebsite}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Saqlash</Text>
          )}
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  changeAvatarBadge: {
    position: 'absolute',
    bottom: 25,
    right: '40%',
    backgroundColor: '#0095f6',
    borderRadius: 15,
    padding: 6
  },
  changeAvatarText: {
    color: '#0095f6',
    marginTop: 12,
    fontSize: 14
  },
  form: {
    padding: 20,
    gap: 24
  },
  inputGroup: {
    gap: 8
  },
  label: {
    color: '#888',
    fontSize: 14
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
  charCount: {
    color: '#888',
    fontSize: 11,
    textAlign: 'right'
  },
  saveButton: {
    backgroundColor: '#0095f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20
  },
  disabledButton: {
    backgroundColor: '#1a1a1a'
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});
