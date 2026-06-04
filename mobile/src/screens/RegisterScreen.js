import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert('Xato', 'Barcha maydonlarni to\'ldiring');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Xato', 'Parollar mos kelmadi');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Xato', 'Parol kamida 6 belgidan iborat bo\'lishi kerak');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Xato', 'Username kamida 3 belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    const result = await register(username, email, password, fullName);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Xato', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo.png')}
            style={styles.logo}
          />
          <Text style={styles.logoText}>ReelFlow</Text>
          <Text style={styles.tagline}>Yangi akkaunt yaratish</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="To'liq ism"
            placeholderTextColor="#888"
            value={fullName}
            onChangeText={setFullName}
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Parol"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Parolni takrorlang"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Ro'yxatdan o'tish</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>
              Hisobingiz bormi? <Text style={styles.loginLink}>Kirish</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 12
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff'
  },
  tagline: {
    fontSize: 14,
    color: '#888',
    marginTop: 4
  },
  form: {
    gap: 14
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15
  },
  passwordContainer: {
    position: 'relative'
  },
  passwordInput: {
    paddingRight: 50
  },
  registerButton: {
    backgroundColor: '#0095f6',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 8
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  loginText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20
  },
  loginLink: {
    color: '#0095f6',
    fontWeight: '600'
  }
});
