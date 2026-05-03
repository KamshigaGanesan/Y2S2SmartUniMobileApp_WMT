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
  } from 'react-native';
  import { apiUrl } from '@/constants/api';
  import { Stack, useRouter } from 'expo-router';
  import { LinearGradient } from 'expo-linear-gradient';
  import { mockLibraryData } from '@/src/api/mockLibraryData';
  import * as WebBrowser from 'expo-web-browser';

  type TabType =
    | 'All'
    | 'Course Readings'
    | 'eBooks'
    | 'Lecturer Publications'
    | 'Student Research'
    | 'Services';

  type ItemType =
    | 'Course Reading'
    | 'eBook'
    | 'Lecturer Publication'
    | 'Student Research'
    | 'Service';

  type LibraryItem = {
    id: number;
    title: string;
    author?: string;
    module?: string;
    category: TabType;
    type: ItemType;
    availability: 'Available' | 'Unavailable' | 'Online' | 'Service';
    description: string;
    badge: string;
    coverUrl?: string;
    url?: string; // For external links
    route?: string; // For internal navigation
  };

  export default function LibraryScreen() {
    const router = useRouter();

    const [selectedTab, setSelectedTab] = useState<TabType>('All');
    const [searchText, setSearchText] = useState('');
    const [message, setMessage] = useState('');
    const [savedItems, setSavedItems] = useState<number[]>([]);
    const [borrowedItems, setBorrowedItems] = useState<number[]>([]);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      fetchBooks();
    }, []);

    const fetchBooks = async () => {
      try {
        const res = await fetch(apiUrl('/api/books'));
        const data = await res.json();

        const mapped: LibraryItem[] = data.map((book: any, index: number) => ({
          id: index + 1,
          title: book.title,
          author: book.author,
          module: `${book.faculty} • ${book.category}`,
          category: 'Course Readings',
          type: 'Course Reading',
          availability:
            book.availability === 'Available' ? 'Available' : 'Unavailable',
          description: book.description || 'No description available.',
          badge: book.category || 'General',
          coverUrl: book.image,
          url: book.url, // For external links
          route: book.route, // For internal navigation
        }));

        setLibraryItems([...mapped, ...mockLibraryData]);
      } catch (err) {
        console.log('Error fetching library books:', err);
        setMessage('Failed to load library data from backend. Displaying mock data.');
        setLibraryItems(mockLibraryData);
      } finally {
        setLoading(false);
      }
    };

    const normalizedSearch = searchText.trim().toLowerCase();

    const filteredItems = useMemo(() => {
      return libraryItems.filter((item) => {
        const matchesTab = selectedTab === 'All' || item.category === selectedTab;

        const matchesSearch =
          normalizedSearch === '' ||
          item.title.toLowerCase().includes(normalizedSearch) ||
          item.description.toLowerCase().includes(normalizedSearch) ||
          (item.author && item.author.toLowerCase().includes(normalizedSearch)) ||
          (item.module && item.module.toLowerCase().includes(normalizedSearch)) ||
          item.badge.toLowerCase().includes(normalizedSearch) ||
          item.type.toLowerCase().includes(normalizedSearch);

        return matchesTab && matchesSearch;
      });
    }, [libraryItems, selectedTab, normalizedSearch]);

    const quickStats = {
      totalItems: libraryItems.length,
      onlineResources: libraryItems.filter(
        (item) => item.availability === 'Online'
      ).length,
      borrowedCount: borrowedItems.length,
      savedCount: savedItems.length,
    };

    const toggleSave = (id: number, title: string) => {
      const exists = savedItems.includes(id);
      if (exists) {
        setSavedItems(savedItems.filter((itemId) => itemId !== id));
        setMessage(`Removed "${title}" from saved items.`);
      } else {
        setSavedItems([...savedItems, id]);
        setMessage(`Saved "${title}" successfully.`);
      }
    };

    const handlePrimaryAction = (item: LibraryItem) => {
      if (item.type === 'Course Reading') {
        if (item.availability === 'Unavailable') {
          setMessage(`"${item.title}" is currently unavailable.`);
          return;
        }

        if (borrowedItems.includes(item.id)) {
          setMessage(`"${item.title}" is already borrowed.`);
          return;
        }

        setBorrowedItems([...borrowedItems, item.id]);
        setMessage(`Borrowed "${item.title}" successfully.`);
        return;
      }

      // For items with a URL, open with WebBrowser
      if (item.url) {
        WebBrowser.openBrowserAsync(item.url);
        return;
      }

      // For services with an internal route, navigate
      if (item.route) {
        router.push(item.route);
        return;
      }

      // Fallback message for items without a specific action
      setMessage(`No specific action defined for "${item.title}"`);
    };

    const getPrimaryButtonText = (item: LibraryItem) => {
      if (item.type === 'Course Reading') {
        if (item.availability === 'Unavailable') return 'Not Available';
        if (borrowedItems.includes(item.id)) return 'Already Borrowed';
        return 'Borrow Book';
      }

      if (item.type === 'eBook') return 'Access Resource';
      if (item.type === 'Lecturer Publication') return 'View Publication';
      if (item.type === 'Student Research') return 'Open Repository';
      return 'Open Service';
    };

    const getStatusStyle = (availability: LibraryItem['availability']) => {
      if (availability === 'Available') return styles.statusAvailable;
      if (availability === 'Unavailable') return styles.statusUnavailable;
      if (availability === 'Online') return styles.statusOnline;
      return styles.statusService;
    };

    const getActionButtonStyle = (item: LibraryItem) => {
      if (item.type === 'Course Reading') {
        if (item.availability === 'Unavailable') return styles.disabledButton;
        if (borrowedItems.includes(item.id)) return styles.disabledButton;
        return styles.primaryButton;
      }

      return styles.primaryButton;
    };

    const resetLibrary = () => {
      setSelectedTab('All');
      setSearchText('');
      setMessage('');
      setSavedItems([]);
      setBorrowedItems([]);
      setExpandedId(null);
    };

    const toggleExpand = (id: number) => {
      setExpandedId(expandedId === id ? null : id);
    };

    if (loading) {
      return (
        <>
          <Stack.Screen options={{ headerShown: false }} />
          <LinearGradient
            colors={['#eef2ff', '#f8fafc', '#e0e7ff']}
            style={styles.loadingContainer}
          >
            <ActivityIndicator size="large" color="#1e3a8a" />
            <Text style={styles.loadingText}>Loading library...</Text>
          </LinearGradient>
        </>
      );
    }

    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />

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

              <Text style={styles.heroTitle}>📚 Smart Campus Library</Text>
              <Text style={styles.heroSubtitle}>
                Discover books, eResources, lecturer publications, student research,
                and library services in one place.
              </Text>

              <TextInput
                style={styles.searchInput}
                placeholder="Search books, modules, authors, publications, services..."
                placeholderTextColor="#9ca3af"
                value={searchText}
                onChangeText={setSearchText}
              />

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{quickStats.totalItems}</Text>
                  <Text style={styles.statLabel}>Resources</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{quickStats.onlineResources}</Text>
                  <Text style={styles.statLabel}>Online</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{quickStats.borrowedCount}</Text>
                  <Text style={styles.statLabel}>Borrowed</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{quickStats.savedCount}</Text>
                  <Text style={styles.statLabel}>Saved</Text>
                </View>
              </View>
            </LinearGradient>

            {message ? (
              <View style={styles.messageBox}>
                <Text style={styles.messageText}>{message}</Text>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => setMessage('')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {[
                'All',
                'Course Readings',
                'eBooks',
                'Lecturer Publications',
                'Student Research',
                'Services',
              ].map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[
                    styles.filterChip,
                    selectedTab === tab && styles.activeFilterChip,
                  ]}
                  onPress={() => setSelectedTab(tab as TabType)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedTab === tab && styles.activeFilterChipText,
                    ]}
                  >
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.quickAccessSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>⭐ Quick Access</Text>
              </View>

              <View style={styles.quickGrid}>
                <View style={styles.quickTile}>
                  <Text style={styles.quickTileEmoji}>📘</Text>
                  <Text style={styles.quickTileTitle}>Course Readings</Text>
                  <Text style={styles.quickTileText}>Module-linked resources</Text>
                </View>

                <View style={styles.quickTile}>
                  <Text style={styles.quickTileEmoji}>💻</Text>
                  <Text style={styles.quickTileTitle}>eResources</Text>
                  <Text style={styles.quickTileText}>O’Reilly, Pearson, ProQuest</Text>
                </View>

                <TouchableOpacity
                  style={styles.quickTile}
                  activeOpacity={0.85}
                  onPress={() => router.push('/lecturer-publications')}
                >
                  <Text style={styles.quickTileEmoji}>🧑‍🏫</Text>
                  <Text style={styles.quickTileTitle}>Faculty Research</Text>
                  <Text style={styles.quickTileText}>Lecturer publications</Text>
                </TouchableOpacity>

                <View style={styles.quickTile}>
                  <Text style={styles.quickTileEmoji}>🪑</Text>
                  <Text style={styles.quickTileTitle}>Library Services</Text>
                  <Text style={styles.quickTileText}>Spaces, help, past papers</Text>
                </View>
              </View>
            </View>

            <View style={styles.specialSection}>
              <Text style={styles.specialSectionTitle}>🧑‍🏫 Research & Publications</Text>
              <Text style={styles.specialSectionText}>
                Explore lecturer publications, research outputs, and faculty knowledge contributions.
              </Text>

              <TouchableOpacity
                style={styles.specialButton}
                activeOpacity={0.85}
                onPress={() => router.push('/lecturer-publications')}
              >
                <Text style={styles.specialButtonText}>Open Lecturer Publications</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.discoveryHeader}>
              <Text style={styles.resultsTitle}>Library Discovery</Text>
              <Text style={styles.resultsSubtitle}>
                Tap any card to expand and view more details.
              </Text>
            </View>

            {filteredItems.length === 0 ? (
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateTitle}>No matching resources found</Text>
                <Text style={styles.emptyStateText}>
                  Try another keyword, module name, author, or category.
                </Text>
              </View>
            ) : (
              filteredItems.map((item) => {
                const isSaved = savedItems.includes(item.id);
                const isExpanded = expandedId === item.id;

                return (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.resourceCard}
                    activeOpacity={0.92}
                    onPress={() => toggleExpand(item.id)}
                  >
                    <View style={styles.resourceTopRow}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>

                      <Text style={[styles.statusText, getStatusStyle(item.availability)]}>
                        {item.availability}
                      </Text>
                    </View>

                    <View style={styles.resourceMainRow}>
                      {item.coverUrl ? (
                        <View style={styles.coverWrap}>
                          <Image
                            source={{ uri: item.coverUrl }}
                            style={styles.bookCover}
                            resizeMode="cover"
                          />
                          <View style={styles.coverOverlay} />
                        </View>
                      ) : (
                        <View style={styles.bookCoverPlaceholder}>
                          <Text style={styles.bookCoverPlaceholderText}>📘</Text>
                        </View>
                      )}

                      <View style={styles.resourceContent}>
                        <Text style={styles.resourceTitle} numberOfLines={2}>
                          {item.title}
                        </Text>

                        {item.author ? (
                          <Text style={styles.resourceMeta} numberOfLines={1}>
                            {item.author}
                          </Text>
                        ) : null}

                        {item.module ? (
                          <Text style={styles.resourceModule} numberOfLines={1}>
                            {item.module}
                          </Text>
                        ) : null}

                        <Text style={styles.expandHint}>
                          {isExpanded ? 'Collapse details ▲' : 'View details →'}
                        </Text>
                      </View>
                    </View>

                    {isExpanded && (
                      <View style={styles.expandedSection}>
                        <Text style={styles.resourceType}>Type: {item.type}</Text>
                        <Text style={styles.resourceDescription}>{item.description}</Text>

                        <View style={styles.actionRow}>
                          <TouchableOpacity
                            style={getActionButtonStyle(item)}
                            activeOpacity={
                              item.type === 'Course Reading' &&
                              (item.availability === 'Unavailable' ||
                                borrowedItems.includes(item.id))
                                ? 1
                                : 0.85
                            }
                            onPress={() => handlePrimaryAction(item)}
                          >
                            <Text style={styles.primaryButtonText}>
                              {getPrimaryButtonText(item)}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.secondaryButton,
                              isSaved && styles.secondaryButtonActive,
                            ]}
                            activeOpacity={0.85}
                            onPress={() => toggleSave(item.id, item.title)}
                          >
                            <Text
                              style={[
                                styles.secondaryButtonText,
                                isSaved && styles.secondaryButtonTextActive,
                              ]}
                            >
                              {isSaved ? 'Saved' : 'Save'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}

            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>📖 Library Summary</Text>
              <Text style={styles.summaryText}>Borrowed Items: {borrowedItems.length}</Text>
              <Text style={styles.summaryText}>Saved Items: {savedItems.length}</Text>

              {borrowedItems.length > 0 ? (
                <View style={styles.summaryList}>
                  {libraryItems
                    .filter((item) => borrowedItems.includes(item.id))
                    .map((item) => (
                      <Text key={item.id} style={styles.summaryItem}>
                        • {item.title}
                      </Text>
                    ))}
                </View>
              ) : (
                <Text style={styles.emptySummary}>No borrowed items yet.</Text>
              )}

              <TouchableOpacity
                style={styles.resetButton}
                activeOpacity={0.85}
                onPress={resetLibrary}
              >
                <Text style={styles.resetButtonText}>Reset Library</Text>
              </TouchableOpacity>
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
    borderRadius: 30,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.22,
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
    fontSize: 29,
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
    minWidth: 90,
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

  messageBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  messageText: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '700',
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
  },
  activeFilterChip: {
    backgroundColor: '#1e3a8a',
    borderColor: '#1e3a8a',
  },
  filterChipText: {
    color: '#1e3a8a',
    fontWeight: '700',
    fontSize: 14,
  },
  activeFilterChipText: {
    color: '#ffffff',
  },

  quickAccessSection: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  sectionHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  quickTile: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 14,
    width: '48.5%',
    minHeight: 118,
    borderWidth: 1,
    borderColor: '#eef2ff',
  },
  quickTileEmoji: {
    fontSize: 22,
    marginBottom: 8,
  },
  quickTileTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  quickTileText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },

  specialSection: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  specialSectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  specialSectionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
    marginBottom: 14,
  },
  specialButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  specialButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },

  discoveryHeader: {
    marginBottom: 14,
    marginTop: 2,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },

  emptyStateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },

  resourceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#eef2ff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  resourceTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#dbeafe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: '#1e3a8a',
    fontSize: 12,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
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
  statusService: {
    color: '#7c3aed',
  },

  resourceMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  coverWrap: {
    width: 92,
    height: 126,
    borderRadius: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  bookCover: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  coverOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  bookCoverPlaceholder: {
    width: 92,
    height: 126,
    borderRadius: 14,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookCoverPlaceholderText: {
    fontSize: 28,
  },
  resourceContent: {
    flex: 1,
    minHeight: 126,
    justifyContent: 'space-between',
  },
  resourceTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 24,
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  resourceMeta: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 20,
  },
  resourceModule: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
    lineHeight: 18,
  },
  expandHint: {
    fontSize: 13,
    color: '#1e3a8a',
    fontWeight: '700',
    marginTop: 6,
  },

  expandedSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  resourceType: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '700',
    marginBottom: 8,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
    marginBottom: 14,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  disabledButton: {
    flex: 1,
    backgroundColor: '#9ca3af',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonActive: {
    backgroundColor: '#dbeafe',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButtonTextActive: {
    color: '#1e3a8a',
  },

  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 18,
    marginTop: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 15,
    color: '#4b5563',
    marginBottom: 8,
  },
  summaryList: {
    marginTop: 6,
    marginBottom: 10,
  },
  summaryItem: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 6,
    fontWeight: '500',
    lineHeight: 20,
  },
  emptySummary: {
    fontSize: 15,
    color: '#6b7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  resetButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
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