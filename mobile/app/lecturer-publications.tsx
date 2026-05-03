import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Linking, Platform} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';

type PublicationType =
  | 'Journal'
  | 'Conference'
  | 'Book Chapter'
  | 'Research Project'
  | 'Workshop';

type DepartmentType =
  | 'All'
  | 'Software Engineering'
  | 'Computer Science'
  | 'Information Technology'
  | 'Data Science'
  | 'Cybersecurity';

type Publication = {
  id: number;
  title: string;
  author: string;
  year: string;
  venue: string;
  type: PublicationType;
  department: Exclude<DepartmentType, 'All'>;
  openAccess: boolean;
  citations: number;
  abstract: string;
  keywords: string[];
  thumbnail: string;
  link: string;
};

export default function LecturerPublicationsScreen() {
  const [searchText, setSearchText] = useState('');
  const [selectedDepartment, setSelectedDepartment] =
    useState<DepartmentType>('All');
  const [savedItems, setSavedItems] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [currentDownloadLink, setCurrentDownloadLink] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedFile, setDownloadedFile] = useState<string | null>(null);

  const publications: Publication[] = [
    {
      id: 1,
      title: 'A Multi-Modal AI Framework for Assisting the Visually Impaired',
      author: 'Dr. N. Perera, Ms. K. Silva, Student Research Team',
      year: '2025',
      venue: 'International Conference on Intelligent Assistive Systems',
      type: 'Conference',
      department: 'Software Engineering',
      openAccess: true,
      citations: 18,
      abstract:
        'This work presents a multi-modal AI framework that combines object detection and audio feedback to support visually impaired users in daily navigation tasks.',
      keywords: ['AI', 'YOLO', 'Accessibility', 'Computer Vision'],
      thumbnail:
        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
      link: 'https://www.nature.com/articles/s41598-025-27603-8.pdf'
    },
    {
      id: 2,
      title: 'Optimizing MERN-Based Academic Guidance Platforms for Student Decision Support',
      author: 'Dr. S. Wijesinghe, Mr. R. Fernando',
      year: '2024',
      venue: 'Journal of Web Information Systems',
      type: 'Journal',
      department: 'Software Engineering',
      openAccess: true,
      citations: 11,
      abstract:
        'This paper studies scalable MERN-stack architectures for education and career recommendation systems with emphasis on usability and maintainability.',
      keywords: ['MERN', 'Recommendation Systems', 'Education Tech'],
      thumbnail:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80',
      link: 'https://www.ijprems.com/ijprems-paper/mern-stack-powered-academic-management-solution'
    },
    {
      id: 3,
      title: 'Secure Visitor Authentication Models for Smart Campus Environments',
      author: 'Dr. T. Jayasekara, Dr. M. Ibrahim',
      year: '2025',
      venue: 'Campus Security and Digital Identity Symposium',
      type: 'Conference',
      department: 'Cybersecurity',
      openAccess: false,
      citations: 7,
      abstract:
        'A security-focused study on visitor sign-in workflows, digital records, and authentication strategies for modern campus systems.',
      keywords: ['Security', 'Authentication', 'Smart Campus'],
      thumbnail:
        'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80',
      link: 'https://www.metrowireless.com/blog/smart-campus-guide'
    },
    {
      id: 4,
      title: 'A Review of Modern Operating System Teaching Approaches in Undergraduate Computing',
      author: 'Dr. P. Ramanathan',
      year: '2023',
      venue: 'Computing Education Review',
      type: 'Journal',
      department: 'Computer Science',
      openAccess: true,
      citations: 23,
      abstract:
        'This review explores practical and conceptual teaching strategies for operating systems using labs, process models, threading, and file-system activities.',
      keywords: ['Operating Systems', 'Education', 'Pedagogy'],
      thumbnail:
        'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80',
      link: "https://arxiv.org/pdf/2103.00020.pdf"
    },
    {
      id: 5,
      title: 'Data-Driven Library Recommendation Models for University Resource Discovery',
      author: 'Dr. H. Gunawardena, Ms. P. Nadeesha',
      year: '2024',
      venue: 'Journal of Academic Information Access',
      type: 'Journal',
      department: 'Data Science',
      openAccess: true,
      citations: 15,
      abstract:
        'This paper introduces recommendation approaches for university library systems using reading patterns, module alignment, and user preferences.',
      keywords: ['Recommendations', 'Library Systems', 'Analytics'],
      thumbnail:
        'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=900&q=80',
      link: 'https://arxiv.org/pdf/2007.15780.pdf'
    },
    {
      id: 6,
      title: 'Cloud-Native Mobile Backend Design for Student Service Applications',
      author: 'Dr. R. Kularatne, Mr. V. De Silva',
      year: '2025',
      venue: 'Mobile Systems Engineering Workshop',
      type: 'Workshop',
      department: 'Information Technology',
      openAccess: true,
      citations: 5,
      abstract:
        'A practical discussion of backend architecture patterns for mobile student-service apps including authentication, APIs, and deployment design.',
      keywords: ['Mobile Backend', 'Cloud', 'APIs'],
      thumbnail:
        'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=900&q=80',
      link: 'https://arxiv.org/pdf/1908.08021.pdf'
    },
    {
      id: 7,
      title: 'Software Quality Metrics for Student-Centered University Applications',
      author: 'Dr. A. Karunaratne',
      year: '2024',
      venue: 'Software Quality and Process Journal',
      type: 'Journal',
      department: 'Software Engineering',
      openAccess: false,
      citations: 13,
      abstract:
        'This paper proposes software quality indicators for student-centered campus systems, focusing on usability, maintainability, reliability, and scalability.',
      keywords: ['Software Quality', 'Metrics', 'Campus Apps'],
      thumbnail:
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80',
      link: 'https://arxiv.org/pdf/2102.01672.pdf'
    },
    {
      id: 8,
      title: 'Scholarly Communication and Open Access Strategies for Emerging Universities',
      author: 'Dr. L. Senanayake',
      year: '2023',
      venue: 'Book Chapter in Digital Libraries in Higher Education',
      type: 'Book Chapter',
      department: 'Information Technology',
      openAccess: true,
      citations: 9,
      abstract:
        'A chapter discussing repository strategy, faculty research visibility, open access adoption, and metadata quality for institutional knowledge systems.',
      keywords: ['Open Access', 'Repositories', 'Digital Libraries'],
      thumbnail:
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=80',
      link: 'https://arxiv.org/pdf/1807.05637.pdf'
    },
  ];

  const filteredPublications = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return publications.filter((item) => {
      const matchesDepartment =
        selectedDepartment === 'All' || item.department === selectedDepartment;

      const matchesSearch =
        q === '' ||
        item.title.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q) ||
        item.venue.toLowerCase().includes(q) ||
        item.abstract.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.keywords.some((keyword) => keyword.toLowerCase().includes(q));

      return matchesDepartment && matchesSearch;
    });
  }, [searchText, selectedDepartment]);

  const publicationStats = {
    total: publications.length,
    openAccess: publications.filter((item) => item.openAccess).length,
    totalCitations: publications.reduce((sum, item) => sum + item.citations, 0),
    saved: savedItems.length,
  };

  const toggleSave = (id: number, title: string) => {
    const alreadySaved = savedItems.includes(id);

    if (alreadySaved) {
      setSavedItems(savedItems.filter((itemId) => itemId !== id));
      setMessage(`Removed "${title}" from saved publications.`);
    } else {
      setSavedItems([...savedItems, id]);
      setMessage(`Saved "${title}" successfully.`);
    }
  };

 const handleViewArticle = async (link: string) => {
  try {
    const supported = await Linking.canOpenURL(link);

    if (supported) {
      await Linking.openURL(link);
    } else {
      setMessage('Cannot open this article');
    }
  } catch (err) {
    setMessage('Failed to open article');
  }
};

const handleDownload = async (link: string) => {
  try {
    console.log('Platform:', Platform.OS);

    // ❗ If NOT PDF → open instead
    if (!link.toLowerCase().includes('.pdf')) {
      setMessage('Opening article in browser...');
      await Linking.openURL(link);
      return;
    }

    // 👉 WEB → open
    if (Platform.OS === 'web') {
      window.open(link, '_blank');
      return;
    }

    // 👉 MOBILE → download
    const fileUri =
      FileSystem.documentDirectory + `article_${Date.now()}.pdf`;

    setDownloadProgress(0);
    setDownloadedFile(null);

    const downloadResumable = FileSystem.createDownloadResumable(
      link,
      fileUri,
      {},
      (progress) => {
        if (progress.totalBytesExpectedToWrite > 0) {
          const percent =
            progress.totalBytesWritten /
            progress.totalBytesExpectedToWrite;

          setDownloadProgress(percent);
        }
      }
    );

    const result = await downloadResumable.downloadAsync();

    if (!result?.uri) throw new Error('Download failed');

    setDownloadedFile(result.uri);
    setDownloadProgress(1);
    setCurrentDownloadLink(link);
    setMessage('Downloaded successfully 📥');

  } catch (err) {
    console.log('DOWNLOAD ERROR:', err);
    setMessage('Download failed ❌');
  }
};
  const handleOpenFile = async () => {
  try {
    if (!downloadedFile) return;

    if (Platform.OS === 'android') {
      await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
        data: downloadedFile,
        flags: 1,
        type: 'application/pdf',
      });
    } else {
      await Linking.openURL(downloadedFile);
    }
  } catch (err) {
    setMessage('Cannot open file ❌');
  }
}; 

  const handleReset = () => {
    setSearchText('');
    setSelectedDepartment('All');
    setSavedItems([]);
    setMessage('');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Lecturer Publications' }} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>🧑‍🏫 Lecturer Publications</Text>
          <Text style={styles.heroSubtitle}>
            Explore faculty research, journal articles, conference papers,
            book chapters, and campus knowledge outputs in one place.
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, author, keyword, venue, or department..."
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{publicationStats.total}</Text>
              <Text style={styles.statLabel}>Publications</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{publicationStats.openAccess}</Text>
              <Text style={styles.statLabel}>Open Access</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {publicationStats.totalCitations}
              </Text>
              <Text style={styles.statLabel}>Citations</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{publicationStats.saved}</Text>
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
            'Software Engineering',
            'Computer Science',
            'Information Technology',
            'Data Science',
            'Cybersecurity',
          ].map((department) => (
            <TouchableOpacity
              key={department}
              style={[
                styles.filterChip,
                selectedDepartment === department && styles.activeFilterChip,
              ]}
              onPress={() =>
                setSelectedDepartment(department as DepartmentType)
              }
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedDepartment === department &&
                    styles.activeFilterChipText,
                ]}
              >
                {department}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>⭐ Why this section is valuable</Text>
          <View style={styles.quickGrid}>
            <View style={styles.quickTile}>
              <Text style={styles.quickTileEmoji}>📄</Text>
              <Text style={styles.quickTileTitle}>Research Visibility</Text>
              <Text style={styles.quickTileText}>
                Showcase lecturer articles and scholarly outputs.
              </Text>
            </View>
            <View style={styles.quickTile}>
              <Text style={styles.quickTileEmoji}>🎓</Text>
              <Text style={styles.quickTileTitle}>Student Learning</Text>
              <Text style={styles.quickTileText}>
                Connect students with campus research and publications.
              </Text>
            </View>
            <View style={styles.quickTile}>
              <Text style={styles.quickTileEmoji}>🔍</Text>
              <Text style={styles.quickTileTitle}>Easy Discovery</Text>
              <Text style={styles.quickTileText}>
                Search by topic, department, author, or venue.
              </Text>
            </View>
            <View style={styles.quickTile}>
              <Text style={styles.quickTileEmoji}>🌐</Text>
              <Text style={styles.quickTileTitle}>Open Access Focus</Text>
              <Text style={styles.quickTileText}>
                Highlight papers students can read immediately.
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.resultsTitle}>Research Discovery</Text>
        <Text style={styles.resultsSubtitle}>
          Browse campus faculty knowledge outputs and research highlights.
        </Text>

        {filteredPublications.length === 0 ? (
          <View style={styles.emptyStateCard}>
            <Text style={styles.emptyStateTitle}>No matching publications found</Text>
            <Text style={styles.emptyStateText}>
              Try another keyword, author name, department, or research topic.
            </Text>
          </View>
        ) : (
          filteredPublications.map((item) => {
            const isSaved = savedItems.includes(item.id);

            return (
              <View key={item.id} style={styles.publicationCard}>
                <View style={styles.cardTopRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.type}</Text>
                  </View>

                  <Text
                    style={[
                      styles.accessText,
                      item.openAccess ? styles.openAccess : styles.restrictedAccess,
                    ]}
                  >
                    {item.openAccess ? 'Open Access' : 'Restricted'}
                  </Text>
                </View>

                <Image
                  source={{ uri: item.thumbnail }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />

                <Text style={styles.publicationTitle}>{item.title}</Text>
                <Text style={styles.metaText}>Author(s): {item.author}</Text>
                <Text style={styles.metaText}>Department: {item.department}</Text>
                <Text style={styles.metaText}>Venue: {item.venue}</Text>
                <Text style={styles.metaText}>Year: {item.year}</Text>
                <Text style={styles.citationText}>Citations: {item.citations}</Text>

                <Text style={styles.abstractTitle}>Abstract</Text>
                <Text style={styles.abstractText}>{item.abstract}</Text>

                <View style={styles.keywordRow}>
                  {item.keywords.map((keyword) => (
                    <View key={keyword} style={styles.keywordChip}>
                      <Text style={styles.keywordText}>{keyword}</Text>
                    </View>
                  ))}
                </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>

  {/* VIEW BUTTON */}
  <TouchableOpacity
    style={styles.primaryButton}
    onPress={() => handleViewArticle(item.link)}
  >
    <Text style={styles.primaryButtonText}>View Article</Text>
  </TouchableOpacity>

  {/* DOWNLOAD BUTTON */}
  <TouchableOpacity
    style={[
      styles.secondaryButton,
      {
        backgroundColor: item.link.includes('.pdf') ? '#16a34a' : '#9ca3af'
      }
    ]}
    disabled={!item.link.includes('.pdf')}
    onPress={() => handleDownload(item.link)}
  >
    <Text style={{ color: '#fff', fontWeight: '600' }}>
      {item.link.includes('.pdf') ? 'Download' : 'Open'}
    </Text>
  </TouchableOpacity>

  {/* ⭐ SAVE BUTTON (NEW) */}
  <TouchableOpacity
    onPress={() => toggleSave(item.id, item.title)}
    style={{
      backgroundColor: savedItems.includes(item.id) ? '#f59e0b' : '#e5e7eb',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <Text style={{ fontSize: 16 }}>
      {savedItems.includes(item.id) ? '⭐' : '☆'}
    </Text>
  </TouchableOpacity>

</View>
  
  </View>
        
            );
          })
        )}
        {/* 🔽 DOWNLOAD PROGRESS */}
{downloadProgress > 0 && downloadProgress < 1 && (
  <View
    style={{
      marginTop: 10,
      height: 8,
      backgroundColor: '#e5e7eb',
      borderRadius: 10,
      overflow: 'hidden',
    }}
  >
    <View
      style={{
        width: `${downloadProgress * 100}%`,
        height: '100%',
        backgroundColor: '#3b82f6',
      }}
    />
  </View>
)}

{/* 🔽 OPEN FILE BUTTON */}
{downloadedFile && (
  <TouchableOpacity
    onPress={handleOpenFile}
    style={{
      marginTop: 10,
      backgroundColor: '#16a34a',
      padding: 10,
      borderRadius: 10,
      alignItems: 'center',
    }}
  >
    <Text style={{ color: '#fff', fontWeight: '700' }}>
  📂 {currentDownloadLink.endsWith('.pdf') ? 'Open Downloaded File' : 'Open Article'}
</Text>
  </TouchableOpacity>
)}

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>📚 Publications Summary</Text>
          <Text style={styles.summaryText}>
            Saved Publications: {savedItems.length}
          </Text>
          <Text style={styles.summaryText}>
            Open Access Items: {publicationStats.openAccess}
          </Text>

          {savedItems.length > 0 ? (
            <View style={styles.summaryList}>
              {publications
                .filter((item) => savedItems.includes(item.id))
                .map((item) => (
                  <Text key={item.id} style={styles.summaryItem}>
                    • {item.title}
                  </Text>
                ))}
            </View>
          ) : (
            <Text style={styles.emptySummary}>No saved publications yet.</Text>
          )}

          <TouchableOpacity
            style={styles.resetButton}
            activeOpacity={0.8}
            onPress={handleReset}
          >
            <Text style={styles.resetButtonText}>Reset Publications</Text>
          </TouchableOpacity>
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
    marginBottom: 14,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickTile: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 14,
    width: '48%',
  },
  quickTileEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickTileTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  quickTileText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  emptyStateCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  publicationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
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
  accessText: {
    fontSize: 13,
    fontWeight: '700',
  },
  openAccess: {
    color: '#166534',
  },
  restrictedAccess: {
    color: '#b91c1c',
  },
  thumbnail: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    marginBottom: 14,
    backgroundColor: '#e5e7eb',
  },
  publicationTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    lineHeight: 25,
  },
  metaText: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 5,
    lineHeight: 20,
  },
  citationText: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '700',
    marginBottom: 10,
  },
  abstractTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
    marginTop: 4,
  },
  abstractText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
    marginBottom: 12,
  },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  keywordChip: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  keywordText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3730a3',
  },
  actionRow: {
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
    fontSize: 15,
    fontWeight: 'bold',
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
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
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
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#111827',
    fontSize: 15,
    fontWeight: 'bold',
  },
});