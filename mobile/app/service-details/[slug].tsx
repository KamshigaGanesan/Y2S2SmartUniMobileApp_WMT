import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ServiceDetailsScreen() {
  const { slug } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen options={{ title: 'Library Service' }} />
      <LinearGradient colors={['#eef2ff', '#f8fafc']} style={styles.container}>
        <Text style={styles.title}>Library Service Details</Text>
        <Text style={styles.subtitle}>
          This is a placeholder screen for a library service.
        </Text>
        <View style={styles.card}>
          <Text style={styles.slugText}>
            You have navigated to the service with the slug:
          </Text>
          <Text style={styles.slugValue}>{slug}</Text>
          <Text style={styles.infoText}>
            This screen can be customized to show specific details, forms, or actions related to the selected service.
          </Text>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e3a8a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  slugText: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 12,
  },
  slugValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#be185d',
    backgroundColor: '#fce7f3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});
