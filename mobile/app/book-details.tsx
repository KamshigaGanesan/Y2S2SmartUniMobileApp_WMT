import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

export default function BookDetailsScreen() {
  const params = useLocalSearchParams();

  const title = params.title as string;
  const author = params.author as string;
  const module = params.module as string;
  const availability = params.availability as string;
  const description = params.description as string;
  const coverUrl = params.coverUrl as string;

  return (
    <>
      <Stack.Screen options={{ title: 'Book Details' }} />

      <ScrollView contentContainerStyle={styles.container}>
        {coverUrl ? (
          <Image source={{ uri: coverUrl }} style={styles.bookCover} resizeMode="cover" />
        ) : null}

        <View style={styles.card}>
          <Text style={styles.bookTitle}>{title}</Text>
          <Text style={styles.metaText}>Author: {author || 'N/A'}</Text>
          <Text style={styles.metaText}>Module: {module || 'General Resource'}</Text>

          <Text
            style={[
              styles.statusText,
              availability === 'Available'
                ? styles.statusAvailable
                : availability === 'Unavailable'
                ? styles.statusUnavailable
                : styles.statusOnline,
            ]}
          >
            {availability}
          </Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{description || 'No description available.'}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>
                {availability === 'Unavailable' ? 'Not Available' : 'Borrow Book'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f7fb',
    padding: 20,
    paddingBottom: 40,
  },
  bookCover: {
    width: '100%',
    height: 320,
    borderRadius: 18,
    marginBottom: 18,
    backgroundColor: '#e5e7eb',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 32,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 15,
    color: '#475569',
    marginBottom: 6,
    lineHeight: 22,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 18,
  },
  statusAvailable: {
    color: '#166534',
  },
  statusUnavailable: {
    color: '#b91c1c',
  },
  statusOnline: {
    color: '#0369a1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    color: '#6b7280',
    lineHeight: 24,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
});