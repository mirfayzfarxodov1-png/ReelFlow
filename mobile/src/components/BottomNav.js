import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function BottomNav() {
  const navigation = useNavigation();
  const route = useRoute();
  
  const menuItems = [
    { name: 'Home', icon: 'home-outline', activeIcon: 'home', label: 'Bosh' },
    { name: 'Search', icon: 'search-outline', activeIcon: 'search', label: 'Qidiruv' },
    { name: 'Upload', icon: 'add-circle-outline', activeIcon: 'add-circle', label: 'Yuklash' },
    { name: 'Notifications', icon: 'heart-outline', activeIcon: 'heart', label: 'Bildirish' },
    { name: 'Profile', icon: 'person-outline', activeIcon: 'person', label: 'Men' }
  ];

  const isActive = (screenName) => {
    return route.name === screenName;
  };

  const handlePress = (screenName) => {
    navigation.navigate(screenName);
  };

  return (
    <View style={styles.container}>
      {menuItems.map((item) => (
        <TouchableOpacity
          key={item.name}
          style={styles.navItem}
          onPress={() => handlePress(item.name)}
        >
          <Icon
            name={isActive(item.name) ? item.activeIcon : item.icon}
            size={26}
            color={isActive(item.name) ? '#fff' : '#888'}
          />
          <Text
            style={[
              styles.navLabel,
              isActive(item.name) && styles.activeLabel
            ]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: Platform.OS === 'ios' ? 20 : 10,
    paddingBottom: Platform.OS === 'ios' ? 30 : 10,
    borderTopWidth: 1,
    borderTopColor: '#222'
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4
  },
  navLabel: {
    color: '#888',
    fontSize: 11
  },
  activeLabel: {
    color: '#fff'
  }
});
