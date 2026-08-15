import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Alert,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import mockCourses from '../data/mockCourses';
import { getCourseImage } from '../data/courseImages';
import type { Course } from '../types/course';
import type { RootStackParamList } from '../navigation/types';
import { getUserCourses, deleteUserCourse } from '../utils/courseStorage';
import { fetchCourses, fetchJeonjuFestivals } from '../api/backendApi';
import type { JeonjuFestival } from '../api/backendApi';
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

// ─── PhotoCard (full-bleed image card) ────────────────────────────────────────

function PhotoCard({
  course,
  badges,
  footer,
  onPress,
  onLongPress,
}: {
  course: Course;
  badges: React.ReactNode;
  footer?: React.ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const imageUrl = getCourseImage(course);
  const accent = accentFor(course.theme);

  const overlay = (
    <LinearGradient
      colors={['rgba(15,23,42,0.30)', 'rgba(15,23,42,0.02)', 'rgba(15,23,42,0.72)']}
      locations={[0, 0.42, 1]}
      style={pcStyles.overlay}
    >
      <View style={pcStyles.badgeRow}>{badges}</View>
      <View>
        <Text style={pcStyles.title} numberOfLines={1}>{course.title}</Text>
        <Text style={pcStyles.meta}>
          {course.area} · {course.distance} · {course.spotCount}곳
        </Text>
      </View>
    </LinearGradient>
  );

  return (
    <TouchableOpacity style={pcStyles.card} onPress={onPress} onLongPress={onLongPress} activeOpacity={0.88}>
      {imageUrl ? (
        <ImageBackground source={{ uri: imageUrl }} style={pcStyles.image} resizeMode="cover">
          {overlay}
        </ImageBackground>
      ) : (
        <View style={[pcStyles.image, { backgroundColor: accent }]}>{overlay}</View>
      )}
      {footer}
    </TouchableOpacity>
  );
}

const pcStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 4,
  },
  image: { height: 208, backgroundColor: '#1f2937' },
  overlay: { flex: 1, padding: 16, justifyContent: 'space-between' },
  badgeRow: { flexDirection: 'row', gap: 6 },
  title: { color: '#ffffff', fontSize: 19, fontWeight: '800', marginBottom: 3 },
  meta: { color: 'rgba(255,255,255,0.88)', fontSize: 12.5, fontWeight: '500' },
});

function PillBadge({ label, strong }: { label: string; strong?: boolean }) {
  return (
    <View style={[pillStyles.pill, strong && pillStyles.pillStrong]}>
      <Text style={pillStyles.text}>{label}</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  pill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillStrong: { backgroundColor: '#0f8b6d' },
  text: { color: '#ffffff', fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
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
    <PhotoCard
      course={course}
      onPress={onPress}
      badges={
        <>
          {verified ? <PillBadge label={`TOP ${rank}`} strong /> : <PillBadge label="신규" />}
          <PillBadge label={course.theme} />
        </>
      }
      footer={
        verified ? (
          <View style={cardStyles.body}>
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
          </View>
        ) : undefined
      }
    />
  );
}

// ─── UserCourseCard ───────────────────────────────────────────────────────────

function UserCourseCard({
  course,
  onPress,
  onLongPress,
}: {
  course: Course;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  return (
    <PhotoCard
      course={course}
      onPress={onPress}
      onLongPress={onLongPress}
      badges={
        <>
          <PillBadge label="MY" strong />
          <PillBadge label={course.theme} />
        </>
      }
    />
  );
}

// ─── FestivalStrip (전주 축제·행사, TourAPI) ──────────────────────────────────

function formatFestivalDate(yyyymmdd: string): string {
  if (yyyymmdd.length !== 8) return '';
  return `${parseInt(yyyymmdd.slice(4, 6), 10)}.${parseInt(yyyymmdd.slice(6, 8), 10)}`;
}

function FestivalStrip({ festivals }: { festivals: JeonjuFestival[] }) {
  if (festivals.length === 0) return null;

  return (
    <View style={fsStyles.container}>
      <View style={fsStyles.header}>
        <Text style={fsStyles.title}>지금 전주는</Text>
        <Text style={fsStyles.source}>한국관광공사 TourAPI</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={fsStyles.strip}>
        {festivals.map((festival) => (
          <View key={festival.id} style={fsStyles.card}>
            {festival.imageUrl ? (
              <ImageBackground
                source={{ uri: festival.imageUrl }}
                style={fsStyles.image}
                imageStyle={fsStyles.imageRadius}
                resizeMode="cover"
              >
                {festival.isOngoing && (
                  <View style={fsStyles.liveBadge}>
                    <Text style={fsStyles.liveBadgeText}>진행 중</Text>
                  </View>
                )}
              </ImageBackground>
            ) : (
              <View style={[fsStyles.image, fsStyles.imageFallback]}>
                <Text style={fsStyles.imageFallbackIcon}>🎪</Text>
                {festival.isOngoing && (
                  <View style={fsStyles.liveBadge}>
                    <Text style={fsStyles.liveBadgeText}>진행 중</Text>
                  </View>
                )}
              </View>
            )}
            <Text style={fsStyles.cardTitle} numberOfLines={1}>{festival.title}</Text>
            <Text style={fsStyles.cardDate}>
              {formatFestivalDate(festival.startDate)} – {formatFestivalDate(festival.endDate)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const fsStyles = StyleSheet.create({
  container: { marginBottom: 24 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    marginBottom: 12,
  },
  title: { fontSize: 19, fontWeight: '800', color: '#13315c' },
  source: { fontSize: 10.5, color: '#8a9db0', fontWeight: '600' },
  strip: { gap: 12 },
  card: { width: 168 },
  image: {
    width: 168, height: 108, backgroundColor: '#e2e8f0',
    borderRadius: 14, overflow: 'hidden',
    padding: 8, alignItems: 'flex-start', justifyContent: 'flex-start',
    marginBottom: 8,
  },
  imageRadius: { borderRadius: 14 },
  imageFallback: { alignItems: 'center', justifyContent: 'center' },
  imageFallbackIcon: { fontSize: 30 },
  liveBadge: {
    backgroundColor: '#0f8b6d', borderRadius: 999,
    paddingHorizontal: 8, paddingVertical: 3,
    position: 'absolute', top: 8, left: 8,
  },
  liveBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  cardTitle: { fontSize: 13, fontWeight: '700', color: '#13315c', marginBottom: 2 },
  cardDate: { fontSize: 11.5, color: '#8a9db0', fontWeight: '500' },
});

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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
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
    backgroundColor: '#e8f5f1', borderRadius: 12, padding: 12, marginBottom: 12,
  },
  desc: { fontSize: 13, color: '#5c6b7a', lineHeight: 20, marginBottom: 20 },
  closeBtn: {
    backgroundColor: '#13315c', borderRadius: 14,
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
  const [festivals, setFestivals] = useState<JeonjuFestival[]>([]);
  const [nearbyPrompt, setNearbyPrompt] = useState<{ placeName: string; courses: Course[] } | null>(null);
  const [scoreInfoVisible, setScoreInfoVisible] = useState(false);
  const notifiedPlaceRef = useRef<string | null>(null);

  // Reload user courses every time the screen gains focus
  useFocusEffect(
    useCallback(() => {
      let active = true;
      Promise.all([getUserCourses(), fetchCourses(), fetchJeonjuFestivals()]).then(
        ([courses, serverCourses, serverFestivals]) => {
          if (!active) return;
          setUserCourses(courses);
          if (serverCourses && serverCourses.length > 0) setAllCourses(serverCourses);
          if (serverFestivals) setFestivals(serverFestivals);
        },
      );
      return () => { active = false; };
    }, []),
  );

  // ── 내가 만든 코스 삭제 (길게 눌러서) ──────────────────────────────────────
  const handleDeleteUserCourse = useCallback((course: Course) => {
    Alert.alert('코스 삭제', `"${course.title}"를 삭제할까요?\n수행 기록과 리뷰도 함께 삭제됩니다.`, [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await deleteUserCourse(course.id);
          const [mine, all] = await Promise.all([getUserCourses(), fetchCourses()]);
          setUserCourses(mine);
          if (all) setAllCourses(all);
        },
      },
    ]);
  }, []);

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
        {/* ── 헤더 ── */}
        <View style={styles.topRow}>
          <Text style={styles.brand}>TRIPICK</Text>
          <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileButtonText}>프로필</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.tagline}>직접 걸어서 검증하는 전주 여행 코스</Text>

        {/* 수행 데이터가 충분히 쌓이면 통계 노출 */}
        {totalPerformers >= MIN_VERIFIED_PERFORMERS && (
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

        {/* ── 전주 축제·행사 (TourAPI) ── */}
        <FestivalStrip festivals={festivals} />

        {/* ── 내가 만든 코스 ── */}
        {userCourses.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>내가 만든 코스</Text>
              <Text style={styles.sectionCount}>{userCourses.length}개</Text>
            </View>

            {userCourses.map((course) => (
              <UserCourseCard
                key={course.id}
                course={course}
                onPress={() => navigation.navigate('CourseDetail', { courseId: course.id })}
                onLongPress={() => handleDeleteUserCourse(course)}
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
        </View>
        {!isRankingActive && (
          <Text style={styles.sectionSub}>
            마음에 드는 코스의 첫 수행자가 되어보세요
          </Text>
        )}

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
  body: { paddingHorizontal: 16, paddingVertical: 12 },
  metrics: { flexDirection: 'row', alignItems: 'center' },
  metric: { flex: 1, alignItems: 'center' },
  metricValue: { fontSize: 14, fontWeight: '700', color: '#13315c', marginBottom: 2 },
  metricLabel: { fontSize: 10, color: '#8a9db0' },
  metricSep: { width: 1, height: 28, backgroundColor: '#dce6ec' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f6f8f9' },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },

  topRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 6,
  },
  brand: { color: '#13315c', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  profileButton: {
    backgroundColor: '#ffffff', borderRadius: 999,
    paddingHorizontal: 14, paddingVertical: 7,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  profileButtonText: { color: '#13315c', fontSize: 12, fontWeight: '700' },
  tagline: { color: '#5c6b7a', fontSize: 13, marginTop: 4, marginBottom: 18 },

  heroStats: {
    flexDirection: 'row', backgroundColor: '#13315c', borderRadius: 16, padding: 14, marginBottom: 16,
  },
  heroStat: { flex: 1, alignItems: 'center' },
  heroStatValue: { color: '#4fb286', fontSize: 20, fontWeight: '800', marginBottom: 2 },
  heroStatLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10 },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 8 },

  nearbyBanner: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#d3ece4', flexDirection: 'row', alignItems: 'center', gap: 10 },
  nearbyPulse: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 3, borderColor: '#d1fae5' },
  nearbyBody: { flex: 1 },
  nearbyTitle: { color: '#0b5f4b', fontSize: 13, fontWeight: '800' },
  nearbyText: { color: '#52746c', fontSize: 11, marginTop: 2 },
  nearbyArrow: { color: '#0f8b6d', fontSize: 20, fontWeight: '700' },

  smartBanner: {
    backgroundColor: '#0f8b6d',
    borderRadius: 18, padding: 18, marginBottom: 24,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#0f8b6d', shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28, shadowRadius: 12, elevation: 6,
  },
  smartBannerLeft: { flex: 1 },
  smartBannerTitle: { color: '#ffffff', fontSize: 17, fontWeight: '800', marginBottom: 5 },
  smartBannerDesc: { color: 'rgba(255,255,255,0.82)', fontSize: 12, lineHeight: 17 },
  smartBannerIcon: { color: 'rgba(255,255,255,0.5)', fontSize: 34, marginLeft: 8 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: '#13315c' },
  sectionCount: { fontSize: 12, color: '#8a9db0', fontWeight: '600' },
  infoButton: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: '#b6c4cf',
    alignItems: 'center', justifyContent: 'center',
  },
  infoButtonText: { fontSize: 11, fontWeight: '700', color: '#8a9db0', lineHeight: 13 },
  sectionSub: { fontSize: 12.5, color: '#8a9db0', marginBottom: 14 },

  emptyBox: { backgroundColor: '#ffffff', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16, marginTop: 10 },
  emptyText: { fontSize: 13, fontWeight: '600', color: '#8a9db0' },

  bottomNote: { textAlign: 'center', color: '#b6c4cf', fontSize: 11, marginTop: 8 },
});
