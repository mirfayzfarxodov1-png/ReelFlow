import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Chiqish',
      'Hisobingizdan chiqmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        { text: 'Chiqish', style: 'destructive', onPress: logout }
      ]
    );
  };

  const menuItems = [
    { icon: 'person-outline', title: 'Profil', onPress: () => navigation.navigate('EditProfile') },
    { icon: 'lock-closed-outline', title: 'Maxfiylik', onPress: () => navigation.navigate('PrivacySettings') },
    { icon: 'notifications-outline', title: 'Bildirishnomalar', onPress: () => navigation.navigate('NotificationSettings') },
    { icon: 'shield-checkmark-outline', title: 'Xavfsizlik', onPress: () => navigation.navigate('SecuritySettings') },
    { icon: 'language-outline', title: 'Til', onPress: () => navigation.navigate('LanguageSettings') },
    { icon: 'help-circle-outline', title: 'Yordam', onPress: () => navigation.navigate('Help') },
    { icon: 'information-circle-outline', title: 'Ilova haqida', onPress: () => navigation.navigate('About') }
  ];

  const preferenceItems = [
    { title: 'Push bildirishnomalar', value: pushEnabled, onValueChange: setPushEnabled },
    { title: 'Qora rejim', value: darkMode, onValueChange: setDarkMode },
    { title: 'Avtomatik ijro', value: autoPlay, onValueChange: setAutoPlay }
  ];

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.userSection}>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userId}>ID: {user?._id}</Text>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sozlamalar</Text>
        {preferenceItems.map((item, index) => (
          <View key={index} style={styles.preferenceItem}>
            <Text style={styles.preferenceText}>{item.title}</Text>
            <Switch
              value={item.value}
              onValueChange={item.onValueChange}
              trackColor={{ false: '#333', true: '#0095f6' }}
              thumbColor="#fff"
            />
          </View>
        ))}
      </View>

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hisob</Text>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <Icon name={item.icon} size={24} color="#fff" />
            <Text style={styles.menuText}>{item.title}</Text>
            <Icon name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={24} color="#ff3b30" />
        <Text style={styles.logoutText}>Chiqish</Text>
      </TouchableOpacity>

      {/* Version */}
      <Text style={styles.versionText}>ReelFlow v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  userSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
    alignItems: 'center'
  },
  userEmail: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  userId: {
    color: '#888',
    fontSize: 12,
    marginTop: 4
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16
  },
  sectionTitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 12,
    letterSpacing: 0.5
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#111'
  },
  preferenceText: {
    color: '#fff',
    fontSize: 16
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#111',
    gap: 12
  },
  menuText: {
    flex: 1,
    color: '#fff',
    fontSize: 16
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    gap: 8
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600'
  },
  versionText: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 20
  }
});
