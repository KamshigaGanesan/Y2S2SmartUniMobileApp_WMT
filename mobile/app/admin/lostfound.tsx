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
  Image,
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

type ItemStatus = 'Lost' | 'Found' | 'Claimed';
type CategoryType =
  | 'Electronics'
  | 'ID Cards'
  | 'Accessories'
  | 'Books'
  | 'Other';

type LostFoundItem = {
  id: string;
  title: string;
  category: CategoryType;
  status: ItemStatus;
  location: string;
  date: string;
  description: string;
  image?: string;
  contactName?: string;
  contactPhone?: string;
};

export default function AdminLostFoundScreen() {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [searchText, setSearchText] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const { user } = useAuth();

  // State for the new item form
  const [newItem, setNewItem] = useState({
    title: '',
    category: 'Other' as CategoryType,
    status: 'Lost' as ItemStatus,
    location: '',
    description: '',
    image: '',
    contactName: '',
    contactPhone: '',
  });

  // State for the item being edited
  const [editingItem, setEditingItem] = useState<LostFoundItem | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(apiUrl('/api/lostfound'));
      const data = await response.json();

      const mapped: LostFoundItem[] = data.map((item: any) => ({
        id: item._id,
        title: item.title,
        category: item.category,
        status: item.status,
        location: item.location,
        date: item.date,
        description: item.description,
        image: item.image || '',
        contactName: item.contactName || '',
        contactPhone: item.contactPhone || '',
      }));

      setItems(mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
      console.log('Error fetching lostfound items:', error);
      showMessage('Failed to load lost & found items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (q === '') return items;

    return items.filter((item) =>
      Object.values(item).some(
        (val) => typeof val === 'string' && val.toLowerCase().includes(q)
      )
    );
  }, [items, searchText]);

  const handleAddItem = async () => {
    if (!newItem.title.trim() || !newItem.location.trim() || !newItem.description.trim()) {
      showMessage('Please fill in title, location, and description.', 'error');
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/lostfound'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          ...newItem,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) throw new Error('Failed to add item');

      const saved = await response.json();
      const createdItem: LostFoundItem = {
        id: saved._id,
        title: saved.title,
        category: saved.category,
        status: saved.status,
        location: saved.location,
        date: saved.date,
        description: saved.description,
        image: saved.image || '',
        contactName: saved.contactName || '',
        contactPhone: saved.contactPhone || '',
      };

      setItems((prev) => [createdItem, ...prev]);
      showMessage('Item added successfully.', 'success');
      setNewItem({
        title: '', category: 'Other', status: 'Lost', location: '',
        description: '', image: '', contactName: '', contactPhone: '',
      });
    } catch (error) {
      showMessage('Failed to add item.', 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(apiUrl(`/api/lostfound/${itemId}`), {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${user?.token}` },
            });

            if (!response.ok) throw new Error('Failed to delete');

            setItems((prev) => prev.filter((item) => item.id !== itemId));
            showMessage('Item deleted successfully.', 'success');
          } catch (error) {
            showMessage('Failed to delete item.', 'error');
          }
        },
      },
    ]);
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      const response = await fetch(apiUrl(`/api/lostfound/${editingItem.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(editingItem),
      });

      if (!response.ok) throw new Error('Failed to update');

      const updatedItemData = await response.json();
      const updatedItem: LostFoundItem = {
        id: updatedItemData._id,
        title: updatedItemData.title,
        category: updatedItemData.category,
        status: updatedItemData.status,
        location: updatedItemData.location,
        date: updatedItemData.date,
        description: updatedItemData.description,
        image: updatedItemData.image || '',
        contactName: updatedItemData.contactName || '',
        contactPhone: updatedItemData.contactPhone || '',
      };

      setItems((prev) => prev.map((item) => (item.id === editingItem.id ? updatedItem : item)));
      showMessage('Item updated successfully.', 'success');
      setEditingItemId(null);
      setEditingItem(null);
    } catch (error) {
      showMessage('Failed to update item.', 'error');
    }
  };

  const toggleEditMode = (item: LostFoundItem) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (editingItemId === item.id) {
      setEditingItemId(null);
      setEditingItem(null);
    } else {
      setEditingItemId(item.id);
      setEditingItem({ ...item });
    }
  };

  const renderCategoryChips = (
    selected: CategoryType,
    onSelect: (category: CategoryType) => void
  ) => (
    <View style={styles.optionWrap}>
      {['Electronics', 'ID Cards', 'Accessories', 'Books', 'Other'].map((cat) => (
        <TouchableOpacity
          key={cat}
          style={[styles.optionChip, selected === cat && styles.activeOptionChip]}
          onPress={() => onSelect(cat as CategoryType)}
        >
          <Text style={[styles.optionChipText, selected === cat && styles.activeOptionChipText]}>
            {cat}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStatusChips = (
    selected: ItemStatus,
    onSelect: (status: ItemStatus) => void
  ) => (
    <View style={styles.optionRow}>
      {['Lost', 'Found', 'Claimed'].map((stat) => (
        <TouchableOpacity
          key={stat}
          style={[styles.optionChip, selected === stat && styles.activeOptionChip]}
          onPress={() => onSelect(stat as ItemStatus)}
        >
          <Text style={[styles.optionChipText, selected === stat && styles.activeOptionChipText]}>
            {stat}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Admin Lost & Found' }} />
        <LinearGradient colors={['#eef2ff', '#f8fafc']} style={styles.loading}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Loading Items...</Text>
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Admin Lost & Found' }} />
      <LinearGradient colors={['#eef2ff', '#f8fafc']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>🔍 Lost & Found Admin</Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by any field..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />

          {message ? (
            <View style={[styles.messageBox, messageType === 'success' ? styles.successBox : styles.errorBox]}>
              <Text style={styles.messageText}>{message}</Text>
              <TouchableOpacity onPress={() => setMessage('')}>
                <Text style={styles.messageDismiss}>Dismiss</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Add New Item Form */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>➕ Add New Item</Text>
            <TextInput style={styles.input} placeholder="Title" value={newItem.title} onChangeText={(t) => setNewItem({ ...newItem, title: t })} />
            <TextInput style={styles.input} placeholder="Location" value={newItem.location} onChangeText={(t) => setNewItem({ ...newItem, location: t })} />
            <TextInput style={styles.input} placeholder="Description" value={newItem.description} onChangeText={(t) => setNewItem({ ...newItem, description: t })} multiline />
            <TextInput style={styles.input} placeholder="Image URL (optional)" value={newItem.image} onChangeText={(t) => setNewItem({ ...newItem, image: t })} />
            <TextInput style={styles.input} placeholder="Contact Name (optional)" value={newItem.contactName} onChangeText={(t) => setNewItem({ ...newItem, contactName: t })} />
            <TextInput style={styles.input} placeholder="Contact Phone (optional)" value={newItem.contactPhone} onChangeText={(t) => setNewItem({ ...newItem, contactPhone: t })} keyboardType="phone-pad" />
            
            <Text style={styles.subTitle}>Category</Text>
            {renderCategoryChips(newItem.category, (cat) => setNewItem({ ...newItem, category: cat }))}

            <Text style={styles.subTitle}>Status</Text>
            {renderStatusChips(newItem.status, (stat) => setNewItem({ ...newItem, status: stat }))}

            <TouchableOpacity style={styles.primaryButton} onPress={handleAddItem}>
              <Text style={styles.buttonText}>Add Item</Text>
            </TouchableOpacity>
          </View>

          {/* Items List */}
          <Text style={styles.title}>📦 Reported Items</Text>
          {filteredItems.map((item) => (
            <View key={item.id} style={styles.card}>
              {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : null}
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={[styles.statusBadge, styles[`${item.status.toLowerCase()}Badge`]]}>
                    {item.status}
                  </Text>
                </View>
                <Text style={styles.cardMeta}>{item.category} • {item.location}</Text>
                <Text style={styles.cardMeta}>Reported on: {new Date(item.date).toLocaleDateString()}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
                {item.contactName && <Text style={styles.cardMeta}>Contact: {item.contactName} ({item.contactPhone})</Text>}

                {editingItemId === item.id && editingItem && (
                  <View style={styles.editForm}>
                    <TextInput style={styles.input} placeholder="Title" value={editingItem.title} onChangeText={(t) => setEditingItem({ ...editingItem, title: t })} />
                    <TextInput style={styles.input} placeholder="Location" value={editingItem.location} onChangeText={(t) => setEditingItem({ ...editingItem, location: t })} />
                    <TextInput style={styles.input} placeholder="Description" value={editingItem.description} onChangeText={(t) => setEditingItem({ ...editingItem, description: t })} multiline />
                    <TextInput style={styles.input} placeholder="Image URL" value={editingItem.image} onChangeText={(t) => setEditingItem({ ...editingItem, image: t })} />
                    <TextInput style={styles.input} placeholder="Contact Name" value={editingItem.contactName} onChangeText={(t) => setEditingItem({ ...editingItem, contactName: t })} />
                    <TextInput style={styles.input} placeholder="Contact Phone" value={editingItem.contactPhone} onChangeText={(t) => setEditingItem({ ...editingItem, contactPhone: t })} keyboardType="phone-pad" />

                    <Text style={styles.subTitle}>Category</Text>
                    {renderCategoryChips(editingItem.category, (cat) => setEditingItem({ ...editingItem, category: cat }))}

                    <Text style={styles.subTitle}>Status</Text>
                    {renderStatusChips(editingItem.status, (stat) => setEditingItem({ ...editingItem, status: stat }))}

                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.primaryButton} onPress={handleUpdateItem}>
                        <Text style={styles.buttonText}>Save Changes</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.secondaryButton} onPress={() => toggleEditMode(item)}>
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.editButton} onPress={() => toggleEditMode(item)}>
                    <Text style={styles.editButtonText}>{editingItemId === item.id ? 'Close' : 'Edit'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteItem(item.id)}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
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
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12, marginTop: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 14 },
  subTitle: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 10, marginTop: 8 },
  
  searchInput: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },

  messageBox: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successBox: { backgroundColor: '#dcfce7' },
  errorBox: { backgroundColor: '#fee2e2' },
  messageText: { flex: 1, fontWeight: '500' },
  messageDismiss: { color: '#4b5563', fontWeight: '700' },

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

  optionRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
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

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardContent: { padding: 14 },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#111827' },
  cardMeta: { fontSize: 13, color: '#4b5563', marginBottom: 4 },
  cardDescription: { fontSize: 14, color: '#374151', marginVertical: 8 },
  image: { width: '100%', height: 160 },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  lostBadge: { backgroundColor: '#ef4444' },
  foundBadge: { backgroundColor: '#22c55e' },
  claimedBadge: { backgroundColor: '#6b7280' },

  buttonRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#eef2ff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  secondaryButtonText: { color: '#1e3a8a', fontSize: 16, fontWeight: '700' },
  editButton: {
    flex: 1,
    backgroundColor: '#e0e7ff',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: { color: '#3730a3', fontWeight: '700' },
  deleteButton: {
    flex: 1,
    backgroundColor: '#fee2e2',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#b91c1c', fontWeight: '700' },

  editForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#1e3a8a' },
});