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
} from 'react-native';
import { apiUrl } from '@/constants/api';
import { Stack } from 'expo-router';
import { io } from 'socket.io-client';

type FoodCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Beverages' | 'Snacks';
type FoodAvailability = 'Available' | 'Unavailable';

type FoodItem = {
  id: string;
  name: string;
  category: FoodCategory;
  price: number;
  description: string;
  image?: string;
  availability: FoodAvailability;
  canteenId: 'Main' | 'Eagle';
};

export default function AdminCanteenScreen() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [searchText, setSearchText] = useState('');
  
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Lunch');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [availability, setAvailability] = useState<FoodAvailability>('Available');
  const [targetCanteen, setTargetCanteen] = useState<'Main' | 'Eagle'>('Main');
 
  const socket = io('https://northern-uni-smartcampus-network-system-production.up.railway.app');
  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async () => {
    try {
      const response = await fetch(apiUrl('/food'));
      const data = await response.json();

      const mapped: FoodItem[] = data.map((item: any) => ({
        id: item._id,
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description,
        image: item.image || '',
        availability: item.availability,
        canteenId: item.canteenId || 'Main',
      }));

      setItems(mapped);
    } catch (error) {
      console.log('Error fetching food items:', error);
      setMessage('⚠️ Failed to load canteen items.');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return items.filter((item) => {
      return (
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.availability.toLowerCase().includes(q)
      );
    });
  }, [items, searchText]);

  const handleAddFoodItem = async () => {
    if (submitting) return;

    if (!name.trim() || !price.trim() || !description.trim()) {
      setMessage('⚠️ Please fill in item name, price, and description.');
      return;
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice <= 0) {
      setMessage('⚠️ Please enter a valid price.');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(apiUrl('/food'), {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          category,
          price: numericPrice,
          description: description.trim(),
          image: image.trim(),
          availability,
          canteenId: targetCanteen,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create food item');
      }

      const savedItem = await response.json();

      const newItem: FoodItem = {
        id: savedItem._id,
        name: savedItem.name,
        category: savedItem.category,
        price: savedItem.price,
        description: savedItem.description,
        image: savedItem.image || '',
        availability: savedItem.availability,
        canteenId: savedItem.canteenId || 'Main',
      };

      setItems((prev) => [newItem, ...prev]);
      setMessage('✅ Food item added successfully.');

      setName('');
      setCategory('Lunch');
      setPrice('');
      setDescription('');
      setImage('');
      setAvailability('Available');
    } catch (error) {
      console.log('Add food item error:', error);
      setMessage('❌ Failed to add food item.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Admin Canteen' }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#111827" />
          <Text style={styles.loadingText}>Loading canteen items...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Admin Canteen' }} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>🍔 Admin Canteen</Text>
          <Text style={styles.heroSubtitle}>
            Add and review food items, manage availability, and keep the campus menu updated.
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search canteen items..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message}</Text>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={() => setMessage('')}
            >
              <Text style={styles.dismissButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>➕ Add New Food Item</Text>

          <TextInput
            style={styles.input}
            placeholder="Food item name"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
            editable={!submitting}
          />

          <TextInput
            style={styles.input}
            placeholder="Price (LKR)"
            placeholderTextColor="#9ca3af"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            editable={!submitting}
          />

          <Text style={styles.subTitle}>Category</Text>
          <View style={styles.optionWrap}>
            {['Breakfast', 'Lunch', 'Dinner', 'Beverages', 'Snacks'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionChip,
                  category === item && styles.activeOptionChip,
                ]}
                onPress={() => !submitting && setCategory(item as FoodCategory)}
                activeOpacity={submitting ? 1 : 0.8}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    category === item && styles.activeOptionChipText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.subTitle}>Availability</Text>
          <View style={styles.optionWrap}>
            {['Available', 'Unavailable'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionChip,
                  availability === item && styles.activeOptionChip,
                ]}
                onPress={() =>
                  !submitting && setAvailability(item as FoodAvailability)
                }
                activeOpacity={submitting ? 1 : 0.8}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    availability === item && styles.activeOptionChipText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <Text style={styles.subTitle}>Target Canteen</Text>
          <View style={styles.optionWrap}>
            {['Main', 'Eagle'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.optionChip,
                  targetCanteen === item && styles.activeOptionChip,
                ]}
                onPress={() => !submitting && setTargetCanteen(item as 'Main'|'Eagle')}
                activeOpacity={submitting ? 1 : 0.8}
              >
                <Text style={[styles.optionChipText, targetCanteen === item && styles.activeOptionChipText]}>
                  {item} Canteen
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Image URL (optional)"
            placeholderTextColor="#9ca3af"
            value={image}
            onChangeText={setImage}
            editable={!submitting}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Food item description"
            placeholderTextColor="#9ca3af"
            value={description}
            onChangeText={setDescription}
            multiline
            editable={!submitting}
          />

          <TouchableOpacity
            style={[
              styles.primaryButton,
              submitting && styles.disabledPrimaryButton,
            ]}
            activeOpacity={submitting ? 1 : 0.85}
            onPress={handleAddFoodItem}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? 'Adding...' : 'Add Food Item'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>🍽 Existing Food Items</Text>

          {filteredItems.length === 0 ? (
            <Text style={styles.emptyText}>No food items found.</Text>
          ) : (
            filteredItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.topRow}>
                  <Text style={styles.itemTitle}>{item.name}</Text>
                  <Text
                    style={[
                      styles.statusBadge,
                      item.availability === 'Available'
                        ? styles.availableBadge
                        : styles.unavailableBadge,
                    ]}
                  >
                    {item.availability}
                  </Text>
                </View>

                <View style={styles.canteenTag}><Text style={styles.canteenTagText}>{item.canteenId} Canteen</Text></View>

                <Text style={styles.metaText}>Category: {item.category}</Text>
                <Text style={styles.metaText}>Price: LKR {item.price}</Text>
                {item.image ? (
                  <Text style={styles.metaText} numberOfLines={1}>
                    Image: {item.image}
                  </Text>
                ) : (
                  <Text style={styles.metaText}>Image: Not provided</Text>
                )}
                <Text style={styles.descriptionText}>{item.description}</Text>
              </View>
            ))
          )}
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
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  messageBox: {
    backgroundColor: '#e0f2fe',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  messageText: {
    color: '#075985',
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dismissButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  formCard: {
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
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
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
    marginBottom: 14,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  optionChip: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  activeOptionChip: {
    backgroundColor: '#111827',
  },
  optionChipText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14,
  },
  activeOptionChipText: {
    color: '#ffffff',
  },
  primaryButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  disabledPrimaryButton: {
    backgroundColor: '#9ca3af',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  itemCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 24,
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  availableBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  unavailableBadge: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  canteenTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8
  },
  canteenTagText: {
    color: '#3730a3',
    fontSize: 11,
    fontWeight: '800'
  },
  metaText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
    marginTop: 6,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f4f7fb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#111827',
  },
});