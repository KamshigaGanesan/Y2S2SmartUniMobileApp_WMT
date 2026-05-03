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

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReset = async () => {
    if (submitting) return;

    if (!email.trim() || !newPassword.trim()) {
      setSuccess(false);
      setMessage('Please fill all fields');
      return;
    }

    if (newPassword.trim().length < 6) {
      setSuccess(false);
      setMessage('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    setMessage('');

    const result = await forgotPassword(email.trim(), newPassword.trim());

    if (!result.ok) {
      setSuccess(false);
      setMessage(result.message || 'Password reset failed');
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setMessage(result.message || 'Password updated successfully');
    setSubmitting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your email and a new password</Text>

      {!!message && (
        <Text style={[styles.message, success ? styles.successMessage : styles.errorMessage]}>
          {message}
        </Text>
      )}

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
        placeholder="New Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
        editable={!submitting}
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.disabledButton]}
        onPress={handleReset}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>Update Password</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.push('/login' as any)}>
        <Text style={styles.backText}>Back to Login</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#dbeafe',
    textAlign: 'center',
    marginBottom: 24,
  },
  message: {
    textAlign: 'center',
    marginBottom: 14,
    fontWeight: '600',
  },
  successMessage: {
    color: '#bbf7d0',
  },
  errorMessage: {
    color: '#fde68a',
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
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  backText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});