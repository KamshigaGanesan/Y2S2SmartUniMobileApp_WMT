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

type AnnouncementCategory =
  | 'Academic'
  | 'Events'
  | 'Exams'
  | 'Library'
  | 'Canteen'
  | 'Administration';

type AnnouncementPriority = 'High' | 'Medium' | 'Normal';

type Announcement = {
  id: string;
  title: string;
  category: AnnouncementCategory;
  date: string;
  priority: AnnouncementPriority;
  description: string;
};

export default function AdminAnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const { user } = useAuth();

  const [formState, setFormState] = useState({
    title: '',
    category: 'Academic' as AnnouncementCategory,
    priority: 'Normal' as AnnouncementPriority,
    description: '',
  });

  const [editState, setEditState] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(apiUrl('/announcements'));
      const data = await response.json();
      const mapped: Announcement[] = data.map((item: any) => ({
        id: item._id,
        title: item.title,
        category: item.category,
        date: item.date,
        priority: item.priority,
        description: item.description,
      }));
      setAnnouncements(mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      showMessage('Failed to load announcements.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (q === '') return announcements;
    return announcements.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.priority.toLowerCase().includes(q)
    );
  }, [announcements, searchText]);

  const handleAddAnnouncement = async () => {
    if (!formState.title.trim() || !formState.description.trim()) {
      showMessage('Please fill in title and description.', 'error');
      return;
    }

    try {
      const response = await fetch(apiUrl('/announcements'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          ...formState,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) throw new Error('Failed to create announcement');

      const saved = await response.json();
      const newAnnouncement: Announcement = {
        id: saved._id,
        title: saved.title,
        category: saved.category,
        date: saved.date,
        priority: saved.priority,
        description: saved.description,
      };

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
      showMessage('Announcement published successfully.', 'success');
      setFormState({ title: '', category: 'Academic', priority: 'Normal', description: '' });
    } catch (error) {
      showMessage('Failed to publish announcement.', 'error');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this announcement?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(apiUrl(`/announcements/${id}`), {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!response.ok) throw new Error('Failed to delete');
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setAnnouncements((prev) => prev.filter((item) => item.id !== id));
            showMessage('Announcement deleted.', 'success');
          } catch (error) {
            showMessage('Failed to delete announcement.', 'error');
          }
        },
      },
    ]);
  };

  const handleUpdate = async () => {
    if (!editState) return;
    try {
      const response = await fetch(apiUrl(`/announcements/${editState.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(editState),
      });
      if (!response.ok) throw new Error('Failed to update');
      const updatedData = await response.json();
      const updatedAnnouncement: Announcement = {
        id: updatedData._id,
        title: updatedData.title,
        category: updatedData.category,
        date: updatedData.date,
        priority: updatedData.priority,
        description: updatedData.description,
      };
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAnnouncements((prev) => prev.map((item) => (item.id === editState.id ? updatedAnnouncement : item)));
      showMessage('Announcement updated successfully.', 'success');
      setEditingId(null);
      setEditState(null);
    } catch (error) {
      showMessage('Failed to update announcement.', 'error');
    }
  };

  const toggleEditMode = (item: Announcement) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (editingId === item.id) {
      setEditingId(null);
      setEditState(null);
    } else {
      setEditingId(item.id);
      setEditState({ ...item });
    }
  };

  const getPriorityStyle = (value: AnnouncementPriority) => {
    if (value === 'High') return styles.priorityHigh;
    if (value === 'Medium') return styles.priorityMedium;
    return styles.priorityNormal;
  };

  const renderCategoryChips = (selected: AnnouncementCategory, onSelect: (cat: AnnouncementCategory) => void) => (
    <View style={styles.optionWrap}>
      {['Academic', 'Events', 'Exams', 'Library', 'Canteen', 'Administration'].map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.optionChip, selected === item && styles.activeOptionChip]}
          onPress={() => onSelect(item as AnnouncementCategory)}
        >
          <Text style={[styles.optionChipText, selected === item && styles.activeOptionChipText]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPriorityChips = (selected: AnnouncementPriority, onSelect: (pri: AnnouncementPriority) => void) => (
    <View style={styles.optionWrap}>
      {['High', 'Medium', 'Normal'].map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.optionChip, selected === item && styles.activeOptionChip]}
          onPress={() => onSelect(item as AnnouncementPriority)}
        >
          <Text style={[styles.optionChipText, selected === item && styles.activeOptionChipText]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Admin Announcements' }} />
        <LinearGradient colors={['#eef2ff', '#f8fafc']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Loading Announcements...</Text>
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Admin Announcements' }} />
      <LinearGradient colors={['#eef2ff', '#f8fafc']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>📢 Admin Announcements</Text>
          <Text style={styles.subtitle}>
            Create, edit, and manage all official campus notices and updates.
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search announcements..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />

          {message ? (
            <View style={[styles.messageBox, messageType === 'success' ? styles.successBox : styles.errorBox]}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          ) : null}

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>➕ Add New Announcement</Text>
            <TextInput style={styles.input} placeholder="Title" value={formState.title} onChangeText={(t) => setFormState({ ...formState, title: t })} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Description" value={formState.description} onChangeText={(t) => setFormState({ ...formState, description: t })} multiline />
            <Text style={styles.subTitle}>Category</Text>
            {renderCategoryChips(formState.category, (cat) => setFormState({ ...formState, category: cat }))}
            <Text style={styles.subTitle}>Priority</Text>
            {renderPriorityChips(formState.priority, (pri) => setFormState({ ...formState, priority: pri }))}
            <TouchableOpacity style={styles.primaryButton} onPress={handleAddAnnouncement}>
              <Text style={styles.primaryButtonText}>Publish Announcement</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>📰 Published Announcements</Text>
          {filteredAnnouncements.map((item) => (
            <View key={item.id} style={styles.announcementCard}>
              <View style={styles.topRow}>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Text style={[styles.priorityBadge, getPriorityStyle(item.priority)]}>{item.priority}</Text>
              </View>
              <Text style={styles.metaText}>{item.category} • Published on {new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.descriptionText}>{item.description}</Text>

              {editingId === item.id && editState && (
                <View style={styles.editForm}>
                  <TextInput style={styles.input} value={editState.title} onChangeText={(t) => setEditState({ ...editState, title: t })} />
                  <TextInput style={[styles.input, styles.textArea]} value={editState.description} onChangeText={(t) => setEditState({ ...editState, description: t })} multiline />
                  <Text style={styles.subTitle}>Category</Text>
                  {renderCategoryChips(editState.category, (cat) => setEditState({ ...editState, category: cat }))}
                  <Text style={styles.subTitle}>Priority</Text>
                  {renderPriorityChips(editState.priority, (pri) => setEditState({ ...editState, priority: pri }))}
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.primaryButton} onPress={handleUpdate}>
                      <Text style={styles.primaryButtonText}>Save Changes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={() => toggleEditMode(item)}>
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.editButton} onPress={() => toggleEditMode(item)}>
                  <Text style={styles.editButtonText}>{editingId === item.id ? 'Close' : 'Edit'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4, marginTop: 16 },
  subtitle: { fontSize: 15, color: '#4b5563', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 14 },
  subTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 10, marginTop: 8 },
  
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

  messageBox: { padding: 14, borderRadius: 12, marginBottom: 16 },
  successBox: { backgroundColor: '#dcfce7' },
  errorBox: { backgroundColor: '#fee2e2' },
  messageText: { fontWeight: '500', color: '#1f2937' },

  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  optionChip: {
    backgroundColor: '#eef2ff',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 99,
  },
  activeOptionChip: { backgroundColor: '#1e3a8a' },
  optionChipText: { color: '#1e3a8a', fontWeight: '600' },
  activeOptionChipText: { color: '#fff' },

  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  announcementTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#111827' },
  metaText: { fontSize: 13, color: '#4b5563', marginBottom: 8 },
  descriptionText: { fontSize: 14, color: '#374151', lineHeight: 20 },
  
  priorityBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    overflow: 'hidden',
  },
  priorityHigh: { backgroundColor: '#fee2e2', color: '#b91c1c' },
  priorityMedium: { backgroundColor: '#fef3c7', color: '#92400e' },
  priorityNormal: { backgroundColor: '#eef2ff', color: '#3730a3' },

  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  primaryButton: { flex: 1, backgroundColor: '#1e3a8a', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: { flex: 1, backgroundColor: '#eef2ff', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#c7d2fe' },
  secondaryButtonText: { color: '#1e3a8a', fontSize: 16, fontWeight: '700' },
  editButton: { flex: 1, backgroundColor: '#e0e7ff', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  editButtonText: { color: '#3730a3', fontWeight: '700' },
  deleteButton: { flex: 1, backgroundColor: '#fee2e2', paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  deleteButtonText: { color: '#b91c1c', fontWeight: '700' },

  editForm: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#e5e7eb' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#1e3a8a' },
});