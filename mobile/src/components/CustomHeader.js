import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function CustomHeader({ title, showBack = false, showMenu = false, rightComponent }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {showBack && (
        <TouchableOpacity style={styles.leftButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      
      {showMenu && (
        <TouchableOpacity style={styles.leftButton} onPress={() => navigation.openDrawer()}>
          <Icon name="menu" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      
      <Text style={styles.title}>{title}</Text>
      
      {rightComponent ? (
        rightComponent
      ) : (
        <View style={styles.rightPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    backgroundColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#222'
  },
  leftButton: {
    width: 40
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center'
  },
  rightPlaceholder: {
    width: 40
  }
});
