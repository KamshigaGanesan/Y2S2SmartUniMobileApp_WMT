import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';

export default function AdminDashboardScreen() {
  const router = useRouter();

  const modules = [
    {
      id: 1,
      title: '📚 Manage Library',
      subtitle: 'Add, review, and organize books and resources.',
      route: '/admin/books',
    },
    {
      id: 2,
      title: '📢 Manage Announcements',
      subtitle: 'Post and manage campus notices and alerts.',
      route: '/admin/announcements',
    },
    {
      id: 3,
      title: '🍔 Manage Canteen',
      subtitle: 'Update food items, prices, and availability.',
      route: '/admin/canteen',
    },
    {
      id: 4,
      title: '🔍 Manage Lost & Found',
      subtitle: 'Review reports and update claim status.',
      route: '/admin/lostfound',
    },
    {
      id: 5,
      title: '👤 Visitor Records',
      subtitle: 'Track visitor check-ins and visit history.',
      route: '/admin/visitors',
    },
    {
  id: 6,
  title: '📦 Manage Orders',
  subtitle: 'Track and update canteen orders in real-time.',
  route: '/admin/orders',
},
  ];

  const stats = [
    { id: 1, value: '5', label: 'Admin Modules' },
    { id: 2, value: '4', label: 'Live Systems' },
    { id: 3, value: '1', label: 'Dashboard' },
  ];

  return (
    <>
      <Stack.Screen options={{ title: 'Admin Dashboard', headerShown: false }} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>🛠️ Admin Dashboard</Text>
          <Text style={styles.heroSubtitle}>
            Manage campus services, resources, and records from one clean control panel.
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

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⚡ Quick Overview</Text>
          <Text style={styles.sectionText}>
            This admin space is designed for simple and efficient management of the Smart Campus system.
            Use the modules below to control books, announcements, food items, lost & found reports,
            and visitor records.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>📂 Admin Modules</Text>

          {modules.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.moduleCard}
              activeOpacity={0.85}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={styles.moduleTitle}>{item.title}</Text>
              <Text style={styles.moduleSubtitle}>{item.subtitle}</Text>

              <View style={styles.openRow}>
                <Text style={styles.openText}>Open Module</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
  style={styles.backButton}
  activeOpacity={0.9}
  onPress={() => router.replace('/(tabs)/profile')}
>
  <Text style={styles.backIcon}>←</Text>
  <Text style={styles.backButtonText}>Back to App</Text>
</TouchableOpacity>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>✨ Admin Notes</Text>
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>• Add and maintain system data easily</Text>
            <Text style={styles.noteText}>• Review module records from one place</Text>
            <Text style={styles.noteText}>• Keep campus updates and services organized</Text>
            <Text style={styles.noteText}>• Expand later with auth, analytics, and reports</Text>
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
  heroSection: {
    backgroundColor: '#111827',
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#d1d5db',
    lineHeight: 22,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#1f2937',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 95,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statLabel: {
    fontSize: 13,
    color: '#d1d5db',
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
  },
  moduleCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  moduleTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  moduleSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  openRow: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  openText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  noteCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    padding: 14,
  },
  noteText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 22,
    marginBottom: 4,

},
backButtonText: {
  color: '#ffffff',
  fontWeight: 'bold',
  fontSize: 16,
  marginLeft: 8,
},
backButton: {
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#1e3a8a',
  paddingVertical: 16,
  borderRadius: 14,
  marginTop: 20,
  marginBottom: 12,

  // shadow (premium feel)
  shadowColor: '#1e3a8a',
  shadowOpacity: 0.25,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 5 },
  elevation: 4,
},
backIcon: {
  color: '#ffffff',
  fontSize: 18,
  fontWeight: 'bold',
},

});