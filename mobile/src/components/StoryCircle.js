import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export default function StoryCircle({ story, navigation }) {
  if (story.isAdd) {
    return (
      <TouchableOpacity style={styles.container} onPress={() => navigation.navigate('CreateStory')}>
        <View style={[styles.ring, styles.addRing]}>
          <View style={styles.addAvatar}>
            <Icon name="add" size={30} color="#fff" />
          </View>
        </View>
        <Text style={styles.name}>Qo'shish</Text>
      </TouchableOpacity>
    );
  }

  const hasUnseen = story.hasUnseen || false;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => navigation.navigate('StoryViewer', { storyId: story._id })}
    >
      <View style={[styles.ring, hasUnseen && styles.unseenRing]}>
        <Image source={{ uri: story.user?.avatar }} style={styles.avatar} />
      </View>
      <Text style={styles.name} numberOfLines={1}>
        {story.user?.username}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: 16,
    width: 70
  },
  ring: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center'
  },
  unseenRing: {
    borderColor: '#f09433'
  },
  addRing: {
    borderColor: '#333'
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31
  },
  addAvatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center'
  },
  name: {
    color: '#ccc',
    fontSize: 11,
    marginTop: 6,
    textAlign: 'center'
  }
});
