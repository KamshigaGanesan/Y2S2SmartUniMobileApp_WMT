import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Stack } from 'expo-router';

type DirectoryTab =
  | 'All'
  | 'Issue Routing'
  | 'Academic Staff'
  | 'Non-Academic'
  | 'Administration'
  | 'Emergency';

type StaffType =
  | 'Issue Routing'
  | 'Academic Staff'
  | 'Non-Academic'
  | 'Administration'
  | 'Emergency';

type DirectoryItem = {
  id: number;
  title: string;
  category: StaffType;
  person?: string;
  role?: string;
  department?: string;
  contact?: string;
  email?: string;
  location?: string;
  hours?: string;
  issue?: string;
  description: string;
};

export default function CampusDirectoryScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedTab, setSelectedTab] = useState<DirectoryTab>('All');
  const [expandedId, setExpandedId] = useState<number | null>(1);
  const [savedIds, setSavedIds] = useState<number[]>([]);
  const [message, setMessage] = useState('');

  const directoryItems: DirectoryItem[] = [
    {
      id: 1,
      title: 'Exam Timetable or Hall Issue',
      category: 'Issue Routing',
      issue: 'Exam issue',
      person: 'Examination Division',
      role: 'Exam Support Office',
      department: 'Administration',
      contact: '011-2345678',
      email: 'exams@campus.lk',
      location: 'Admin Block - Ground Floor',
      hours: '8.30 AM - 4.30 PM',
      description:
        'If you have exam timetable clashes, hall issues, missing names, or exam card problems, contact the Examination Division first.',
    },
    {
      id: 2,
      title: 'LMS / System Login Problem',
      category: 'Issue Routing',
      issue: 'System issue',
      person: 'IT Help Desk',
      role: 'Technical Support',
      department: 'IT Services',
      contact: '011-2456789',
      email: 'itsupport@campus.lk',
      location: 'IT Support Center',
      hours: '8.00 AM - 5.00 PM',
      description:
        'For LMS login issues, portal password resets, network problems, or account access issues, contact the IT Help Desk.',
    },
    {
      id: 3,
      title: 'Course / Academic Problem',
      category: 'Issue Routing',
      issue: 'Academic issue',
      person: 'Academic Coordinator',
      role: 'Academic Support',
      department: 'Faculty Office',
      contact: '011-2567890',
      email: 'academic@campus.lk',
      location: 'Faculty Office - 1st Floor',
      hours: '9.00 AM - 4.00 PM',
      description:
        'For timetable issues, module registration, attendance concerns, academic requests, and class-related matters, contact the Academic Coordinator.',
    },
    {
      id: 4,
      title: 'Payment / Fee Issue',
      category: 'Issue Routing',
      issue: 'Finance issue',
      person: 'Finance Office',
      role: 'Student Payments',
      department: 'Finance Division',
      contact: '011-2678910',
      email: 'finance@campus.lk',
      location: 'Finance Office - Admin Block',
      hours: '8.30 AM - 3.30 PM',
      description:
        'For fee balances, payment confirmations, receipts, installment issues, and finance-related matters, visit the Finance Office.',
    },
    {
      id: 5,
      title: 'Dr. R. Sivapalan',
      category: 'Academic Staff',
      person: 'Dr. R. Sivapalan',
      role: 'Senior Lecturer',
      department: 'Software Engineering',
      contact: '011-2789011',
      email: 'sivapalan@campus.lk',
      location: 'Faculty Room A-204',
      hours: 'Consultation: Tue 10.00 AM - 12.00 PM',
      description:
        'Teaches Software Engineering and guides student academic projects, research, and consultation sessions.',
    },
    {
      id: 6,
      title: 'Ms. P. Tharshika',
      category: 'Academic Staff',
      person: 'Ms. P. Tharshika',
      role: 'Lecturer',
      department: 'Web and Mobile Technologies',
      contact: '011-2789012',
      email: 'tharshika@campus.lk',
      location: 'Faculty Room B-112',
      hours: 'Consultation: Mon 1.00 PM - 3.00 PM',
      description:
        'Handles web and mobile related modules, practical support, lab activities, and student learning guidance.',
    },
    {
      id: 7,
      title: 'Mr. A. Ketheeswaran',
      category: 'Academic Staff',
      person: 'Mr. A. Ketheeswaran',
      role: 'Assistant Lecturer',
      department: 'Operating Systems and System Administration',
      contact: '011-2789013',
      email: 'kethees@campus.lk',
      location: 'Lab Coordinator Office',
      hours: 'Consultation: Wed 9.00 AM - 11.00 AM',
      description:
        'Supports operating systems labs, practical sessions, technical clarifications, and assignment guidance.',
    },
    {
      id: 8,
      title: 'Library Counter Support',
      category: 'Non-Academic',
      person: 'Library Support Desk',
      role: 'Library Assistant',
      department: 'Library Services',
      contact: '011-2890123',
      email: 'library@campus.lk',
      location: 'Main Library Counter',
      hours: '8.00 AM - 6.00 PM',
      description:
        'For book borrowing, return issues, library membership, overdue clarifications, and resource support.',
    },
    {
      id: 9,
      title: 'Student Affairs Officer',
      category: 'Non-Academic',
      person: 'Student Affairs Office',
      role: 'Student Support Officer',
      department: 'Student Affairs',
      contact: '011-2890456',
      email: 'studentaffairs@campus.lk',
      location: 'Student Affairs Unit',
      hours: '8.30 AM - 4.30 PM',
      description:
        'Handles student letters, personal support, official requests, welfare concerns, and student-related guidance.',
    },
    {
      id: 10,
      title: 'Dean - Faculty of Computing',
      category: 'Administration',
      person: 'Prof. N. Raman',
      role: 'Dean',
      department: 'Faculty of Computing',
      contact: '011-2901234',
      email: 'deancomputing@campus.lk',
      location: 'Dean Office',
      hours: 'By appointment',
      description:
        'Provides academic leadership for the faculty and handles major faculty-level matters, escalations, and policy guidance.',
    },
    {
      id: 11,
      title: 'Head of Department',
      category: 'Administration',
      person: 'Dr. K. Mahendran',
      role: 'Head of Department',
      department: 'Software Engineering',
      contact: '011-2901235',
      email: 'hodse@campus.lk',
      location: 'HOD Office',
      hours: 'By appointment',
      description:
        'Responsible for department-level decisions, academic management, module coordination, and escalated student concerns.',
    },
    {
      id: 12,
      title: 'Campus Security',
      category: 'Emergency',
      person: 'Security Unit',
      role: 'Emergency Contact',
      department: 'Security',
      contact: '011-2999000',
      email: 'security@campus.lk',
      location: 'Main Gate',
      hours: '24/7',
      description:
        'For urgent campus security issues, lost personal safety concerns, gate incidents, and immediate emergency support.',
    },
    {
      id: 13,
      title: 'Medical / First Aid',
      category: 'Emergency',
      person: 'Health Center',
      role: 'Medical Support',
      department: 'Medical Unit',
      contact: '011-2999111',
      email: 'medical@campus.lk',
      location: 'Campus Health Center',
      hours: '8.00 AM - 5.00 PM',
      description:
        'For first aid, urgent medical support, health-related emergencies, and on-campus medical assistance.',
    },
  ];

  const filteredItems = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return directoryItems.filter((item) => {
      const matchesTab =
        selectedTab === 'All' || item.category === selectedTab;

      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.person && item.person.toLowerCase().includes(q)) ||
        (item.role && item.role.toLowerCase().includes(q)) ||
        (item.department && item.department.toLowerCase().includes(q)) ||
        (item.issue && item.issue.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q));

      return matchesTab && matchesSearch;
    });
  }, [directoryItems, searchText, selectedTab]);

  const stats = {
    total: directoryItems.length,
    academic: directoryItems.filter((item) => item.category === 'Academic Staff')
      .length,
    support: directoryItems.filter((item) => item.category === 'Non-Academic')
      .length,
    saved: savedIds.length,
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const toggleSave = (id: number, title: string) => {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((item) => item !== id));
      setMessage(`Removed "${title}" from saved contacts.`);
    } else {
      setSavedIds([...savedIds, id]);
      setMessage(`Saved "${title}" successfully.`);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Campus Directory' }} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>🏛️ Campus Directory & Help Desk</Text>
          <Text style={styles.heroSubtitle}>
            Find the right lecturer, office, or support member quickly based on your issue or department.
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by issue, lecturer, office, department..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.total}</Text>
              <Text style={styles.statLabel}>Contacts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.academic}</Text>
              <Text style={styles.statLabel}>Academic</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.support}</Text>
              <Text style={styles.statLabel}>Support</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.saved}</Text>
              <Text style={styles.statLabel}>Saved</Text>
            </View>
          </View>
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {[
            'All',
            'Issue Routing',
            'Academic Staff',
            'Non-Academic',
            'Administration',
            'Emergency',
          ].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterChip,
                selectedTab === tab && styles.activeFilterChip,
              ]}
              onPress={() => setSelectedTab(tab as DirectoryTab)}
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

        <View style={styles.featuredCard}>
          <Text style={styles.sectionTitle}>✨ Smart Help Routing</Text>
          <Text style={styles.featuredText}>
            If you have an exam problem, go to the Examination Division. If you have LMS login issues, contact the IT Help Desk. If you have course or timetable issues, visit the Academic Coordinator.
          </Text>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>📋 Directory</Text>

          {filteredItems.length === 0 ? (
            <Text style={styles.emptyText}>No matching contacts found.</Text>
          ) : (
            filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;
              const isSaved = savedIds.includes(item.id);

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.directoryCard}
                  activeOpacity={0.9}
                  onPress={() => toggleExpand(item.id)}
                >
                  <View style={styles.topRow}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.categoryBadge}>{item.category}</Text>
                  </View>

                  {item.person ? (
                    <Text style={styles.metaText}>Contact: {item.person}</Text>
                  ) : null}

                  {item.department ? (
                    <Text style={styles.metaText}>Department: {item.department}</Text>
                  ) : null}

                  <Text style={styles.expandHint}>
                    {isExpanded ? 'Tap to collapse ▲' : 'Tap to view more ▼'}
                  </Text>

                  {isExpanded && (
                    <View style={styles.expandedSection}>
                      {item.role ? (
                        <Text style={styles.metaText}>Role: {item.role}</Text>
                      ) : null}
                      {item.issue ? (
                        <Text style={styles.metaText}>Issue Type: {item.issue}</Text>
                      ) : null}
                      {item.contact ? (
                        <Text style={styles.metaText}>Phone: {item.contact}</Text>
                      ) : null}
                      {item.email ? (
                        <Text style={styles.metaText}>Email: {item.email}</Text>
                      ) : null}
                      {item.location ? (
                        <Text style={styles.metaText}>Location: {item.location}</Text>
                      ) : null}
                      {item.hours ? (
                        <Text style={styles.metaText}>Office Hours: {item.hours}</Text>
                      ) : null}

                      <Text style={styles.descriptionText}>{item.description}</Text>

                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          style={styles.primaryButton}
                          activeOpacity={0.85}
                          onPress={() => {
                            setMessage(`Contact request prepared for "${item.title}".`);
                          }}
                        >
                          <Text style={styles.primaryButtonText}>Contact</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.secondaryButton}
                          activeOpacity={0.85}
                          onPress={() => toggleSave(item.id, item.title)}
                        >
                          <Text style={styles.secondaryButtonText}>
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
        </View>

        <View style={styles.savedCard}>
          <Text style={styles.sectionTitle}>📌 Saved Contacts</Text>

          {savedIds.length === 0 ? (
            <Text style={styles.emptyText}>No saved contacts yet.</Text>
          ) : (
            directoryItems
              .filter((item) => savedIds.includes(item.id))
              .map((item) => (
                <Text key={item.id} style={styles.savedItem}>
                  • {item.title}
                </Text>
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
    backgroundColor: '#1e3a8a',
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
    color: '#dbeafe',
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 90,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  statLabel: {
    fontSize: 13,
    color: '#475569',
    marginTop: 2,
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
    backgroundColor: '#1e3a8a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dismissButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  filterRow: {
    paddingBottom: 16,
    gap: 10,
  },
  filterChip: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: '#1e3a8a',
  },
  filterChipText: {
    color: '#1e3a8a',
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilterChipText: {
    color: '#ffffff',
  },
  featuredCard: {
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
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  savedCard: {
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
    marginBottom: 12,
  },
  featuredText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  directoryCard: {
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
  categoryBadge: {
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#dbeafe',
    color: '#1e3a8a',
  },
  metaText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  expandHint: {
    fontSize: 13,
    color: '#1e3a8a',
    fontWeight: '600',
    marginTop: 6,
  },
  expandedSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  descriptionText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
    marginBottom: 14,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  savedItem: {
    fontSize: 15,
    color: '#111827',
    marginBottom: 8,
    lineHeight: 20,
  },
});