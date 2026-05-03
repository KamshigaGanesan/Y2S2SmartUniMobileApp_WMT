import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { apiUrl } from '@/constants/api';
import { useAuth } from '@/contexts/AuthContext';
import { Linking, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

// ENABLE ANIMATION (ANDROID)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type VisitStatus = 'Checked In' | 'Checked Out';
type PurposeType = 'Meeting' | 'Delivery' | 'Parent Visit' ;
type FilterTab = 'All' | 'Active' | 'Checked Out';

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

// Purpose Tag color mapper
const getPurposeTag = (purpose: string) => {
  switch (purpose) {
    case 'Meeting': return { icon: '🔵', bg: '#e0f2fe', text: '#0284c7' };
    case 'Delivery': return { icon: '🟡', bg: '#fef3c7', text: '#d97706' };
    case 'Parent Visit': return { icon: '🟢', bg: '#dcfce7', text: '#16a34a' };
    case 'Academic': return { icon: '🟣', bg: '#f3e8ff', text: '#9333ea' };
    default: return { icon: '⚫', bg: '#f1f5f9', text: '#475569' };
  }
};

export default function VisitorScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role?.toLowerCase?.() === 'admin';
  const [showReservation, setShowReservation] = useState(false);

  const [activeContact, setActiveContact] = useState<string | null>(null);
  
//add call, whatsapp, sms functions
const openCall = async (phone: string) => {
  try {
    const url = `tel:${phone}`;
    await Linking.openURL(url);
  } catch {
    Alert.alert('Error', 'Cannot open call');
  }
};

const openWhatsApp = async (phone: string, name: string) => {
  try {
    const clean = phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Hello ${name}, I am contacting you from Smart Campus.`);
    const url = `https://wa.me/${clean}?text=${text}`;
    await Linking.openURL(url);
  } catch {
    Alert.alert('Error', 'Cannot open WhatsApp');
  }
};

const openSMS = async (phone: string, name: string) => {
  try {
    const text = encodeURIComponent(`Hello ${name}, regarding your visit.`);
    const url =
      Platform.OS === 'ios'
        ? `sms:${phone}&body=${text}`
        : `sms:${phone}?body=${text}`;

    await Linking.openURL(url);
  } catch {
    Alert.alert('Error', 'Cannot open SMS');
  }
};

  // Step Wizard States
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [visitorName, setVisitorName] = useState('');
  const [visitorNic, setVisitorNic] = useState('');
  const [visitorContact, setVisitorContact] = useState('');
  const [visitorPurpose, setVisitorPurpose] = useState<PurposeType>('Meeting');
  const [visitorDestination, setVisitorDestination] = useState('');
  const [visitorDepartment, setVisitorDepartment] = useState('');

  // Data
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('All');
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Micro-interaction Feedback
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const showFeedback = (msg: string, type: 'success' | 'info' | 'error' = 'info') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setFeedback({ msg, type });
    if (type !== 'error') {
      setTimeout(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setFeedback(null);
      }, 4000);
    }
  };

  const fetchVisitors = async () => {
    try {
      const response = await fetch(apiUrl('/visitors'), {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : undefined,
      });
      const data = await response.json();

      const mapped: Visitor[] = Array.isArray(data)
        ? data.map((item: any) => ({
            id: item._id,
            name: item.fullName,
            nic: item.nic,
            contact: item.phoneNumber,
            purpose: item.purpose,
            destination: item.personToMeet,
            date: item.checkInDate,
            time: item.checkInTime,
            status: item.status,
          }))
        : [];
      setVisitors(mapped.reverse());
    } catch (error) {
      console.log('Error fetching visitors:', error);
      showFeedback('Failed to load visitor records.', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  // Smart Auto-Fill Mock Feature
  useEffect(() => {
    if (visitorNic.length >= 4 && visitorName === '') {
      const pastVisitor = visitors.find(v => v.nic.startsWith(visitorNic));
      if (pastVisitor) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setVisitorName(pastVisitor.name);
        setVisitorContact(pastVisitor.contact);
        showFeedback(`Auto-filled details for ${pastVisitor.name} (Returning Visitor)`, 'info');
      }
    }
  }, [visitorNic]);
const [resName, setResName] = useState('');
const [resDate, setResDate] = useState('');
const [resTime, setResTime] = useState('');

const createReservation = async () => {
  try {
    console.log('📤 Sending reservation...');

    // ✅ DEFINE res FIRST
    const response = await fetch(apiUrl('/reservations'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
  fullName: resName,
  nic: 'N/A',
  phoneNumber: '0770000000',
  purpose: 'Reservation',
  personToMeet: 'Office',
  visitDate: resDate,
  visitTime: resTime,
}),
    });

    // ✅ THEN use response
    const data = await response.json();

    console.log('✅ Response:', data);

    if (!response.ok) {
  console.log('❌ SERVER ERROR:', data);
  throw new Error(data.message || 'Failed');
}

    fetchReservations();

    setResName('');
    setResDate('');
    setResTime('');

    setShowReservation(false);

    alert('Reservation created 🎉');

  } catch (err) {
    console.log('❌ ERROR:', err);
    alert('Reservation failed ❌');
  }
};

const [reservations, setReservations] = useState([]);

useEffect(() => {
  fetchReservations();
}, []);

const fetchReservations = async () => {
  const res = await fetch(apiUrl('/reservations'));
  const data = await res.json();
  setReservations(data);
};

  const filteredHistory = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return visitors.filter((item) => {
      // Tab Filtering
      if (activeTab === 'Active' && item.status !== 'Checked In') return false;
      if (activeTab === 'Checked Out' && item.status !== 'Checked Out') return false;

      // Search Filtering
      return (
        q === '' ||
        item.name.toLowerCase().includes(q) ||
        item.nic.toLowerCase().includes(q) ||
        item.purpose.toLowerCase().includes(q)
      );
    });
  }, [visitors, searchText, activeTab]);

  const activeVisitors = visitors.filter(v => v.status === 'Checked In');
  const todayCount = visitors.filter(v => v.date === new Date().toISOString().split('T')[0]).length;
  const deliveriesCount = visitors.filter(v => v.purpose === 'Delivery' && v.date === new Date().toISOString().split('T')[0]).length;
  const reservedCount = reservations.length;

  const handleNextStep = () => {
    if (step === 1 && (!visitorName.trim() || !visitorNic.trim() || !visitorContact.trim())) {
      showFeedback('Please fill in basic info.', 'error');
      return;
    }
    if (step === 2 && !visitorDestination.trim()) {
      showFeedback('Please specify the destination.', 'error');
      return;
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep((prev) => (prev < 3 ? (prev + 1 as 1 | 2 | 3) : prev));
  };
  
  const handlePrevStep = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setStep((prev) => (prev > 1 ? (prev - 1 as 1 | 2 | 3) : prev));
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      const payload = {
  fullName: visitorName.trim(),
  nic: visitorNic.trim(),

  // ✅ FORCE correct phone format
phoneNumber: visitorContact.trim(),

  purpose: visitorPurpose,

  personToMeet: visitorDestination.trim(),
  department: visitorDepartment.trim(),

  // ✅ correct date
  checkInDate: new Date().toISOString().split('T')[0],

  // ✅ correct time format
  checkInTime: new Date().toLocaleTimeString([], {
  hour: '2-digit',
  minute: '2-digit',
}),

  status: 'Checked In',
};

      const response = await fetch(apiUrl('/visitors'), {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
  },
  body: JSON.stringify(payload),
});

const data = await response.json();

console.log("STATUS:", response.status);
console.log("SERVER FULL:", JSON.stringify(data, null, 2));

if (!response.ok) {
  throw new Error(data.message || 'Failed to register visitor');
}

// ✅ USE SAME DATA
const savedVisitor = data;

      const newVisitor: Visitor = {
        id: savedVisitor._id,
        name: savedVisitor.fullName,
        nic: savedVisitor.nic,
        contact: savedVisitor.phoneNumber,
        purpose: savedVisitor.purpose,
        destination: savedVisitor.personToMeet,
        date: savedVisitor.checkInDate,
        time: savedVisitor.checkInTime,
        status: savedVisitor.status,
      };

      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setVisitors((prev) => [newVisitor, ...prev]);
      showFeedback(`✔️ ${newVisitor.name} checked in successfully.`, 'success');

      // Reset
      setVisitorName(''); setVisitorNic(''); setVisitorContact('');
      setVisitorPurpose('Meeting'); setVisitorDestination('');
      setVisitorDepartment('');
      setStep(1);
    } catch (error) {
       showFeedback('Failed to register visitor.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCheckOut = async (id: string, name: string) => {
    if (!isAdmin) {
      showFeedback('Only administrators can mark visitor out.', 'info');
      return;
    }

    try {
      setUpdatingId(id);
      const response = await fetch(apiUrl(`/visitors/${id}/checkout`), {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to update visitor status');

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setVisitors((prev) =>
        prev.map((v) => (v.id === id ? { ...v, status: 'Checked Out' } : v))
      );
      showFeedback(`✔️ ${name} checked out successfully.`, 'success');
    } catch (error: any) {
      showFeedback('Failed to update visitor status.', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#f8fafc', '#e2e8f0']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0f172a" />
      </LinearGradient>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          
          {/* Dashboard Header */}
          <LinearGradient
            colors={['#2563eb', '#1e3a8a']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroGlowOne} />
            <View style={styles.heroGlowTwo} />

            <View style={styles.heroRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.heroTitle}>👤 Visitor Portal</Text>
                <Text style={styles.heroSubtitle}>
                  Secure entry management and live tracking.
                </Text>
              </View>
            </View>

            <TextInput
              style={styles.heroSearchInput}
              placeholder="Search history..."
              placeholderTextColor="#9ca3af"
              value={searchText}
              onChangeText={setSearchText}
            />
          </LinearGradient>

          {/* Analytics Mini Dashboard */}
          <View style={styles.analyticsRow}>
            <View style={[styles.statCard, { borderLeftColor: '#3b82f6', borderLeftWidth: 4 }]}>
               <Text style={styles.statLabel}>Today</Text>
               <Text style={styles.statValue}>{todayCount}</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#10b981', borderLeftWidth: 4 }]}>
               <Text style={styles.statLabel}>Inside</Text>
               <Text style={styles.statValue}>{activeVisitors.length}</Text>
            </View>
            <View style={[styles.statCard, { borderLeftColor: '#f59e0b', borderLeftWidth: 4 }]}>
               <Text style={styles.statLabel}>Deliveries</Text>
               <Text style={styles.statValue}>{deliveriesCount}</Text>
            </View>
            {/* 🔥 NEW RESERVED CARD */}
  <TouchableOpacity
    onPress={() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setShowReservation(prev => !prev);
    }}
    style={[
      styles.statCard,
      { borderLeftColor: '#8b5cf6', borderLeftWidth: 4 }
    ]}
  >
    <Text style={styles.statLabel}>Reserved</Text>
    <Text style={styles.statValue}>{reservedCount}</Text>
  </TouchableOpacity>

          </View>
          {showReservation && (
  <View style={{
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20
  }}>

    <Text style={{ fontWeight: '800', marginBottom: 10 }}>
      📅 Pre-book Visitor
    </Text>

    <TextInput
      placeholder="Visitor Name"
      value={resName}
      onChangeText={setResName}
      style={styles.input}
    />

    <TextInput
      placeholder="Visit Date"
      value={resDate}
      onChangeText={setResDate}
      style={styles.input}
    />

    <TextInput
      placeholder="Visit Time"
      value={resTime}
      onChangeText={setResTime}
      style={styles.input}
    />

    <TouchableOpacity
      onPress={createReservation}
      style={styles.primaryBtn}
    >
      <Text style={styles.primaryBtnText}>Reserve</Text>
    </TouchableOpacity>

  </View>
)}

          {/* Toast Feedback */}
          {feedback && (
            <View style={[styles.feedbackBox, feedback.type === 'error' && styles.feedbackError]}>
              <Text style={[styles.feedbackText, feedback.type === 'error' && styles.feedbackErrorText]}>
                {feedback.msg}
              </Text>
            </View>
          )}
          
          

          {/* Wizard Registration */}
          <View style={styles.wizardCard}>
            <Text style={styles.sectionTitle}>✨ Easy Check-in</Text>
            <View style={styles.stepIndicator}>
               <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
               <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
               <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
               <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
               <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]} />
            </View>
            <Text style={styles.stepTitle}>
               {step === 1 ? 'Step 1: Visitor details' : step === 2 ? 'Step 2: Purpose & Destination' : 'Step 3: Confirm'}
            </Text>

            {step === 1 && (
              <View style={styles.stepContent}>
                 <TextInput style={styles.input} placeholder="NIC / ID number" value={visitorNic} onChangeText={setVisitorNic} />
                 <TextInput style={styles.input} placeholder="Full Name" value={visitorName} onChangeText={setVisitorName} />
                 <TextInput style={styles.input} placeholder="Contact Number" value={visitorContact} onChangeText={setVisitorContact} keyboardType="phone-pad" />
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContent}>
                 <TextInput style={styles.input} placeholder="Destination (e.g. Dean Office)" value={visitorDestination} onChangeText={setVisitorDestination} />
                 <TextInput style={styles.input} placeholder="Department (e.g. Faculty of Computing)" value={visitorDepartment} onChangeText={setVisitorDepartment} />
                 <Text style={styles.subTitle}>Purpose of Visit:</Text>
                 <View style={styles.optionWrap}>
                   {['Meeting', 'Delivery', 'Parent Visit', 'Academic', 'Other'].map(purpose => (
                     <TouchableOpacity 
                       key={purpose} 
                       style={[styles.optionChip, visitorPurpose === purpose && styles.activeOptionChip]} 
                       onPress={() => setVisitorPurpose(purpose as PurposeType)}
                     >
                       <Text style={[styles.optionChipText, visitorPurpose === purpose && styles.activeOptionChipText]}>{purpose}</Text>
                     </TouchableOpacity>
                   ))}
                 </View>
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContent}>
                 <View style={styles.summaryBox}>
                    <Text style={styles.summaryText}><Text style={styles.bold}>Name:</Text> {visitorName}</Text>
                    <Text style={styles.summaryText}><Text style={styles.bold}>NIC:</Text> {visitorNic}</Text>
                    <Text style={styles.summaryText}><Text style={styles.bold}>To:</Text> {visitorDestination}</Text>
                    <Text style={styles.summaryText}><Text style={styles.bold}>Department:</Text> {visitorDepartment}</Text>
                    <Text style={styles.summaryText}><Text style={styles.bold}>Purpose:</Text> {visitorPurpose}</Text>
                 </View>
              </View>
            )}

            <View style={styles.wizardActions}>
               {step > 1 ? (
                 <TouchableOpacity style={styles.secondaryBtn} onPress={handlePrevStep}><Text style={styles.secondaryBtnText}>Back</Text></TouchableOpacity>
               ) : <View style={{ flex: 1 }}/>}
               
               {step < 3 ? (
                 <TouchableOpacity style={styles.primaryBtn} onPress={handleNextStep}><Text style={styles.primaryBtnText}>Next</Text></TouchableOpacity>
               ) : (
                 <TouchableOpacity style={[styles.primaryBtn, submitting && styles.disabledBtn]} onPress={handleSubmit} disabled={submitting}>
                   <Text style={styles.primaryBtnText}>{submitting ? 'Checking In...' : '✔️ Confirm Check-in'}</Text>
                 </TouchableOpacity>
               )}
            </View>
          </View>

          {/* Currently Inside (Live Highlight) */}
          {activeVisitors.length > 0 && (
            <View style={styles.liveSection}>
              <Text style={styles.liveTitle}>🟢 Currently Inside ({activeVisitors.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10, gap: 12 }}>
                {activeVisitors.map(v => {
                   const t = getPurposeTag(v.purpose);
                   return (
                    <View key={v.id} style={styles.liveCard}>
                       <View style={styles.liveCardHeader}>
                          <Text style={styles.liveName}>{v.name}</Text>
                          <Text style={styles.liveTime}>In: {v.time}</Text>
                       </View>
                       <Text style={styles.liveDest}>📍 {v.destination}</Text>
                       <View style={[styles.purposeTag, { backgroundColor: t.bg }]}>
                          <Text style={{ fontSize: 10 }}>{t.icon}</Text>
                          <Text style={[styles.purposeTagText, { color: t.text }]}>{v.purpose}</Text>
                       </View>
                       <TouchableOpacity 
                         style={[styles.quickOutBtn, updatingId === v.id && styles.disabledBtn]} 
                         onPress={() => handleCheckOut(v.id, v.name)}
                         disabled={updatingId === v.id || !isAdmin}
                       >
                         <Text style={styles.quickOutBtnText}>{updatingId === v.id ? '...' : isAdmin ? 'Check Out' : 'Admin Only'}</Text>
                       </TouchableOpacity>
                    </View>
                  )
                })}
              </ScrollView>
            </View>
          )}
       
          {/* History Section */}
          <View style={styles.historySection}>
            <View style={styles.filterTabs}>
               {(['All', 'Active', 'Checked Out'] as FilterTab[]).map(tab => (
                 <TouchableOpacity key={tab} onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setActiveTab(tab); }} style={[styles.filterTab, activeTab === tab && styles.filterTabActive]}>
                    <Text style={[styles.filterTabText, activeTab === tab && styles.filterTabTextActive]}>{tab}</Text>
                 </TouchableOpacity>
               ))}
            </View>

            {reservations.map((r) => (
              <View key={r._id} style={styles.historyCard}>
                <View style={styles.hCardHeader}>
                  <View style={styles.avatarHolder}><Text style={styles.avatarText}>{r.fullName.charAt(0).toUpperCase()}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.hCardName}>{r.fullName}</Text>
                    <Text style={styles.hCardMeta}>{r.visitDate} • {r.visitTime}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.markDoneBtn}
                    onPress={async () => {
                      await fetch(apiUrl(`/reservations/${r._id}/arrived`), { method: 'PATCH' });
                      fetchReservations();
                      showFeedback(`✔️ ${r.fullName} marked as arrived.`, 'success');
                    }}
                  >
                    <Text style={styles.markDoneBtnText}>✔ Mark Arrived</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {filteredHistory.length === 0 ? (
               <View style={styles.emptyHistory}>
                 <Text style={styles.emptyHistoryText}>No records found in this view.</Text>
               </View>
            ) : (
               filteredHistory.map(item => {
                 const pTag = getPurposeTag(item.purpose);
                 const isActive = item.status === 'Checked In';
                 return (
                   <View key={item.id} style={styles.historyCard}>
                      <View style={styles.hCardHeader}>
                         <View style={styles.avatarHolder}><Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text></View>
                         <View style={{ flex: 1 }}>
                           <Text style={styles.hCardName}>{item.name}</Text>
                           <Text style={styles.hCardMeta}>{item.date} • {item.time}</Text>
                         </View>
                         <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusOut]}>
                           <Text style={[styles.statusBadgeText, isActive ? styles.statusActiveText : styles.statusOutText]}>{item.status}</Text>
                         </View>
                      </View>
                      
                      <View style={styles.hCardBody}>
                         <Text style={styles.bodyText}><Text style={styles.bold}>NIC:</Text> {item.nic}</Text>
                         <Text style={styles.bodyText}><Text style={styles.bold}>To:</Text> {item.destination}</Text>
                      </View>

                      <View style={styles.hCardFooter}>
                        <View style={{ marginTop: 8 }}>

  {/* CONTACT BUTTON */}
  <TouchableOpacity
    onPress={() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActiveContact(activeContact === item.id ? null : item.id);
    }}
    style={{
      backgroundColor: '#0f172a',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 10,
      alignSelf: 'flex-start'
    }}
  >
    <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
      📲 Contact Visitor
    </Text>
  </TouchableOpacity>

  {/* EXPAND CONTACT OPTIONS */}
  {activeContact === item.id && (
    <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>

      {/* CALL */}
      <TouchableOpacity
        onPress={() => openCall(item.contact)}
        style={{
          backgroundColor: '#22c55e',
          padding: 10,
          borderRadius: 12
        }}
      >
        <Text style={{ color: '#fff' }}>📞</Text>
      </TouchableOpacity>

      {/* WHATSAPP */}
      <TouchableOpacity
        onPress={() => openWhatsApp(item.contact, item.name)}
        style={{
          backgroundColor: '#25D366',
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6
        }}
      >
        <FontAwesome name="whatsapp" size={14} color="#fff" />
        <Text style={{ color: '#fff', fontWeight: '600' }}>
          WhatsApp
        </Text>
      </TouchableOpacity>

      {/* SMS */}
      <TouchableOpacity
        onPress={() => openSMS(item.contact, item.name)}
        style={{
          backgroundColor: '#3b82f6',
          padding: 10,
          borderRadius: 12
        }}
      >
        <Text style={{ color: '#fff' }}>📩</Text>
      </TouchableOpacity>

    </View>
  )}

</View>
                         <View style={[styles.purposeTag, { backgroundColor: pTag.bg }]}>
                           <Text style={{ fontSize: 10 }}>{pTag.icon}</Text>
                           <Text style={[styles.purposeTagText, { color: pTag.text }]}>{item.purpose}</Text>
                         </View>

                         {isActive && isAdmin && (
                           <TouchableOpacity style={styles.markDoneBtn} onPress={() => handleCheckOut(item.id, item.name)}>
                              <Text style={styles.markDoneBtnText}>✔️ Mark Out</Text>
                           </TouchableOpacity>
                         )}
                      </View>
                   </View>
                 )
               })
            )}
          </View>
          
        </ScrollView>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  header: { marginBottom: 16, marginTop: 10 },
  
  heroCard: {
    borderRadius: 28,
    padding: 18,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  heroGlowOne: {
    position: 'absolute', width: 140, height: 140, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)', top: -30, right: -20,
  },
  heroGlowTwo: {
    position: 'absolute', width: 170, height: 170, borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)', bottom: -70, left: -40,
  },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  heroTitle: { fontSize: 30, fontWeight: '800', color: '#ffffff', marginBottom: 4, letterSpacing: -0.8 },
  heroSubtitle: { fontSize: 14, color: '#dbeafe', lineHeight: 20 },
  heroSearchInput: {
    backgroundColor: '#ffffff', borderRadius: 16,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: '#111827',
  },

  analyticsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 20, flexWrap: 'wrap' },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: {width:0, height:2} },
  statLabel: { fontSize: 12, color: '#64748b', fontWeight: '700', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '800', color: '#0f172a' },

  feedbackBox: { backgroundColor: '#e0f2fe', padding: 12, borderRadius: 10, marginBottom: 16, borderWidth: 1, borderColor: '#bae6fd' },
  feedbackText: { color: '#0284c7', fontSize: 13, fontWeight: '700' },
  feedbackError: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  feedbackErrorText: { color: '#b91c1c' },

  wizardCard: { backgroundColor: '#fff', borderRadius: 20, padding: 18, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 16 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16, paddingHorizontal: 20 },
  stepDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e2e8f0' },
  stepDotActive: { backgroundColor: '#3b82f6', transform: [{ scale: 1.2 }] },
  stepLine: { flex: 1, height: 2, backgroundColor: '#e2e8f0', marginHorizontal: 4 },
  stepLineActive: { backgroundColor: '#3b82f6' },
  stepTitle: { textAlign: 'center', fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 16 },
  stepContent: { minHeight: 140 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#0f172a', marginBottom: 10 },
  
  subTitle: { fontSize: 14, fontWeight: '700', color: '#334155', marginBottom: 8, marginTop: 4 },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { backgroundColor: '#f1f5f9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: 'transparent' },
  activeOptionChip: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  optionChipText: { color: '#475569', fontWeight: '700', fontSize: 13 },
  activeOptionChipText: { color: '#2563eb' },
  
  summaryBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  summaryText: { fontSize: 14, color: '#334155', marginBottom: 6 },
  bold: { fontWeight: '700', color: '#0f172a' },
  
  wizardActions: { flexDirection: 'row', gap: 12, marginTop: 10 },
  primaryBtn: { flex: 1, backgroundColor: '#0f172a', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  secondaryBtn: { flex: 1, backgroundColor: '#f1f5f9', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  secondaryBtnText: { color: '#475569', fontSize: 14, fontWeight: '700' },
  disabledBtn: { opacity: 0.6 },

  liveSection: { marginBottom: 20 },
  liveTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', marginBottom: 4 },
  liveCard: { backgroundColor: '#fff', width: 220, borderRadius: 16, padding: 14, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: {width:0,height:2}, borderWidth: 1, borderColor: '#f1f5f9' },
  liveCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  liveName: { fontSize: 15, fontWeight: '800', color: '#0f172a', flex: 1 },
  liveTime: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  liveDest: { fontSize: 12, color: '#475569', marginBottom: 10 },
  quickOutBtn: { marginTop: 10, backgroundColor: '#f8fafc', paddingVertical: 8, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  quickOutBtnText: { color: '#0f172a', fontSize: 12, fontWeight: '700' },

  historySection: { marginTop: 10 },
  filterTabs: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 12, padding: 4, marginBottom: 16 },
  filterTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  filterTabActive: { backgroundColor: '#fff', elevation: 1 },
  filterTabText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  filterTabTextActive: { color: '#0f172a' },
  emptyHistory: { padding: 40, alignItems: 'center' },
  emptyHistoryText: { color: '#94a3b8', fontStyle: 'italic', fontSize: 14 },
  
  historyCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, borderWidth: 1, borderColor: '#f1f5f9' },
  hCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  avatarHolder: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: '800', color: '#475569' },
  hCardName: { fontSize: 15, fontWeight: '800', color: '#0f172a' },
  hCardMeta: { fontSize: 12, color: '#64748b', marginTop: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusActive: { backgroundColor: '#dcfce7' },
  statusOut: { backgroundColor: '#f1f5f9' },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  statusActiveText: { color: '#16a34a' },
  statusOutText: { color: '#64748b' },
  
  hCardBody: { paddingLeft: 46, marginBottom: 12 },
  bodyText: { fontSize: 13, color: '#475569', marginBottom: 2 },
  hCardFooter: { paddingLeft: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  
  purposeTag: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  purposeTagText: { fontSize: 11, fontWeight: '800' },
  
  markDoneBtn: { backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0'},
  markDoneBtnText: { fontSize: 11, fontWeight: '700', color: '#0f172a' },
});
