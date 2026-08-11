import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import mockCourses from '../data/mockCourses';
import { getCourseImage } from '../data/courseImages';
import type { Course } from '../types/course';
import type { RootStackParamList } from '../navigation/types';
import { getUserCourses } from '../utils/courseStorage';
import { fetchCourses } from '../api/backendApi';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { calculateDistanceMeters } from '../utils/distance';
import { getTravelProfile } from '../utils/profileStorage';
import {
  formatAverageRating,
  formatCompletionRate,
  isVerifiedCourse,
  MIN_VERIFIED_PERFORMERS,
} from '../utils/courseMetrics';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// ─── Accent map (shared) ──────────────────────────────────────────────────────

const ACCENT: Record<string, string> = {
  야경: '#0f766e',
  카페: '#166534',
  예술: '#047857',
  로컬: '#15803d',
  시장: '#0f766e',
  자연: '#065f46',
  음식: '#b45309',
  역사: '#1d4ed8',
  감성: '#166534',
  먹거리: '#b45309',
  자연2: '#065f46',
};

function accentFor(theme: string) {
  return ACCENT[theme] ?? '#0f8b6d';
}

// ─── PhotoHeader (shared by course cards) ─────────────────────────────────────

function PhotoHeader({
  course,
  badges,
}: {
  course: Course;
  badges: React.ReactNode;
}) {
  const imageUrl = getCourseImage(course);
  const accent = accentFor(course.theme);

  const inner = (
    <View style={phStyles.overlay}>
      <View style={phStyles.badgeRow}>{badges}</View>
      <View>
        <Text style={phStyles.title} numberOfLines={1}>{course.title}</Text>
        <Text style={phStyles.meta}>
          {course.area} · {course.distance} · {course.spotCount}곳
        </Text>
      </View>
    </View>
  );

  if (!imageUrl) {
    return <View style={[phStyles.container, { backgroundColor: accent }]}>{inner}</View>;
  }

  return (
    <ImageBackground source={{ uri: imageUrl }} style={phStyles.container} resizeMode="cover">
      {inner}
    </ImageBackground>
  );
}

const phStyles = StyleSheet.create({
  container: { height: 148, backgroundColor: '#1f2937' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.34)',
    padding: 14,
    justifyContent: 'space-between',
  },
  badgeRow: { flexDirection: 'row', gap: 6 },
  title: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 2 },
  meta: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '500' },
});

function HeaderBadge({ label, strong }: { label: string; strong?: boolean }) {
  return (
    <View style={[hbStyles.badge, strong && hbStyles.badgeStrong]}>
      <Text style={hbStyles.text}>{label}</Text>
    </View>
  );
}

const hbStyles = StyleSheet.create({
  badge: {
    backgroundColor: 'rgba(15,23,42,0.45)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeStrong: { backgroundColor: '#0f8b6d' },
  text: { color: '#ffffff', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
});

// ─── InlineCourseCard (ranked) ────────────────────────────────────────────────

function InlineCourseCard({
  course,
  rank,
  verified,
  onPress,
}: {
  course: Course;
  rank: number;
  verified: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.82}>
      <PhotoHeader
        course={course}
        badges={
          <>
            <HeaderBadge label={verified ? `TOP ${rank}` : '신규'} strong={verified} />
            <HeaderBadge label={course.theme} />
          </>
        }
      />

      <View style={cardStyles.body}>
        {verified ? (
          <View style={cardStyles.metrics}>
            <View style={cardStyles.metric}>
              <Text style={cardStyles.metricValue}>{formatCompletionRate(course)}</Text>
              <Text style={cardStyles.metricLabel}>완주율</Text>
            </View>
            <View style={cardStyles.metricSep} />
            <View style={cardStyles.metric}>
              <Text style={cardStyles.metricValue}>{formatAverageRating(course)}</Text>
              <Text style={cardStyles.metricLabel}>만족도</Text>
            </View>
            <View style={cardStyles.metricSep} />
            <View style={cardStyles.metric}>
              <Text style={cardStyles.metricValue}>{course.performers}명</Text>
              <Text style={cardStyles.metricLabel}>수행자</Text>
            </View>
          </View>
        ) : (
          <Text style={cardStyles.freshNote}>
            아직 아무도 걷지 않은 코스예요 · 첫 수행자가 되어보세요
          </Text>
        )}
        <Text style={cardStyles.tapHint}>자세히 보기 →</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── UserCourseCard ───────────────────────────────────────────────────────────

function UserCourseCard({ course, onPress }: { course: Course; onPress: () => void }) {
  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.82}>
      <PhotoHeader
        course={course}
        badges={
          <>
            <HeaderBadge label="MY" strong />
            <HeaderBadge label={course.theme} />
          </>
        }
      />

      <View style={cardStyles.body}>
        <Text style={cardStyles.freshNote}>
          {course.transport ?? '도보'} 이동 · 내가 만든 코스
        </Text>
        <Text style={cardStyles.tapHint}>자세히 보기 →</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── ScoreInfoSheet (산정식 안내) ─────────────────────────────────────────────

function ScoreInfoSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={sheetStyles.backdrop} onPress={onClose}>
        <Pressable style={sheetStyles.sheet} onPress={() => {}}>
          <View style={sheetStyles.grabber} />
          <Text style={sheetStyles.title}>랭킹은 이렇게 만들어져요</Text>
          <Text style={sheetStyles.formula}>
            TRIPICK Score = 완주율 × 50% + 만족도 × 30% + 수행자 수 × 20%
          </Text>
          <Text style={sheetStyles.desc}>
            광고나 리뷰 조작 없이, GPS로 검증된 실제 수행 데이터만 사용해요.{'\n'}
            수행자 {MIN_VERIFIED_PERFORMERS}명 이상 모인 코스부터 검증 랭킹에 올라갑니다.
          </Text>
          <TouchableOpacity style={sheetStyles.closeBtn} onPress={onClose} activeOpacity={0.85}>
            <Text style={sheetStyles.closeBtnText}>확인</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.45)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
  },
  grabber: {
    alignSelf: 'center',
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#dce6ec', marginBottom: 18,
  },
  title: { fontSize: 18, fontWeight: '800', color: '#13315c', marginBottom: 12 },
  formula: {
    fontSize: 13, fontWeight: '700', color: '#0f8b6d',
    backgroundColor: '#e8f5f1', borderRadius: 10, padding: 12, marginBottom: 12,
  },
  desc: { fontSize: 13, color: '#5c6b7a', lineHeight: 20, marginBottom: 20 },
  closeBtn: {
    backgroundColor: '#13315c', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  closeBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const [allCourses, setAllCourses] = useState<Course[]>(
    () => (Array.isArray(mockCourses) ? mockCourses : []),
  );
  const verifiedCourses = allCourses.filter(isVerifiedCourse);
  const isRankingActive = verifiedCourses.length > 0;
  const displayCourses = (isRankingActive ? verifiedCourses : allCourses).slice(0, 5);
  const totalPerformers = allCourses.reduce((s, c) => s + c.performers, 0);

  const [userCourses, setUserCourses] = useState<Course[]>([]);
  const [nearbyPrompt, setNearbyPrompt] = useState<{ placeName: string; courses: Course[] } | null>(null);
  const [scoreInfoVisible, setScoreInfoVisible] = useState(false);
  const notifiedPlaceRef = useRef<string | null>(null);

  // Reload user courses every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getUserCourses(), fetchCourses()]).then(([courses, serverCourses]) => {
        if (!active) return;
        setUserCourses(courses);
        if (serverCourses && serverCourses.length > 0) setAllCourses(serverCourses);
      });
      return () => { active = false; };
    }, []),
  );

  useEffect(() => {
    if (allCourses.length === 0) return;
    let active = true;
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted' || !active) return;
      const profile = await getTravelProfile();
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Balanced, distanceInterval: 50, timeInterval: 15000 },
        async (location) => {
          if (!active) return;
          const lat = location.coords.latitude;
          const lng = location.coords.longitude;
          const nearby = allCourses
            .map((course) => {
              const distances = course.spots
                .filter((spot) => spot.lat != null && spot.lng != null)
                .map((spot) => ({
                  spot,
                  distance: calculateDistanceMeters(lat, lng, spot.lat!, spot.lng!) ?? Number.POSITIVE_INFINITY,
                }));
              const closest = distances.sort((a, b) => a.distance - b.distance)[0];
              return closest ? { ...course, distanceMeters: closest.distance, closestSpot: closest.spot } : null;
            })
            .filter((course): course is Course & { distanceMeters: number; closestSpot: Course['spots'][number] } => Boolean(course && course.distanceMeters <= 1500))
            .sort((a, b) => {
              const aPreference = a.theme === profile.travelStyle ? 1 : 0;
              const bPreference = b.theme === profile.travelStyle ? 1 : 0;
              return bPreference - aPreference || a.distanceMeters - b.distanceMeters;
            })
            .slice(0, 5);

          const nearest = nearby[0];
          if (!nearest || nearest.distanceMeters > 350 || notifiedPlaceRef.current === nearest.closestSpot.name) return;
          notifiedPlaceRef.current = nearest.closestSpot.name;
          const prompt = { placeName: nearest.closestSpot.name, courses: nearby };
          setNearbyPrompt(prompt);

          const notificationPermission = await Notifications.requestPermissionsAsync();
          if (notificationPermission.status === 'granted') {
            await Notifications.scheduleNotificationAsync({
              content: {
                title: `현재 ${nearest.closestSpot.name}에 있네요!`,
                body: `${profile.nickname}님에게 추천하고 싶은 코스 ${nearby.length}개가 있어요.`,
                data: { placeName: nearest.closestSpot.name },
              },
              trigger: null,
            });
          }
        },
      );
    })();

    return () => { active = false; subscription?.remove(); };
  }, [allCourses]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 히어로 ── */}
        <View style={styles.hero}>
          <View style={styles.heroActionRow}>
            <View />
            <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
              <Text style={styles.profileButtonText}>프로필</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.brand}>TRIPICK</Text>
          <Text style={styles.description}>
            직접 걸어서 검증하는 전주 여행 코스
          </Text>
          {totalPerformers > 0 && (
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{allCourses.length}</Text>
                <Text style={styles.heroStatLabel}>등록 코스</Text>
              </View>
              <View style={styles.heroStatDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{totalPerformers}</Text>
                <Text style={styles.heroStatLabel}>총 수행자</Text>
              </View>
            </View>
          )}
        </View>

        {nearbyPrompt && (
          <TouchableOpacity
            style={styles.nearbyBanner}
            onPress={() => navigation.navigate('NearbyCourses', nearbyPrompt)}
            activeOpacity={0.85}
          >
            <View style={styles.nearbyPulse} />
            <View style={styles.nearbyBody}>
              <Text style={styles.nearbyTitle}>현재 {nearbyPrompt.placeName}에 있네요!</Text>
              <Text style={styles.nearbyText}>취향에 맞는 주변 코스 {nearbyPrompt.courses.length}개 보기</Text>
            </View>
            <Text style={styles.nearbyArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* ── 스마트 코스 만들기 배너 ── */}
        <TouchableOpacity
          style={styles.smartBanner}
          onPress={() => navigation.navigate('SmartCourse')}
          activeOpacity={0.88}
        >
          <View style={styles.smartBannerLeft}>
            <Text style={styles.smartBannerTitle}>스마트 코스 만들기</Text>
            <Text style={styles.smartBannerDesc}>
              스타일 · 시간 · 이동 방식만 고르면 나만의 전주 코스 완성
            </Text>
          </View>
          <Text style={styles.smartBannerIcon}>✦</Text>
        </TouchableOpacity>

        {/* ── 내가 만든 코스 ── */}
        {userCourses.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>내가 만든 코스</Text>
              <View style={[styles.sectionBadge, styles.sectionBadgeMy]}>
                <Text style={[styles.sectionBadgeText, styles.sectionBadgeMyText]}>
                  {userCourses.length}개
                </Text>
              </View>
            </View>

            {userCourses.map((course) => (
              <UserCourseCard
                key={course.id}
                course={course}
                onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
              />
            ))}
          </>
        )}

        {/* ── 랭킹 섹션 ── */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>
              {isRankingActive ? '검증된 코스 TOP 5' : '새로 열린 코스'}
            </Text>
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setScoreInfoVisible(true)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.infoButtonText}>?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>
              {isRankingActive ? `${displayCourses.length}개 코스` : '첫 수행자 모집 중'}
            </Text>
          </View>
        </View>

        {displayCourses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>아직 등록된 코스가 없어요</Text>
          </View>
        ) : (
          displayCourses.map((course, index) => (
            <InlineCourseCard
              key={course.id}
              course={course}
              rank={index + 1}
              verified={isRankingActive}
              onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
            />
          ))
        )}

        <Text style={styles.bottomNote}>
          더 많은 코스 보기 및 직접 수행 기록은 준비 중입니다.
        </Text>
      </ScrollView>

      <ScoreInfoSheet visible={scoreInfoVisible} onClose={() => setScoreInfoVisible(false)} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16, marginBottom: 14, overflow: 'hidden',
    shadowColor: '#13315c', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  body: { paddingHorizontal: 16, paddingVertical: 12 },
  metrics: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { fontSize: 14, fontWeight: '700', color: '#13315c', marginBottom: 2 },
  metricLabel: { fontSize: 10, color: '#8a9db0' },
  metricSep: { width: 1, height: 28, backgroundColor: '#dce6ec' },
  freshNote: { fontSize: 12, color: '#5c6b7a', marginBottom: 6 },
  tapHint: { fontSize: 11, color: '#0f8b6d', fontWeight: '600', textAlign: 'right' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f3f6f8' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  hero: {
    backgroundColor: '#13315c', borderRadius: 20, padding: 24, marginBottom: 16,
  },
  heroActionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  profileButton: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  profileButtonText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  brand: { color: '#ffffff', fontSize: 34, fontWeight: '800', letterSpacing: -1, marginBottom: 6 },
  description: { color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 20 },
  heroStats: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, marginTop: 18,
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: '#4fb286', fontSize: 20, fontWeight: '800', marginBottom: 2 },
  heroStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 8 },

  nearbyBanner: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#9ed8ca', flexDirection: 'row', alignItems: 'center', gap: 10 },
  nearbyPulse: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 3, borderColor: '#d1fae5' },
  nearbyBody: { flex: 1 },
  nearbyTitle: { color: '#0b5f4b', fontSize: 13, fontWeight: '800' },
  nearbyText: { color: '#52746c', fontSize: 11, marginTop: 2 },
  nearbyArrow: { color: '#0f8b6d', fontSize: 20, fontWeight: '700' },

  smartBanner: {
    backgroundColor: '#0f8b6d',
    borderRadius: 16, padding: 18, marginBottom: 20,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#0f8b6d', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 12, elevation: 6,
  },
  smartBannerLeft: { flex: 1 },
  smartBannerTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 6 },
  smartBannerDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 12, lineHeight: 18 },
  smartBannerIcon: { color: 'rgba(255,255,255,0.5)', fontSize: 40, marginLeft: 8 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#13315c' },
  infoButton: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: '#8a9db0',
    alignItems: 'center', justifyContent: 'center',
  },
  infoButtonText: { fontSize: 11, fontWeight: '700', color: '#8a9db0', lineHeight: 13 },
  sectionBadge: { backgroundColor: '#e8f5f1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  sectionBadgeText: { fontSize: 11, color: '#0f8b6d', fontWeight: '600' },
  sectionBadgeMy: { backgroundColor: '#eff6ff' },
  sectionBadgeMyText: { color: '#1d4ed8' },

  emptyBox: { backgroundColor: '#fff4e6', borderRadius: 10, padding: 20, alignItems: 'center', marginBottom: 16 },
  emptyText: { fontSize: 14, fontWeight: '600', color: '#c2410c' },

  bottomNote: { textAlign: 'center', color: '#8a9db0', fontSize: 12, marginTop: 8 },
});
