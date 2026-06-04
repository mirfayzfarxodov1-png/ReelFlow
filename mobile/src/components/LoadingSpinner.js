import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  Text
} from 'react-native';

export default function LoadingSpinner({ message = 'Yuklanmoqda...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  text: {
    color: '#888',
    marginTop: 16,
    fontSize: 14
  }
});
