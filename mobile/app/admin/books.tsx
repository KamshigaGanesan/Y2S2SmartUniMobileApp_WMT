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
  Image,
} from 'react-native';
import { apiUrl } from '@/constants/api';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FacultyType = 'Computing' | 'Business' | 'Engineering' | 'Humanities & Sciences';
type AvailabilityType = 'Available' | 'Borrowed';

type Book = {
  id: string;
  title: string;
  author: string;
  faculty: FacultyType;
  category: string;
  description: string;
  image?: string;
  availability: AvailabilityType;
};

export default function AdminBooksScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const { user } = useAuth();

  const [formState, setFormState] = useState({
    title: '',
    author: '',
    faculty: 'Computing' as FacultyType,
    category: '',
    description: '',
    image: '',
    availability: 'Available' as AvailabilityType,
  });

  const [editState, setEditState] = useState<Book | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const fetchBooks = async () => {
    try {
      const response = await fetch(apiUrl('/api/books'));
      const data = await response.json();
      const mapped: Book[] = data.map((item: any) => ({
        id: item._id,
        title: item.title,
        author: item.author,
        faculty: item.faculty,
        category: item.category,
        description: item.description,
        image: item.image || '',
        availability: item.availability,
      }));
      setBooks(mapped);
    } catch (error) {
      showMessage('Failed to load books.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (q === '') return books;
    return books.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.faculty.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }, [books, searchText]);

  const handleAddBook = async () => {
    if (!formState.title.trim() || !formState.author.trim() || !formState.category.trim()) {
      showMessage('Please fill in title, author, and category.', 'error');
      return;
    }

    try {
      const response = await fetch(apiUrl('/api/books'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formState),
      });

      if (!response.ok) throw new Error('Failed to create book');

      const savedBook = await response.json();
      const newBook: Book = {
        id: savedBook._id,
        title: savedBook.title,
        author: savedBook.author,
        faculty: savedBook.faculty,
        category: savedBook.category,
        description: savedBook.description,
        image: savedBook.image || '',
        availability: savedBook.availability,
      };

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setBooks((prev) => [newBook, ...prev]);
      showMessage('Book added successfully.', 'success');
      setFormState({
        title: '', author: '', faculty: 'Computing', category: '',
        description: '', image: '', availability: 'Available',
      });
    } catch (error) {
      showMessage('Failed to add book.', 'error');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete this book?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await fetch(apiUrl(`/api/books/${id}`), {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${user?.token}` },
            });
            if (!response.ok) throw new Error('Failed to delete');
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setBooks((prev) => prev.filter((item) => item.id !== id));
            showMessage('Book deleted successfully.', 'success');
          } catch (error) {
            showMessage('Failed to delete book.', 'error');
          }
        },
      },
    ]);
  };

  const handleUpdate = async () => {
    if (!editState) return;
    try {
      const response = await fetch(apiUrl(`/api/books/${editState.id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(editState),
      });
      if (!response.ok) throw new Error('Failed to update');
      const updatedData = await response.json();
      const updatedBook: Book = {
        id: updatedData._id,
        title: updatedData.title,
        author: updatedData.author,
        faculty: updatedData.faculty,
        category: updatedData.category,
        description: updatedData.description,
        image: updatedData.image || '',
        availability: updatedData.availability,
      };
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setBooks((prev) => prev.map((item) => (item.id === editState.id ? updatedBook : item)));
      showMessage('Book updated successfully.', 'success');
      setEditingId(null);
      setEditState(null);
    } catch (error) {
      showMessage('Failed to update book.', 'error');
    }
  };

  const toggleEditMode = (item: Book) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (editingId === item.id) {
      setEditingId(null);
      setEditState(null);
    } else {
      setEditingId(item.id);
      setEditState({ ...item });
    }
  };

  const renderFacultyChips = (selected: FacultyType, onSelect: (fac: FacultyType) => void) => (
    <View style={styles.optionWrap}>
      {['Computing', 'Business', 'Engineering', 'Humanities & Sciences'].map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.optionChip, selected === item && styles.activeOptionChip]}
          onPress={() => onSelect(item as FacultyType)}
        >
          <Text style={[styles.optionChipText, selected === item && styles.activeOptionChipText]}>
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderAvailabilityChips = (selected: AvailabilityType, onSelect: (avail: AvailabilityType) => void) => (
    <View style={styles.optionWrap}>
      {['Available', 'Borrowed'].map((item) => (
        <TouchableOpacity
          key={item}
          style={[styles.optionChip, selected === item && styles.activeOptionChip]}
          onPress={() => onSelect(item as AvailabilityType)}
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
        <Stack.Screen options={{ title: 'Admin Library' }} />
        <LinearGradient colors={['#eef2ff', '#f8fafc']} style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Loading Library Books...</Text>
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Admin Library' }} />
      <LinearGradient colors={['#eef2ff', '#f8fafc']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>📚 Admin Library</Text>
          <Text style={styles.subtitle}>
            Add, edit, and manage all books in the campus library.
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, author, category..."
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
            <Text style={styles.sectionTitle}>➕ Add New Book</Text>
            <TextInput style={styles.input} placeholder="Book Title" value={formState.title} onChangeText={(t) => setFormState({ ...formState, title: t })} />
            <TextInput style={styles.input} placeholder="Author" value={formState.author} onChangeText={(t) => setFormState({ ...formState, author: t })} />
            <TextInput style={styles.input} placeholder="Category (e.g., Programming)" value={formState.category} onChangeText={(t) => setFormState({ ...formState, category: t })} />
            <TextInput style={styles.input} placeholder="Image URL (optional)" value={formState.image} onChangeText={(t) => setFormState({ ...formState, image: t })} />
            <TextInput style={[styles.input, styles.textArea]} placeholder="Description" value={formState.description} onChangeText={(t) => setFormState({ ...formState, description: t })} multiline />
            
            <Text style={styles.subTitle}>Faculty</Text>
            {renderFacultyChips(formState.faculty, (fac) => setFormState({ ...formState, faculty: fac }))}
            
            <Text style={styles.subTitle}>Availability</Text>
            {renderAvailabilityChips(formState.availability, (avail) => setFormState({ ...formState, availability: avail }))}
            
            <TouchableOpacity style={styles.primaryButton} onPress={handleAddBook}>
              <Text style={styles.primaryButtonText}>Add Book to Library</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>📖 All Books</Text>
          {filteredBooks.map((item) => (
            <View key={item.id} style={styles.bookCard}>
              {item.image ? <Image source={{ uri: item.image }} style={styles.bookImage} /> : null}
              <View style={styles.bookContent}>
                <View style={styles.topRow}>
                  <Text style={styles.bookTitle}>{item.title}</Text>
                  <Text style={[styles.statusBadge, item.availability === 'Available' ? styles.availableBadge : styles.borrowedBadge]}>
                    {item.availability}
                  </Text>
                </View>
                <Text style={styles.metaText}><Text style={styles.metaLabel}>Author:</Text> {item.author}</Text>
                <Text style={styles.metaText}><Text style={styles.metaLabel}>Faculty:</Text> {item.faculty}</Text>
                <Text style={styles.metaText}><Text style={styles.metaLabel}>Category:</Text> {item.category}</Text>
                <Text style={styles.descriptionText}>{item.description}</Text>

                {editingId === item.id && editState && (
                  <View style={styles.editForm}>
                    <TextInput style={styles.input} value={editState.title} onChangeText={(t) => setEditState({ ...editState, title: t })} />
                    <TextInput style={styles.input} value={editState.author} onChangeText={(t) => setEditState({ ...editState, author: t })} />
                    <TextInput style={styles.input} value={editState.category} onChangeText={(t) => setEditState({ ...editState, category: t })} />
                    <TextInput style={styles.input} value={editState.image} onChangeText={(t) => setEditState({ ...editState, image: t })} />
                    <TextInput style={[styles.input, styles.textArea]} value={editState.description} onChangeText={(t) => setEditState({ ...editState, description: t })} multiline />
                    
                    <Text style={styles.subTitle}>Faculty</Text>
                    {renderFacultyChips(editState.faculty, (fac) => setEditState({ ...editState, faculty: fac }))}
                    
                    <Text style={styles.subTitle}>Availability</Text>
                    {renderAvailabilityChips(editState.availability, (avail) => setEditState({ ...editState, availability: avail }))}
                    
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

  bookCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  bookImage: {
    width: '100%',
    height: 150,
  },
  bookContent: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bookTitle: { flex: 1, fontSize: 18, fontWeight: '700', color: '#111827' },
  metaText: { fontSize: 14, color: '#4b5563', marginBottom: 4 },
  metaLabel: { fontWeight: '600' },
  descriptionText: { fontSize: 14, color: '#374151', lineHeight: 20, marginTop: 8 },
  
  statusBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    overflow: 'hidden',
  },
  availableBadge: { backgroundColor: '#dcfce7', color: '#166534' },
  borrowedBadge: { backgroundColor: '#fee2e2', color: '#b91c1c' },

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