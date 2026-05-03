import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success' | ''>('');
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    if (submitting) return;

    if (!name.trim() || !email.trim() || !password.trim()) {
      setMessage('Please fill all fields');
      setMessageType('error');
      return;
    }

    if (password.trim().length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      return;
    }

    setSubmitting(true);
    setMessage('');
    setMessageType('');

    const result = await register(name.trim(), email.trim(), password);

    if (!result.ok) {
      setMessage(result.message || 'Registration failed');
      setMessageType('error');
      setSubmitting(false);
      return;
    }

    setMessage('Account created successfully');
    setMessageType('success');
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
    <View style={styles.container}>
      <Text style={styles.title}>🎓 Smart Campus</Text>
      <Text style={styles.subtitle}>Create your account</Text>

      <View style={styles.topTabs}>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.tabText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.tabButton, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>Sign Up</Text>
        </TouchableOpacity>
      </View>

      {!!message && (
        <View
          style={[
            styles.messageBox,
            messageType === 'error' ? styles.errorBox : styles.successBox,
          ]}
        >
          <Text style={styles.messageText}>{message}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#9ca3af"
        value={name}
        onChangeText={setName}
        editable={!submitting}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
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
        activeOpacity={0.9}
        onPress={handleRegister}
        disabled={submitting}
      >
        {submitting ? (
          <View style={styles.buttonRow}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.buttonText}>Creating account...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
  topTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#111827',
  },
  tabText: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#ffffff',
  },
  messageBox: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  errorBox: {
    backgroundColor: '#7f1d1d',
  },
  successBox: {
    backgroundColor: '#166534',
  },
  messageText: {
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 14,
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
    opacity: 0.7,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});