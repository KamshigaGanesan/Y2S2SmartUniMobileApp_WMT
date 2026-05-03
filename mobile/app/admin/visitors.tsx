import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  LayoutAnimation,
  UIManager,
  Platform,
} from 'react-native';
import { apiUrl } from '@/constants/api';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type VisitStatus = 'Checked In' | 'Checked Out';

type Visitor = {
  id: string;
  name: string;
  nic: string;
  contact: string;
  purpose: string;
  destination: string;
  date: string;
  time: string;
  status: VisitStatus;
};

export default function AdminVisitorsScreen() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [searchText, setSearchText] = useState('');

  const { user } = useAuth();

  useEffect(() => {
    fetchVisitors();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const fetchVisitors = async () => {
    try {
      const response = await fetch(apiUrl('/visitors'));
      const data = await response.json();

      const mapped: Visitor[] = data.map((item: any) => ({
        id: item._id,
        name: item.fullName,
        nic: item.nic,
        contact: item.phoneNumber,
        purpose: item.purpose,
        destination: item.personToMeet,
        date: item.checkInDate,
        time: item.checkInTime,
        status: item.status,
      }));

      setVisitors(mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.log('Error fetching visitors:', error);
      showMessage('Failed to load visitor records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredVisitors = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (q === '') return visitors;

    return visitors.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.nic.toLowerCase().includes(q) ||
        item.contact.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q) ||
        item.destination.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q)
    );
  }, [visitors, searchText]);

  const handleCheckOut = async (id: string, name: string, current: VisitStatus) => {
    if (current === 'Checked Out') {
      showMessage(`${name} is already checked out.`, 'error');
      return;
    }

    try {
      const response = await fetch(apiUrl(`/visitors/${id}/checkout`), {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user?.token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update visitor');
      }

      const updated = await response.json();
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setVisitors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: updated.status } : v))
      );
      showMessage(`${name} has been successfully checked out.`, 'success');
    } catch (error) {
      console.log(error);
      showMessage('Failed to update visitor status.', 'error');
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Confirm Deletion', `Are you sure you want to delete the record for ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(apiUrl(`/visitors/${id}`), {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${user?.token}` },
            });

            if (!response.ok) throw new Error('Failed to delete');

            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setVisitors((prev) => prev.filter((v) => v.id !== id));
            showMessage(`Record for ${name} deleted.`, 'success');
          } catch (error) {
            showMessage('Failed to delete visitor record.', 'error');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Admin Visitors' }} />
        <LinearGradient colors={['#eef2ff', '#f8fafc']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Loading Visitor Records...</Text>
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Admin Visitors' }} />
      <LinearGradient colors={['#eef2ff', '#f8fafc']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>👤 Visitor Records</Text>
          <Text style={styles.subtitle}>
            Monitor all visitor check-ins and manage campus entry records.
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, NIC, purpose..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />

          {message ? (
            <View style={[styles.messageBox, messageType === 'success' ? styles.successBox : styles.errorBox]}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          {filteredVisitors.length === 0 ? (
            <Text style={styles.emptyText}>No matching visitors found.</Text>
          ) : (
            filteredVisitors.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={[styles.badge, item.status === 'Checked In' ? styles.inBadge : styles.outBadge]}>
                    {item.status}
                  </Text>
                </View>

                <View style={styles.detailGrid}>
                  <Text style={styles.meta}><Text style={styles.metaLabel}>NIC:</Text> {item.nic}</Text>
                  <Text style={styles.meta}><Text style={styles.metaLabel}>Contact:</Text> {item.contact}</Text>
                  <Text style={styles.meta}><Text style={styles.metaLabel}>Purpose:</Text> {item.purpose}</Text>
                  <Text style={styles.meta}><Text style={styles.metaLabel}>To Meet:</Text> {item.destination}</Text>
                  <Text style={styles.meta}><Text style={styles.metaLabel}>Date:</Text> {new Date(item.date).toLocaleDateString()}</Text>
                  <Text style={styles.meta}><Text style={styles.metaLabel}>Time:</Text> {item.time}</Text>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.checkoutButton, item.status === 'Checked Out' && styles.disabledBtn]}
                    disabled={item.status === 'Checked Out'}
                    onPress={() => handleCheckOut(item.id, item.name, item.status)}
                  >
                    <Text style={styles.checkoutButtonText}>
                      {item.status === 'Checked In' ? 'Mark as Checked Out' : 'Checked Out'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id, item.name)}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  messageBox: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  successBox: { backgroundColor: '#dcfce7' },
  errorBox: { backgroundColor: '#fee2e2' },
  messageText: {
    fontWeight: '500',
    color: '#1f2937',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#6b7280',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 12,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  inBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  outBadge: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  detailGrid: {
    gap: 6,
  },
  meta: {
    fontSize: 14,
    color: '#374151',
  },
  metaLabel: {
    fontWeight: '600',
    color: '#111827',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  checkoutButton: {
    flex: 2,
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#d1d5db',
  },
  checkoutButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontWeight: '700',
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#1e3a8a',
  },
});