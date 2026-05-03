import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase?.() === 'admin';

  const stats = [
    { id: 1, value: '6', label: 'Books Borrowed' },
    { id: 2, value: '4', label: 'Saved Resources' },
    { id: 3, value: '3', label: 'Campus Updates' },
  ];

  const quickActions = [
    {
      id: 1,
      emoji: '🍔',
      title: 'Canteen',
      text: 'Browse meals and place food orders.',
      route: '/canteen',
    },
    {
      id: 2,
      emoji: '📚',
      title: 'Library',
      text: 'Search books, publications, and resources.',
      route: '/library',
    },
    {
      id: 3,
      emoji: '🔍',
      title: 'Lost & Found',
      text: 'Report and find missing items easily.',
      route: '/lostfound',
    },
    {
      id: 4,
      emoji: '📢',
      title: 'Announcements',
      text: 'Stay updated with campus notices.',
      route: '/announcements',
    },
    {
      id: 5,
      emoji: '👤',
      title: 'Visitor Sign-In',
      text: 'Register visitors securely and quickly.',
      route: '/visitor',
    },
    {
      id: 6,
      emoji: '🏛️',
      title: 'Campus Directory',
      text: 'Find lecturers, staff, offices, and help contacts.',
      route: '/campus-directory',
    },
  ];

  const activities = [
    'Library resources updated today',
    'New canteen menu is available',
    '2 new lecturer publications added',
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.appName}>🎓 Smart Campus App</Text>
        <Text style={styles.tagline}>Your all-in-one university companion</Text>
        <Text style={styles.welcome}>
          Welcome back, {isAdmin ? 'Admin 👑' : 'Student 👋'}
        </Text>

        <View style={styles.statsRow}>
          {stats.map((item) => (
            <View key={item.id} style={styles.statCard}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌟 Today’s Highlight</Text>
        <View style={styles.highlightCard}>
          <Text style={styles.highlightHeading}>Campus services are active</Text>
          <Text style={styles.highlightText}>
            Explore new library resources, current announcements, available canteen items,
            and important staff contacts from your dashboard.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Quick Access</Text>

        <View style={styles.quickGrid}>
          {quickActions.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.quickTile}
              activeOpacity={0.85}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.quickEmoji}>{item.emoji}</Text>
              <Text style={styles.quickTitle}>{item.title}</Text>
              <Text style={styles.quickText}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>
        <View style={styles.activityCard}>
          {activities.map((item, index) => (
            <View key={index} style={styles.activityRow}>
              <View style={styles.activityDot} />
              <Text style={styles.activityText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📌 Suggested Next Step</Text>
        <View style={styles.tipCard}>
          <View style={styles.tipAccent} />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Open Campus Directory for help routing</Text>
            <Text style={styles.tipText}>
              Find the correct lecturer, academic office, non-academic staff member,
              or emergency contact based on your issue.
            </Text>

            <TouchableOpacity
              style={styles.tipButton}
              activeOpacity={0.85}
              onPress={() => router.push('/campus-directory')}
            >
              <Text style={styles.tipButtonText}>Go to Campus Directory</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isAdmin && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛠️ Management</Text>
          <TouchableOpacity
            style={styles.adminCard}
            activeOpacity={0.85}
            onPress={() => router.push('/admin')}
          >
            <View style={styles.adminHeader}>
              <Text style={styles.adminEmoji}>🛠️</Text>
              <View style={styles.adminTextWrap}>
                <Text style={styles.adminTitle}>Admin Panel</Text>
                <Text style={styles.adminSubtitle}>
                  Manage books, announcements, canteen items, lost & found, and visitors.
                </Text>
              </View>
            </View>

            <View style={styles.adminButton}>
              <Text style={styles.adminButtonText}>Open Admin Dashboard</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f4f7fb',
    paddingBottom: 30,
  },
  hero: {
    backgroundColor: '#1e3a8a',
    paddingTop: 70,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  appName: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tagline: {
    fontSize: 16,
    color: '#dbeafe',
    marginTop: 8,
  },
  welcome: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 16,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 18,
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    minWidth: 100,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  statLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 22,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  highlightCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  highlightHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  highlightText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickTile: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  quickEmoji: {
    fontSize: 24,
    marginBottom: 10,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  quickText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 19,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: '#1e3a8a',
    marginRight: 10,
  },
  activityText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  tipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  tipAccent: {
    width: 6,
    backgroundColor: '#1e3a8a',
  },
  tipContent: {
    flex: 1,
    padding: 18,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
    marginBottom: 14,
  },
  tipButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  tipButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  adminCard: {
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  adminEmoji: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  adminTextWrap: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  adminSubtitle: {
    fontSize: 14,
    color: '#d1d5db',
    lineHeight: 21,
  },
  adminButton: {
    marginTop: 16,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  adminButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
