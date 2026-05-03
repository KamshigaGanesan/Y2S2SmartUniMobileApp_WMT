import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/contexts/ThemeContext';

type GlassCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
  textColor: string;
  subTextColor: string;
  iconBg: string;
  isDark: boolean;
};

function GlassCard({
  title,
  subtitle,
  icon,
  onPress,
  textColor,
  subTextColor,
  iconBg,
  isDark,
}: GlassCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 35,
      bounciness: 5,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
      bounciness: 5,
    }).start();
  };

  return (
    <Animated.View style={[styles.gridItem, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <BlurView
          intensity={isDark ? 35 : 55}
          tint={isDark ? 'dark' : 'light'}
          style={[
            styles.actionCard,
            {
              backgroundColor: isDark
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(255,255,255,0.60)',
              borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)',
            },
          ]}
        >
          <View style={[styles.actionIconWrap, { backgroundColor: iconBg }]}>
            <Text style={styles.actionIcon}>{icon}</Text>
          </View>

          <View>
            <Text style={[styles.actionTitle, { color: textColor }]}>{title}</Text>
            <Text style={[styles.actionSub, { color: subTextColor }]}>{subtitle}</Text>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useAppTheme();
  const isAdmin = user?.role?.toLowerCase?.() === 'admin';

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'SC';

  const heroFloat = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(heroFloat, {
          toValue: -6,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(heroFloat, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [heroFloat]);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const softIconBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.55)';

  return (
    <LinearGradient
      colors={
        isDark
          ? ['#020617', '#0f172a', '#111827']
          : ['#eef2ff', '#e0e7ff', '#f8fafc']
      }
      style={styles.flex}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Animated.View style={{ transform: [{ translateY: heroFloat }] }}>
          <LinearGradient
            colors={
              isDark
                ? ['rgba(30,41,59,0.96)', 'rgba(34, 49, 100, 0.86)']
                : ['rgba(22, 70, 174, 0.96)', 'rgba(30,64,175,0.88)']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.glowOne} />
            <View style={styles.glowTwo} />

            <View style={styles.heroTopRow}>
              <BlurView
                intensity={45}
                tint={isDark ? 'dark' : 'light'}
                style={styles.accountPill}
              >
                <View style={styles.liveDot} />
                <Text style={styles.accountPillText}>
                  {isAdmin ? 'Admin account' : 'Student account'}
                </Text>
              </BlurView>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={toggleTheme}
              >
                <BlurView
                  intensity={45}
                  tint={isDark ? 'dark' : 'light'}
                  style={styles.themeButton}
                >
                  <Text style={styles.themeButtonText}>{isDark ? '☀️' : '🌙'}</Text>
                </BlurView>
              </TouchableOpacity>
            </View>

            <View style={styles.heroCenter}>
              <View style={styles.avatarGlowOuter}>
                <View style={styles.avatarGlowMid}>
                  <View style={styles.avatar}>
                    <Text style={[styles.avatarText, { color: colors.primary }]}>
                      {initials}
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.name}>{user?.name || 'Smart Campus User'}</Text>
              <Text style={styles.email}>{user?.email || 'No email available'}</Text>

              <View style={styles.heroChips}>
                <BlurView
                  intensity={40}
                  tint={isDark ? 'dark' : 'light'}
                  style={styles.heroChip}
                >
                  <Text style={styles.heroChipText}>
                    {isAdmin ? '👑 Admin' : '🎓 Student'}
                  </Text>
                </BlurView>

                <BlurView
                  intensity={40}
                  tint={isDark ? 'dark' : 'light'}
                  style={styles.heroChip}
                >
                  <Text style={styles.heroChipText}>
                    {isDark ? 'Dark Mode' : 'Light Mode'}
                  </Text>
                </BlurView>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personalization</Text>

          <TouchableOpacity activeOpacity={0.94} onPress={toggleTheme}>
            <BlurView
              intensity={isDark ? 35 : 55}
              tint={isDark ? 'dark' : 'light'}
              style={[
                styles.preferenceCard,
                {
                  backgroundColor: isDark
                    ? 'rgba(255,255,255,0.06)'
                    : 'rgba(134, 26, 26, 0.6)',
                  borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.75)',
                },
              ]}
            >
              <View style={styles.preferenceLeft}>
                <View style={[styles.preferenceIconWrap, { backgroundColor: softIconBg }]}>
                  <Text style={styles.preferenceIcon}>🎨</Text>
                </View>

                <View>
                  <Text style={[styles.preferenceTitle, { color: colors.text }]}>Theme</Text>
                  <Text style={[styles.preferenceSub, { color: colors.subText }]}>
                    Switch your app appearance
                  </Text>
                </View>
              </View>

              <View style={[styles.modeBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.modeBadgeText}>{isDark ? 'Dark' : 'Light'}</Text>
              </View>
            </BlurView>
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, styles.sectionGap, { color: colors.text }]}>
            Explore
          </Text>

          <View style={styles.grid}>
            <GlassCard
              title="Library"
              subtitle="Resources"
              icon="📚"
              onPress={() => router.push('/(tabs)/library')}
              textColor={colors.text}
              subTextColor={colors.subText}
              iconBg={softIconBg}
              isDark={isDark}
            />

            <GlassCard
              title="Directory"
              subtitle="People & offices"
              icon="🏫"
              onPress={() => router.push('/campus-directory')}
              textColor={colors.text}
              subTextColor={colors.subText}
              iconBg={softIconBg}
              isDark={isDark}
            />

            <GlassCard
              title="Notices"
              subtitle="Campus updates"
              icon="🔔"
              onPress={() => router.push('/(tabs)/announcements')}
              textColor={colors.text}
              subTextColor={colors.subText}
              iconBg={softIconBg}
              isDark={isDark}
            />

            <GlassCard
              title="Lost & Found"
              subtitle="Track items"
              icon="📍"
              onPress={() => router.push('/lostfound')}
              textColor={colors.text}
              subTextColor={colors.subText}
              iconBg={softIconBg}
              isDark={isDark}
            />
          </View>

          {isAdmin && (
            <>
              <Text style={[styles.sectionTitle, styles.sectionGap, { color: colors.text }]}>
                Admin Space
              </Text>

              <TouchableOpacity
                activeOpacity={0.94}
                onPress={() => router.push('/admin')}
              >
                <LinearGradient
                  colors={isDark ? ['#1d4ed8', '#1e3a8a'] : ['#2563eb', '#1e40af']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.adminCard}
                >
                  <View style={styles.adminTopRow}>
                    <BlurView intensity={35} tint="dark" style={styles.adminPill}>
                      <Text style={styles.adminPillText}>Control Center</Text>
                    </BlurView>
                    <Text style={styles.adminArrow}>↗</Text>
                  </View>

                  <Text style={styles.adminTitle}>Open Admin Panel</Text>
                  <Text style={styles.adminSubtitle}>
                    Manage announcements, resources, visitors, and campus modules
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.94}
                onPress={() => router.push('/admin')}
                style={styles.adminQuickButtonWrap}
              >
                <BlurView
                  intensity={isDark ? 35 : 55}
                  tint={isDark ? 'dark' : 'light'}
                  style={[
                    styles.adminQuickButton,
                    {
                      backgroundColor: isDark
                        ? 'rgba(37,99,235,0.22)'
                        : 'rgba(37,99,235,0.12)',
                      borderColor: isDark
                        ? 'rgba(96,165,250,0.35)'
                        : 'rgba(37,99,235,0.18)',
                    },
                  ]}
                >
                  <Text style={styles.adminQuickButtonText}>Go to Admin Panel</Text>
                </BlurView>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            activeOpacity={0.94}
            onPress={handleLogout}
          >
            <LinearGradient
              colors={['#2a46e6', '#291279']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoutButton}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingBottom: 34,
  },

  hero: {
    marginHorizontal: 12,
    marginTop: 12,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 30,
    borderRadius: 34,
    overflow: 'hidden',
    shadowColor: '#1d4ed8',
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  glowOne: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    top: -20,
    right: -30,
  },
  glowTwo: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -100,
    left: -50,
  },

  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#4ade80',
    marginRight: 8,
  },
  accountPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  themeButton: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  themeButtonText: {
    fontSize: 18,
  },

  heroCenter: {
    alignItems: 'center',
    marginTop: 26,
  },
  avatarGlowOuter: {
    width: 132,
    height: 132,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGlowMid: {
    width: 108,
    height: 108,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 999,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '800',
  },
  name: {
    marginTop: 18,
    fontSize: 31,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.8,
  },
  email: {
    marginTop: 8,
    fontSize: 15,
    color: '#dbeafe',
    textAlign: 'center',
  },
  heroChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    marginTop: 18,
  },
  heroChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    overflow: 'hidden',
  },
  heroChipText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 14,
    letterSpacing: -0.5,
  },
  sectionGap: {
    marginTop: 28,
  },

  preferenceCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceIconWrap: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  preferenceIcon: {
    fontSize: 24,
  },
  preferenceTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  preferenceSub: {
    fontSize: 13,
    marginTop: 4,
  },
  modeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginLeft: 10,
  },
  modeBadgeText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  gridItem: {
    width: '48.2%',
  },
  actionCard: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    minHeight: 150,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  actionIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  actionSub: {
    fontSize: 13,
    lineHeight: 18,
  },

  adminCard: {
    borderRadius: 28,
    padding: 18,
    minHeight: 158,
    justifyContent: 'space-between',
    overflow: 'hidden',
    shadowColor: '#1d4ed8',
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  adminTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  adminPillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  adminArrow: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
  },
  adminTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    marginTop: 18,
    letterSpacing: -0.6,
  },
  adminSubtitle: {
    color: '#dbeafe',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    maxWidth: '92%',
  },
  adminQuickButtonWrap: {
    marginTop: 12,
  },
  adminQuickButton: {
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 15,
    alignItems: 'center',
    overflow: 'hidden',
  },
  adminQuickButtonText: {
    color: '#2563eb',
    fontSize: 15,
    fontWeight: '800',
  },

  logoutButton: {
    marginTop: 30,
    borderRadius: 22,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#1305ac',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
