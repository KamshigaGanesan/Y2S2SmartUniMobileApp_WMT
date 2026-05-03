import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function IndexScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  }, [user, loading, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}


/* 
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthScreen() {
  const router = useRouter();
  const { user, loading, login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)');
      }
    }
  }, [user, loading]);

  const handleSubmit = async () => {
    if (submitting) return;

    if (!email.trim() || !password.trim()) {
      setMessage('Please enter email and password');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setMessage('Please enter your name');
      return;
    }

    setSubmitting(true);
    setMessage('');

    let result;

    if (mode === 'login') {
      result = await login(email.trim(), password);
    } else {
      result = await register(name.trim(), email.trim(), password);
    }

    if (!result.ok) {
      setMessage(result.message || 'Authentication failed');
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Checking session...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎓 Smart Campus</Text>
      <Text style={styles.subtitle}>
        {mode === 'login' ? 'Login to continue' : 'Create your account'}
      </Text>

      <View style={styles.switchRow}>
        <TouchableOpacity
          style={[styles.switchButton, mode === 'login' && styles.activeSwitchButton]}
          onPress={() => {
            setMode('login');
            setMessage('');
          }}
        >
          <Text
            style={[
              styles.switchButtonText,
              mode === 'login' && styles.activeSwitchButtonText,
            ]}
          >
            Login
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.switchButton, mode === 'signup' && styles.activeSwitchButton]}
          onPress={() => {
            setMode('signup');
            setMessage('');
          }}
        >
          <Text
            style={[
              styles.switchButtonText,
              mode === 'signup' && styles.activeSwitchButtonText,
            ]}
          >
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {mode === 'signup' && (
        <TextInput
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor="#9ca3af"
          value={name}
          onChangeText={setName}
          editable={!submitting}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        editable={!submitting}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!submitting}
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.disabledButton]}
        activeOpacity={submitting ? 1 : 0.85}
        onPress={handleSubmit}
      >
        <Text style={styles.buttonText}>
          {submitting
            ? mode === 'login'
              ? 'Signing in...'
              : 'Creating account...'
            : mode === 'login'
            ? 'Login'
            : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <View style={styles.demoBox}>
        <Text style={styles.demoTitle}>Admin Demo Login</Text>
        <Text style={styles.demoText}>Email: admin@smartcampus.com</Text>
        <Text style={styles.demoText}>Password: admin123</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
    fontSize: 15,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#dbeafe',
    textAlign: 'center',
    marginBottom: 24,
  },
  switchRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeSwitchButton: {
    backgroundColor: '#111827',
  },
  switchButtonText: {
    color: '#dbeafe',
    fontWeight: '700',
  },
  activeSwitchButtonText: {
    color: '#ffffff',
  },
  message: {
    color: '#fde68a',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#111827',
    marginBottom: 14,
  },
  button: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  disabledButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  demoBox: {
    marginTop: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    padding: 14,
  },
  demoTitle: {
    color: '#ffffff',
    fontWeight: '700',
    marginBottom: 6,
  },
  demoText: {
    color: '#dbeafe',
    fontSize: 14,
    marginBottom: 2,
  },
});
*/