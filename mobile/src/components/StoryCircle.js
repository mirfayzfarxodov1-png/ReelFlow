import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function StoryCircle({ story }) {
  if (story.isAdd) {
    return (
      <TouchableOpacity style={styles.container}>
        <View style={[styles.ring, styles.addRing]}>
          <View style={styles.addAvatar}>
            <Icon name="add" size={30} color="#fff" />
          </View>
        </View>
        <Text style={styles.username}>Qo'shish</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container}>
      <View style={styles.ring}>
        <Image source={{ uri: story.avatar }} style={styles.avatar} />
      </View>
      <Text style={styles.username} numberOfLines={1}>
        {story.username}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  ring: {
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
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  addAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    color: '#ccc',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center',
  },
});
