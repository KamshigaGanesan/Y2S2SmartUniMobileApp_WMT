import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { apiUrl } from '@/constants/api';

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
  category: AnnouncementCategory | string;
  date: string;
  priority: AnnouncementPriority | string;
  description: string;
};

type FeedMode = 'All' | 'Important' | 'Saved' | 'Today';

const FILTERS: Array<'All' | AnnouncementCategory> = [
  'All',
  'Academic',
  'Events',
  'Exams',
  'Library',
  'Canteen',
  'Administration',
];

export default function AnnouncementScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | AnnouncementCategory>('All');
  const [feedMode, setFeedMode] = useState<FeedMode>('All');
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async (options?: { silent?: boolean }) => {
    try {
      if (!options?.silent) {
        setLoading(true);
      }

      const response = await fetch(apiUrl('/announcements'));
      const data = await response.json();

      const mapped: Announcement[] = Array.isArray(data)
        ? data.map((item: any) => ({
            id: item._id,
            title: item.title,
            category: item.category,
            date: item.date,
            priority: item.priority,
            description: item.description,
          }))
        : [];

      setAnnouncements(mapped);
    } catch (error) {
      console.log('Error fetching announcements:', error);
      setMessage('Failed to load announcements from the server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredAnnouncements = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return announcements
      .filter((item) => {
      const matchesCategory =
        selectedCategory === 'All' || item.category === selectedCategory;

      const matchesMode =
        feedMode === 'All' ||
        (feedMode === 'Important' && item.priority === 'High') ||
        (feedMode === 'Saved' && savedItems.includes(item.id)) ||
        (feedMode === 'Today' && isToday(item.date));

      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.priority.toLowerCase().includes(q) ||
        item.date.toLowerCase().includes(q);

      return matchesCategory && matchesMode && matchesSearch;
      })
      .sort((a, b) => {
        const priorityScore = (value: string) => {
          if (value === 'High') return 3;
          if (value === 'Medium') return 2;
          return 1;
        };

        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();

        if (priorityScore(b.priority) !== priorityScore(a.priority)) {
          return priorityScore(b.priority) - priorityScore(a.priority);
        }

        if (!Number.isNaN(dateA) && !Number.isNaN(dateB)) {
          return dateB - dateA;
        }

        return a.title.localeCompare(b.title);
      });
  }, [announcements, searchText, selectedCategory, feedMode, savedItems]);

  const highPriorityCount = announcements.filter((item) => item.priority === 'High').length;
  const todayCount = announcements.filter((item) => isToday(item.date)).length;
  const featuredAnnouncement =
    filteredAnnouncements.find((item) => item.priority === 'High') || filteredAnnouncements[0];

  const toggleSave = (id: string, title: string) => {
    const isSaved = savedItems.includes(id);

    if (isSaved) {
      setSavedItems((prev) => prev.filter((item) => item !== id));
      setMessage(`Removed "${title}" from saved announcements.`);
      return;
    }

    setSavedItems((prev) => [...prev, id]);
    setMessage(`Saved "${title}" successfully.`);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (value: string) => {
    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPriorityBadgeStyle = (priority: string) => {
    if (priority === 'High') return styles.priorityHigh;
    if (priority === 'Medium') return styles.priorityMedium;
    return styles.priorityNormal;
  };

  const getCategoryAccent = (category: string) => {
    if (category === 'Academic') return styles.accentAcademic;
    if (category === 'Events') return styles.accentEvents;
    if (category === 'Exams') return styles.accentExams;
    if (category === 'Library') return styles.accentLibrary;
    if (category === 'Canteen') return styles.accentCanteen;
    return styles.accentAdministration;
  };

  const getCategoryIcon = (category: string) => {
    if (category === 'Academic') return 'Graduation';
    if (category === 'Events') return 'Spotlight';
    if (category === 'Exams') return 'Important';
    if (category === 'Library') return 'Resources';
    if (category === 'Canteen') return 'Dining';
    return 'Campus';
  };

  const resetFilters = () => {
    setSearchText('');
    setSelectedCategory('All');
    setFeedMode('All');
    setExpandedId(null);
    setMessage('');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnnouncements({ silent: true });
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
          <Text style={styles.loadingText}>Loading announcements...</Text>
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <LinearGradient colors={['#eef2ff', '#f8fafc', '#e0e7ff']} style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#1e3a8a"
              colors={['#1e3a8a']}
            />
          }
        >
          <LinearGradient
            colors={['#2563eb', '#1e3a8a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroSection}
          >
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View style={styles.heroHeaderRow}>
              <View style={styles.heroTitleWrap}>
                <Text style={styles.heroEyebrow}>Smart Campus Bulletin</Text>
                <Text style={styles.heroTitle}>Announcements Hub</Text>
                <Text style={styles.heroSubtitle}>
                  Stay on top of official updates, academic notices, campus events, and urgent alerts.
                </Text>
              </View>

              <View style={styles.heroMiniCard}>
                <Text style={styles.heroMiniValue}>{filteredAnnouncements.length}</Text>
                <Text style={styles.heroMiniLabel}>Visible</Text>
              </View>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search announcements, categories, or priority..."
              placeholderTextColor="#94a3b8"
              value={searchText}
              onChangeText={setSearchText}
            />

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{announcements.length}</Text>
                <Text style={styles.statLabel}>Total Updates</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{highPriorityCount}</Text>
                <Text style={styles.statLabel}>Urgent</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{todayCount}</Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{savedItems.length}</Text>
                <Text style={styles.statLabel}>Saved</Text>
              </View>
            </View>

            <View style={styles.heroActionsRow}>
              <TouchableOpacity
                style={styles.heroActionButton}
                activeOpacity={0.85}
                onPress={handleRefresh}
              >
                <Text style={styles.heroActionButtonText}>Refresh Feed</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.heroActionButton, styles.heroActionButtonSecondary]}
                activeOpacity={0.85}
                onPress={() => setFeedMode('Saved')}
              >
                <Text style={[styles.heroActionButtonText, styles.heroActionButtonSecondaryText]}>
                  Saved Only
                </Text>
              </TouchableOpacity>
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

          <View style={styles.quickSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Quick Overview</Text>
              <TouchableOpacity activeOpacity={0.85} onPress={resetFilters}>
                <Text style={styles.sectionAction}>Reset</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quickGrid}>
              <View style={styles.quickTile}>
                <Text style={styles.quickTileLabel}>Priority Watch</Text>
                <Text style={styles.quickTileValue}>{highPriorityCount}</Text>
                <Text style={styles.quickTileText}>High-priority notices needing attention</Text>
              </View>

              <View style={styles.quickTile}>
                <Text style={styles.quickTileLabel}>Search Results</Text>
                <Text style={styles.quickTileValue}>{filteredAnnouncements.length}</Text>
                <Text style={styles.quickTileText}>Announcements matching your current filter</Text>
              </View>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.modeRow}
            >
              {(['All', 'Important', 'Saved', 'Today'] as FeedMode[]).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.modeChip,
                    feedMode === item && styles.modeChipActive,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => setFeedMode(item)}
                >
                  <Text
                    style={[
                      styles.modeChipText,
                      feedMode === item && styles.modeChipTextActive,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            {FILTERS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.filterChip,
                  selectedCategory === item && styles.activeFilterChip,
                ]}
                activeOpacity={0.85}
                onPress={() => setSelectedCategory(item)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedCategory === item && styles.activeFilterChipText,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {featuredAnnouncement ? (
            <LinearGradient
              colors={['#ffffff', '#eff6ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.featuredCard}
            >
              <View style={styles.featuredTopRow}>
                <View>
                  <Text style={styles.featuredLabel}>Featured Notice</Text>
                  <Text style={styles.featuredCategory}>
                    {getCategoryIcon(featuredAnnouncement.category)} • {featuredAnnouncement.category}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.priorityBadge,
                    getPriorityBadgeStyle(featuredAnnouncement.priority),
                  ]}
                >
                  {featuredAnnouncement.priority}
                </Text>
              </View>

              <Text style={styles.featuredTitle}>{featuredAnnouncement.title}</Text>
              <Text style={styles.featuredText} numberOfLines={3}>
                {featuredAnnouncement.description}
              </Text>

              <View style={styles.featuredFooter}>
                <Text style={styles.featuredDate}>{formatDate(featuredAnnouncement.date)}</Text>

                <TouchableOpacity
                  style={styles.featuredButton}
                  activeOpacity={0.85}
                  onPress={() => toggleExpand(featuredAnnouncement.id)}
                >
                  <Text style={styles.featuredButtonText}>
                    {expandedId === featuredAnnouncement.id ? 'Hide Details' : 'View Details'}
                  </Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          ) : null}

          <View style={styles.discoveryHeader}>
            <Text style={styles.resultsTitle}>Announcement Feed</Text>
            <Text style={styles.resultsSubtitle}>
              Tap a card to expand the full notice and save important updates for later.
            </Text>
            <Text style={styles.resultsMeta}>
              Mode: {feedMode} • Category: {selectedCategory} • Sorted by priority and latest date
            </Text>
          </View>

          {filteredAnnouncements.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No announcements found</Text>
              <Text style={styles.emptyText}>
                Try a different search term or switch the category filter.
              </Text>
            </View>
          ) : (
            filteredAnnouncements.map((item) => {
              const isSaved = savedItems.includes(item.id);
              const isExpanded = expandedId === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.announcementCard}
                  activeOpacity={0.92}
                  onPress={() => toggleExpand(item.id)}
                >
                  <View style={styles.cardTopRow}>
                    <View style={[styles.categoryPill, getCategoryAccent(item.category)]}>
                      <Text style={styles.categoryPillText}>
                        {getCategoryIcon(item.category)} • {item.category}
                      </Text>
                    </View>

                    <Text style={[styles.priorityBadge, getPriorityBadgeStyle(item.priority)]}>
                      {item.priority}
                    </Text>
                  </View>

                  <Text style={styles.announcementTitle}>{item.title}</Text>

                  <View style={styles.metaRow}>
                    <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                    <Text style={styles.expandHint}>
                      {isExpanded ? 'Collapse' : 'Read More'}
                    </Text>
                  </View>

                  <Text
                    style={styles.descriptionText}
                    numberOfLines={isExpanded ? undefined : 2}
                  >
                    {item.description}
                  </Text>

                  {isExpanded ? (
                    <View style={styles.expandedSection}>
                      <View style={styles.detailStrip}>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Category</Text>
                          <Text style={styles.detailValue}>{item.category}</Text>
                        </View>
                        <View style={styles.detailItem}>
                          <Text style={styles.detailLabel}>Priority</Text>
                          <Text style={styles.detailValue}>{item.priority}</Text>
                        </View>
                      </View>

                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={styles.primaryButton}
                          activeOpacity={0.85}
                          onPress={() => toggleSave(item.id, item.title)}
                        >
                          <Text style={styles.primaryButtonText}>
                            {isSaved ? 'Saved Notice' : 'Save Notice'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.secondaryButton,
                            isSaved && styles.secondaryButtonActive,
                          ]}
                          activeOpacity={0.85}
                          onPress={() => toggleExpand(item.id)}
                        >
                          <Text
                            style={[
                              styles.secondaryButtonText,
                              isSaved && styles.secondaryButtonTextActive,
                            ]}
                          >
                            Close
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.cardBottomRow}>
                      <TouchableOpacity
                        style={[
                          styles.saveButton,
                          isSaved && styles.saveButtonActive,
                        ]}
                        activeOpacity={0.85}
                        onPress={() => toggleSave(item.id, item.title)}
                      >
                        <Text
                          style={[
                            styles.saveButtonText,
                            isSaved && styles.saveButtonTextActive,
                          ]}
                        >
                          {isSaved ? 'Saved' : 'Save'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Announcements Summary</Text>
            <Text style={styles.summaryText}>Saved announcements: {savedItems.length}</Text>
            <Text style={styles.summaryText}>Active category: {selectedCategory}</Text>
            <Text style={styles.summaryText}>Current results: {filteredAnnouncements.length}</Text>

            <TouchableOpacity
              style={styles.resetButton}
              activeOpacity={0.85}
              onPress={resetFilters}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </>
  );
}

function isToday(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const today = new Date();

  return (
    parsed.getFullYear() === today.getFullYear() &&
    parsed.getMonth() === today.getMonth() &&
    parsed.getDate() === today.getDate()
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
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  heroTitleWrap: {
    flex: 1,
  },
  heroEyebrow: {
    fontSize: 12,
    color: '#bfdbfe',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '800',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 31,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: '#dbeafe',
    lineHeight: 22,
  },
  heroMiniCard: {
    minWidth: 82,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  heroMiniValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  heroMiniLabel: {
    fontSize: 12,
    color: '#dbeafe',
    marginTop: 2,
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
    minWidth: 92,
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
  heroActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroActionButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  heroActionButtonSecondary: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  heroActionButtonText: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '800',
  },
  heroActionButtonSecondaryText: {
    color: '#ffffff',
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
  quickSection: {
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#111827',
  },
  sectionAction: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '700',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  modeRow: {
    paddingTop: 14,
    gap: 10,
  },
  modeChip: {
    backgroundColor: '#eef2ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    marginRight: 10,
  },
  modeChipActive: {
    backgroundColor: '#1e3a8a',
  },
  modeChipText: {
    color: '#1e3a8a',
    fontSize: 13,
    fontWeight: '700',
  },
  modeChipTextActive: {
    color: '#ffffff',
  },
  quickTile: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 14,
    width: '48.5%',
    minHeight: 122,
    borderWidth: 1,
    borderColor: '#eef2ff',
  },
  quickTileLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 10,
  },
  quickTileValue: {
    fontSize: 28,
    color: '#111827',
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.6,
  },
  quickTileText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
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
  featuredCard: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  featuredTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  featuredLabel: {
    fontSize: 13,
    color: '#1e3a8a',
    fontWeight: '800',
    marginBottom: 4,
  },
  featuredCategory: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  featuredTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 30,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  featuredText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  featuredDate: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '600',
  },
  featuredButton: {
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
  },
  featuredButtonText: {
    color: '#ffffff',
    fontSize: 14,
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
  resultsMeta: {
    fontSize: 13,
    color: '#475569',
    marginTop: 8,
    lineHeight: 18,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  announcementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  accentAcademic: {
    backgroundColor: '#dbeafe',
  },
  accentEvents: {
    backgroundColor: '#ede9fe',
  },
  accentExams: {
    backgroundColor: '#fee2e2',
  },
  accentLibrary: {
    backgroundColor: '#dcfce7',
  },
  accentCanteen: {
    backgroundColor: '#fef3c7',
  },
  accentAdministration: {
    backgroundColor: '#e2e8f0',
  },
  categoryPillText: {
    color: '#1e3a8a',
    fontSize: 12,
    fontWeight: '700',
  },
  priorityBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  priorityHigh: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
  },
  priorityMedium: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  priorityNormal: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  announcementTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 27,
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 13,
    color: '#64748b',
  },
  expandHint: {
    fontSize: 13,
    color: '#1e3a8a',
    fontWeight: '700',
  },
  descriptionText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 21,
  },
  expandedSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  detailStrip: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  detailItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eef2ff',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '700',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1e3a8a',
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
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  saveButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
  },
  saveButtonActive: {
    backgroundColor: '#dbeafe',
  },
  saveButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  saveButtonTextActive: {
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
