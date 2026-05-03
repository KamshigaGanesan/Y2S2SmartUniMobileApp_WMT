import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Stat = { value: string | number; label: string };

type Props = {
  title: string;
  subtitle: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  stats?: Stat[];
};

export default function HeroCard({
  title,
  subtitle,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  stats = [],
}: Props) {
  return (
    <LinearGradient
      colors={['#2563eb', '#1e3a8a']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroSection}
    >
      <View style={styles.heroGlowOne} />
      <View style={styles.heroGlowTwo} />

      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>

      {typeof searchValue === 'string' && onSearchChange ? (
        <TextInput
          style={styles.searchInput}
          placeholder={searchPlaceholder || 'Search...'}
          placeholderTextColor="#9ca3af"
          value={searchValue}
          onChangeText={onSearchChange}
        />
      ) : null}

      {stats.length > 0 ? (
        <View style={styles.statsRow}>
          {stats.map((stat) => (
            <View key={`${stat.label}-${stat.value}`} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  heroSection: {
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroGlowOne: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -25,
    right: -20,
  },
  heroGlowTwo: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -90,
    left: -35,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.7,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#dbeafe',
    lineHeight: 22,
    marginBottom: 16,
  },
   searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 96,
  },
   statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e3a8a',
  },
  statLabel: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
  },
});