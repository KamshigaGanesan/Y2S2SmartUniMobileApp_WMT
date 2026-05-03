import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  message: string;
  type?: 'success' | 'error' | 'info';
  onDismiss: () => void;
};

export default function StatusBanner({ message, type = 'info', onDismiss }: Props) {
  return (
    <View
      style={[
        styles.box,
        type === 'success' ? styles.success : type === 'error' ? styles.error : styles.info,
      ]}
    >
      <Text style={styles.text}>{message}</Text>
      <TouchableOpacity style={styles.button} activeOpacity={0.88} onPress={onDismiss}>
        <Text style={styles.buttonText}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  success: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
  },
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  info: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd',
  },text: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});