import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import api from '../utils/api';
import navigation from '../navigation/RootNavigation';

// Foydalanuvchi ruxsatini so'rash
export async function requestUserPermission() {
    try {
        const authStatus = await messaging().requestPermission();
        const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
                        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
        if (enabled) {
            console.log('✅ Notification permission granted');
            return true;
        } else {
            console.log('❌ Notification permission denied');
            return false;
        }
    } catch (error) {
        console.error('Permission error:', error);
        return false;
    }
}

// FCM tokenni olish
export async function getFCMToken() {
    try {
        const token = await messaging().getToken();
        console.log('📱 FCM Token:', token);
        
        // Tokenni backendga saqlash
        await saveDeviceToken(token);
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
}

// Device tokenni backendga saqlash
export async function saveDeviceToken(token) {
    try {
        await api.post('/notifications/device-token', {
            token,
            deviceType: Platform.OS,
            deviceName: Platform.OS === 'ios' ? 'iPhone' : 'Android'
        });
        console.log('✅ Device token saved to backend');
    } catch (error) {
        console.error('Error saving device token:', error);
    }
}

// Notification listenerlarni o'rnatish
export function setupNotificationListeners() {
    // Foreground (app ochiq) xabarlar
    messaging().onMessage(async remoteMessage => {
        console.log('📨 Foreground notification:', remoteMessage);
        showLocalNotification(remoteMessage);
    });

    // Background (app yopiq) xabarlar
    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('📨 Background notification:', remoteMessage);
    });

    // Notification bosilganda app ochilganda
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('📱 Notification opened app:', remoteMessage);
        handleNotificationClick(remoteMessage.data);
    });

    // App butunlay yopiq holatdan ochilganda
    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
            console.log('📱 App opened from quit state:', remoteMessage);
            handleNotificationClick(remoteMessage.data);
        }
    });
}

// Local notification ko'rsatish
function showLocalNotification(remoteMessage) {
    const { notification, data } = remoteMessage;
    
    // Platformaga qarab notification ko'rsatish
    if (Platform.OS === 'ios') {
        // iOS uchun custom notification
        console.log('iOS notification:', notification?.title);
    } else {
        // Android uchun custom notification
        console.log('Android notification:', notification?.title);
    }
    
    // In-app alert ko'rsatish
    Alert.alert(
        notification?.title || 'ReelFlow',
        notification?.body || 'Yangi bildirishnoma',
        [
            {
                text: 'Ko\'rish',
                onPress: () => handleNotificationClick(data)
            },
            {
                text: 'Yopish',
                style: 'cancel'
            }
        ]
    );
}

// Notification bosilganda navigatsiya qilish
function handleNotificationClick(data) {
    if (!data) return;
    
    console.log('🔍 Notification data:', data);
    
    switch (data.type) {
        case 'like':
        case 'comment':
            // Videoga o'tish
            if (data.videoId) {
                navigation.navigate('VideoPlayer', { videoId: data.videoId });
            }
            break;
            
        case 'follow':
            // Profilga o'tish
            if (data.username) {
                navigation.navigate('Profile', { username: data.username });
            }
            break;
            
        case 'message':
            // Chatga o'tish
            if (data.userId) {
                navigation.navigate('Chat', { userId: data.userId, username: data.username });
            }
            break;
            
        case 'live':
            // Jonli efirga o'tish
            if (data.liveId) {
                navigation.navigate('LiveStream', { liveId: data.liveId });
            }
            break;
            
        case 'verified':
            // Tasdiqlangan sahifasiga o'tish
            navigation.navigate('Profile');
            break;
            
        case 'achievement':
            // Yutuqlar sahifasiga o'tish
            navigation.navigate('Achievements');
            break;
            
        case 'gift':
            // Video yoki profilga o'tish
            if (data.videoId) {
                navigation.navigate('VideoPlayer', { videoId: data.videoId });
            } else {
                navigation.navigate('Profile');
            }
            break;
            
        case 'subscription':
            // Kanal sahifasiga o'tish
            if (data.channelId) {
                navigation.navigate('Channel', { channelId: data.channelId });
            }
            break;
            
        default:
            // Default - bosh sahifaga o'tish
            navigation.navigate('Home');
            break;
    }
}

// Notificationlarni yangilash (polling)
export async function fetchUnreadCount() {
    try {
        const response = await api.get('/notifications/unread/count');
        return response.data.unreadCount;
    } catch (error) {
        console.error('Error fetching unread count:', error);
        return 0;
    }
}

// Barcha notificationlarni o'qilgan qilish
export async function markAllAsRead() {
    try {
        await api.put('/notifications/read-all');
        return true;
    } catch (error) {
        console.error('Error marking all as read:', error);
        return false;
    }
}

// Bitta notificationni o'qilgan qilish
export async function markAsRead(notificationId) {
    try {
        await api.put(`/notifications/${notificationId}/read`);
        return true;
    } catch (error) {
        console.error('Error marking as read:', error);
        return false;
    }
}

// Init notification system
export async function initNotifications() {
    const permission = await requestUserPermission();
    if (permission) {
        await getFCMToken();
        setupNotificationListeners();
    }
}
