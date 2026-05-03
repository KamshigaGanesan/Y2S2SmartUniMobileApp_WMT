import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { apiUrl } from '@/constants/api';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

type ItemStatus = 'Lost' | 'Found' | 'Claimed';
type CategoryType =
  | 'All'
  | 'Electronics'
  | 'ID Cards'
  | 'Accessories'
  | 'Books'
  | 'Other';

type LostFoundItem = {
  id: string;
  title: string;
  category: Exclude<CategoryType, 'All'>;
  status: ItemStatus;
  location: string;
  date: string;
  description: string;
  image?: string;
  contactName?: string;
  contactPhone?: string;
};

export default function LostFoundScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [formMessage, setFormMessage] = useState('');
  const [formMessageType, setFormMessageType] = useState<'success' | 'error' | 'info'>('info');

  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] =
    useState<Exclude<CategoryType, 'All'>>('Other');
  const [itemStatus, setItemStatus] = useState<ItemStatus>('Lost');
  const [itemLocation, setItemLocation] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemImage, setItemImage] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [itemMessageId, setItemMessageId] = useState<string | null>(null);
  const [itemMessage, setItemMessage] = useState('');
  const [itemMessageType, setItemMessageType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    fetchItems();
  }, []);

  const showFormMessage = (
    text: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setFormMessage(text);
    setFormMessageType(type);
  };

  const showItemMessage = (
    itemId: string,
    text: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    setItemMessageId(itemId);
    setItemMessage(text);
    setItemMessageType(type);
  };

  const fetchItems = async () => {
    try {
      const response = await fetch(apiUrl('/lostfound'));
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

      setItems(mapped);
    } catch (error) {
      console.log('Error fetching lostfound items:', error);
      showFormMessage('Failed to load lost & found items.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [items, searchText, selectedCategory]);

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      showFormMessage('Permission to access photos is required.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setItemImage(result.assets[0].uri);
      showFormMessage('Image added successfully.', 'success');
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    if (!itemName.trim() || !itemLocation.trim() || !itemDescription.trim()) {
      showFormMessage('Please fill in item name, location, and description.', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(apiUrl('/lostfound'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: itemName.trim(),
          category: itemCategory,
          status: itemStatus,
          location: itemLocation.trim(),
          date: new Date().toISOString().split('T')[0],
          description: itemDescription.trim(),
          image: itemImage || '',
          contactName: contactName.trim(),
          contactPhone: contactPhone.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit item');
      }

      const savedItem = await response.json();

      const mappedItem: LostFoundItem = {
        id: savedItem._id,
        title: savedItem.title,
        category: savedItem.category,
        status: savedItem.status,
        location: savedItem.location,
        date: savedItem.date,
        description: savedItem.description,
        image: savedItem.image || '',
        contactName: savedItem.contactName || '',
        contactPhone: savedItem.contactPhone || '',
      };

      setItems((prev) => [mappedItem, ...prev]);
      showFormMessage(`${itemStatus} item submitted successfully.`, 'success');

      setItemName('');
      setItemCategory('Other');
      setItemStatus('Lost');
      setItemLocation('');
      setItemDescription('');
      setItemImage('');
      setContactName('');
      setContactPhone('');
    } catch (error) {
      console.log('Submit error:', error);
      showFormMessage('Failed to submit item.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    if (submitting) return;

    setItemName('');
    setItemCategory('Other');
    setItemStatus('Lost');
    setItemLocation('');
    setItemDescription('');
    setItemImage('');
    setContactName('');
    setContactPhone('');
    setFormMessage('');
  };

  const handleCopyNumber = async (phone: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(phone);
        Alert.alert('Copied', `Phone number copied: ${phone}`);
      } else {
        Alert.alert('Phone Number', phone);
      }
    } catch {
      Alert.alert('Phone Number', phone);
    }
  };

  const openCall = async (phone: string) => {
    try {
      const url = `tel:${phone}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Call Not Supported',
          `Calling is not supported on this device/browser.\n\nPhone: ${phone}`,
          [
            { text: 'Copy Number', onPress: () => handleCopyNumber(phone) },
            { text: 'OK' },
          ]
        );
      }
    } catch {
      Alert.alert(
        'Error',
        `Unable to open call option.\n\nPhone: ${phone}`,
        [
          { text: 'Copy Number', onPress: () => handleCopyNumber(phone) },
          { text: 'OK' },
        ]
      );
    }
  };

  const openWhatsApp = async (item: LostFoundItem) => {
    try {
      const phone = (item.contactPhone || '').replace(/\D/g, '');
      if (!phone) {
        Alert.alert('No Contact Available', 'This item does not have a valid phone number.');
        return;
      }

      const text = encodeURIComponent(
        `Hello, I am contacting about the item "${item.title}" from Smart Campus Lost & Found.`
      );

      const url = `https://wa.me/${phone}?text=${text}`;
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'WhatsApp Not Supported',
          `Unable to open WhatsApp.\n\nPhone: ${item.contactPhone}`,
          [
            { text: 'Copy Number', onPress: () => handleCopyNumber(item.contactPhone || '') },
            { text: 'OK' },
          ]
        );
      }
    } catch {
      Alert.alert(
        'Error',
        `Unable to open WhatsApp link.\n\nPhone: ${item.contactPhone}`,
        [
          { text: 'Copy Number', onPress: () => handleCopyNumber(item.contactPhone || '') },
          { text: 'OK' },
        ]
      );
    }
  };

  const openSMS = async (item: LostFoundItem) => {
    try {
      if (!item.contactPhone) {
        Alert.alert('No Contact Available', 'This item does not have a valid phone number.');
        return;
      }

      const body = encodeURIComponent(
        `Hello, I am contacting about the item "${item.title}".`
      );

      const url =
        Platform.OS === 'ios'
          ? `sms:${item.contactPhone}&body=${body}`
          : `sms:${item.contactPhone}?body=${body}`;

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'SMS Not Supported',
          `SMS is not supported on this device/browser.\n\nPhone: ${item.contactPhone}`,
          [
            { text: 'Copy Number', onPress: () => handleCopyNumber(item.contactPhone || '') },
            { text: 'OK' },
          ]
        );
      }
    } catch {
      Alert.alert(
        'Error',
        `Unable to open SMS option.\n\nPhone: ${item.contactPhone}`,
        [
          { text: 'Copy Number', onPress: () => handleCopyNumber(item.contactPhone || '') },
          { text: 'OK' },
        ]
      );
    }
  };

  const handleContactOwner = (item: LostFoundItem) => {
    if (item.status === 'Claimed') {
      showItemMessage(item.id, 'This item is already claimed.', 'error');
      return;
    }

    if (!item.contactPhone) {
      Alert.alert(
        'No Contact Available',
        'This item does not have a phone number yet. Please contact the Lost & Found office.'
      );
      return;
    }

    setActiveContactId((prev) => (prev === item.id ? null : item.id));
    showItemMessage(
      item.id,
      `Choose how you want to contact ${item.contactName || 'the owner'}.`,
      'info'
    );
  };

  const handleRequestClaim = (item: LostFoundItem) => {
    if (item.status === 'Claimed') {
      showItemMessage(item.id, 'This item is already claimed.', 'error');
      return;
    }

    if (item.contactPhone) {
      showItemMessage(
        item.id,
        'Use the contact actions below to request this item directly.',
        'info'
      );
      setActiveContactId(item.id);
    } else {
      showItemMessage(
        item.id,
        'Please contact the Lost & Found office to request this item.',
        'info'
      );
    }
  };

  const getFormMessageBoxStyle = () => {
    if (formMessageType === 'success') return styles.successMessageBox;
    if (formMessageType === 'error') return styles.errorMessageBox;
    return styles.infoMessageBox;
  };

  const getItemMessageBoxStyle = () => {
    if (itemMessageType === 'success') return styles.successMessageBox;
    if (itemMessageType === 'error') return styles.errorMessageBox;
    return styles.infoMessageBox;
  };

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: 'Lost & Found' }} />
        <LinearGradient
          colors={['#eef2ff', '#f8fafc', '#e0e7ff']}
          style={styles.loadingContainer}
        >
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Loading lost & found items...</Text>
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Lost & Found' }} />

      <LinearGradient colors={['#eef2ff', '#f8fafc', '#e0e7ff']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={['#2563eb', '#1e3a8a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <Text style={styles.heroTitle}>🔎 Lost & Found</Text>
            <Text style={styles.heroSubtitle}>
              Report lost items, view found items, and help connect belongings with their owners.
            </Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Search items, location, or category..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
            />
          </LinearGradient>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {[
              'All',
              'Electronics',
              'ID Cards',
              'Accessories',
              'Books',
              'Other',
            ].map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.filterChip,
                  selectedCategory === category && styles.activeFilterChip,
                ]}
                onPress={() => setSelectedCategory(category as CategoryType)}
                activeOpacity={0.88}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === category && styles.activeFilterChipText,
                  ]}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>📝 Report an Item</Text>

            <TextInput
              style={styles.input}
              placeholder="Item name"
              placeholderTextColor="#9ca3af"
              value={itemName}
              onChangeText={setItemName}
              editable={!submitting}
            />

            <TextInput
              style={styles.input}
              placeholder="Location"
              placeholderTextColor="#9ca3af"
              value={itemLocation}
              onChangeText={setItemLocation}
              editable={!submitting}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              placeholderTextColor="#9ca3af"
              value={itemDescription}
              onChangeText={setItemDescription}
              multiline
              editable={!submitting}
            />

            <Text style={styles.subTitle}>Item Status</Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.optionChip,
                  itemStatus === 'Lost' && styles.activeOptionChip,
                ]}
                onPress={() => setItemStatus('Lost')}
                activeOpacity={0.88}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    itemStatus === 'Lost' && styles.activeOptionChipText,
                  ]}
                >
                  Lost
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionChip,
                  itemStatus === 'Found' && styles.activeOptionChip,
                ]}
                onPress={() => setItemStatus('Found')}
                activeOpacity={0.88}
              >
                <Text
                  style={[
                    styles.optionChipText,
                    itemStatus === 'Found' && styles.activeOptionChipText,
                  ]}
                >
                  Found
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.subTitle}>Category</Text>
            <View style={styles.optionWrap}>
              {['Electronics', 'ID Cards', 'Accessories', 'Books', 'Other'].map(
                (category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.optionChip,
                      itemCategory === category && styles.activeOptionChip,
                    ]}
                    onPress={() =>
                      setItemCategory(category as Exclude<CategoryType, 'All'>)
                    }
                    activeOpacity={0.88}
                  >
                    <Text
                      style={[
                        styles.optionChipText,
                        itemCategory === category && styles.activeOptionChipText,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={styles.subTitle}>Optional Image</Text>
            <Text style={styles.optionalText}>
              Add the exact item photo or a similar reference image to help identify it.
            </Text>

            <TouchableOpacity
              style={styles.imageButton}
              activeOpacity={0.88}
              onPress={pickImage}
            >
              <Text style={styles.imageButtonText}>
                {itemImage ? 'Change Image' : 'Add Image (Optional)'}
              </Text>
            </TouchableOpacity>

            {itemImage ? (
              <Image source={{ uri: itemImage }} style={styles.previewImage} />
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Contact person name (optional)"
              placeholderTextColor="#9ca3af"
              value={contactName}
              onChangeText={setContactName}
              editable={!submitting}
            />

            <TextInput
              style={styles.input}
              placeholder="Contact phone / WhatsApp number"
              placeholderTextColor="#9ca3af"
              value={contactPhone}
              onChangeText={setContactPhone}
              keyboardType="phone-pad"
              editable={!submitting}
            />

            {formMessage ? (
              <View style={[styles.inlineMessageBox, getFormMessageBoxStyle()]}>
                <Text style={styles.inlineMessageText}>{formMessage}</Text>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => setFormMessage('')}
                  activeOpacity={0.88}
                >
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.88}
                onPress={handleResetForm}
              >
                <Text style={styles.secondaryButtonText}>Reset</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  submitting && styles.disabledButton,
                ]}
                activeOpacity={submitting ? 1 : 0.88}
                onPress={handleSubmit}
              >
                <Text style={styles.primaryButtonText}>
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.listCard}>
            <Text style={styles.sectionTitle}>📦 Reported Items</Text>

            {filteredItems.length === 0 ? (
              <Text style={styles.emptyText}>No matching items found.</Text>
            ) : (
              filteredItems.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text
                      style={[
                        styles.statusBadge,
                        item.status === 'Lost'
                          ? styles.lostBadge
                          : item.status === 'Found'
                          ? styles.foundBadge
                          : styles.claimedBadge,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>

                  {item.image ? (
                    <View style={styles.itemImageWrap}>
                      <Image source={{ uri: item.image }} style={styles.itemImage} />
                      <View style={styles.itemImageOverlay} />
                    </View>
                  ) : null}

                  <Text style={styles.itemMeta}>Category: {item.category}</Text>
                  <Text style={styles.itemMeta}>Location: {item.location}</Text>
                  <Text style={styles.itemMeta}>Date: {item.date}</Text>
                  {item.contactName ? (
                    <Text style={styles.itemMeta}>Contact: {item.contactName}</Text>
                  ) : null}
                  {item.contactPhone ? (
                    <Text style={styles.itemMeta}>Phone: {item.contactPhone}</Text>
                  ) : null}
                  <Text style={styles.itemDescription}>{item.description}</Text>

                  {itemMessageId === item.id && itemMessage ? (
                    <View style={[styles.itemInlineMessageBox, getItemMessageBoxStyle()]}>
                      <Text style={styles.inlineMessageText}>{itemMessage}</Text>
                      <TouchableOpacity
                        style={styles.dismissButton}
                        onPress={() => {
                          setItemMessage('');
                          setItemMessageId(null);
                        }}
                        activeOpacity={0.88}
                      >
                        <Text style={styles.dismissButtonText}>Dismiss</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {activeContactId === item.id && item.contactPhone ? (
                    <View style={styles.contactPanel}>
                      <Text style={styles.contactPanelTitle}>
                        Contact options for {item.contactName || 'owner'}
                      </Text>

                      <View style={styles.contactGrid}>
                        <TouchableOpacity
                          style={styles.contactActionButton}
                          activeOpacity={0.88}
                          onPress={() => openCall(item.contactPhone || '')}
                        >
                          <Text style={styles.contactActionText}>📞 Call</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.contactActionButton}
                          activeOpacity={0.88}
                          onPress={() => openWhatsApp(item)}
                        >
                          <Text style={styles.contactActionText}>🟢 WhatsApp</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.contactActionButton}
                          activeOpacity={0.88}
                          onPress={() => openSMS(item)}
                        >
                          <Text style={styles.contactActionText}>📩 SMS</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.contactActionButton}
                          activeOpacity={0.88}
                          onPress={() => handleCopyNumber(item.contactPhone || '')}
                        >
                          <Text style={styles.contactActionText}>📋 Copy</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[
                        styles.primaryButton,
                        item.status === 'Claimed' && styles.disabledButton,
                      ]}
                      activeOpacity={item.status === 'Claimed' ? 1 : 0.88}
                      onPress={() => handleContactOwner(item)}
                    >
                      <Text style={styles.primaryButtonText}>Contact Owner</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.secondaryButton,
                        styles.claimButton,
                        item.status === 'Claimed' && styles.disabledButton,
                      ]}
                      activeOpacity={item.status === 'Claimed' ? 1 : 0.88}
                      onPress={() => handleRequestClaim(item)}
                    >
                      <Text style={styles.secondaryButtonText}>Request Claim</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  container: {
    padding: 14,
    paddingBottom: 34,
  },

  heroSection: {
    backgroundColor: '#1e3a8a',
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
  },

  filterRow: {
    paddingBottom: 14,
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  activeFilterChip: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.16,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  filterChipText: {
    color: '#1e3a8a',
    fontWeight: '700',
    fontSize: 14,
  },
  activeFilterChipText: {
    color: '#ffffff',
  },

  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 14,
    letterSpacing: -0.4,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
    marginTop: 4,
  },
  optionalText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 10,
  },

  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  optionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  optionChip: {
    backgroundColor: '#eef2ff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  activeOptionChip: {
    backgroundColor: '#1e3a8a',
  },
  optionChipText: {
    color: '#1e3a8a',
    fontWeight: '700',
    fontSize: 14,
  },
  activeOptionChipText: {
    color: '#ffffff',
  },

  imageButton: {
    backgroundColor: '#e0e7ff',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  imageButtonText: {
    color: '#1e3a8a',
    fontSize: 15,
    fontWeight: '700',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: '#e5e7eb',
  },

  inlineMessageBox: {
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
  },
  itemInlineMessageBox: {
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  successMessageBox: {
    backgroundColor: '#ecfdf5',
    borderColor: '#bbf7d0',
  },
  errorMessageBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  infoMessageBox: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd',
  },
  inlineMessageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },

  primaryButton: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButton: {
    backgroundColor: '#eef2ff',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },

  contactPanel: {
    backgroundColor: '#eef2ff',
    borderRadius: 18,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  contactPanelTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contactActionButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactActionText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    fontStyle: 'italic',
  },

  itemCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef2ff',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  itemTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  lostBadge: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  foundBadge: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  claimedBadge: {
    backgroundColor: '#e5e7eb',
    color: '#374151',
  },

  itemImageWrap: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  itemImageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  itemMeta: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginTop: 6,
  },

  disabledButton: {
    opacity: 0.5,
  },

  dismissButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  dismissButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
    color: '#111827',
    fontWeight: '600',
  },
});