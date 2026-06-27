import React, { useState, useCallback, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import type { Course, Review } from '../types/course';
import { DetailHeader } from '../components/detail/DetailHeader';
import { ScoreCard } from '../components/detail/ScoreCard';
import { TrustCard } from '../components/detail/TrustCard';
import { SpotList } from '../components/detail/SpotList';
import { calculateTripickScore } from '../utils/score';
import { calculateTrustScore } from '../utils/trustScore';
import { getReviewsForCourse, getAverageRating } from '../utils/reviewStorage';
import mockCourses from '../data/mockCourses';
import { findCourse } from '../utils/courseStorage';

// ─── Navigation types ─────────────────────────────────────────────────────────

type DetailNavProp = NativeStackNavigationProp<RootStackParamList, 'CourseDetail'>;
type DetailRouteProp = RouteProp<RootStackParamList, 'CourseDetail'>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const THEME_ACCENT: Record<string, string> = {
  야경: '#0f766e',
  카페: '#166534',
  예술: '#047857',
  로컬: '#15803d',
  시장: '#0f766e',
  자연: '#065f46',
  음식: '#b45309',
  역사: '#1d4ed8',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function StarDisplay({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <Text style={rvStyles.stars}>
      {'★'.repeat(filled)}{'☆'.repeat(5 - filled)}
    </Text>
  );
}

// ─── ReviewsCard ─────────────────────────────────────────────────────────────

function ReviewsCard({
  reviews,
  avgRating,
}: {
  reviews: Review[];
  avgRating: number | null;
}) {
  if (reviews.length === 0) return null;

  return (
    <View style={rvStyles.card}>
      <View style={rvStyles.header}>
        <Text style={rvStyles.title}>리뷰</Text>
        <View style={rvStyles.countBadge}>
          <Text style={rvStyles.countText}>{reviews.length}개</Text>
        </View>
        {avgRating !== null && (
          <View style={rvStyles.avgBadge}>
            <Text style={rvStyles.avgText}>★ {avgRating.toFixed(1)}</Text>
          </View>
        )}
      </View>

      {reviews.map((review, i) => (
        <React.Fragment key={review.id}>
          {i > 0 && <View style={rvStyles.divider} />}
          <View style={rvStyles.item}>
            <View style={rvStyles.itemHeader}>
              <StarDisplay rating={review.rating} />
              <Text style={rvStyles.date}>{formatDate(review.createdAt)}</Text>
            </View>
            {review.comment.length > 0 && (
              <Text style={rvStyles.comment}>{review.comment}</Text>
            )}
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const rvStyles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#13315c',
  },
  countBadge: {
    backgroundColor: '#fef9c3',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400e',
  },
  avgBadge: {
    backgroundColor: '#f59e0b',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginLeft: 'auto',
  },
  avgText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  item: {},
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stars: {
    fontSize: 16,
    color: '#f59e0b',
    letterSpacing: 2,
  },
  date: {
    fontSize: 11,
    color: '#8a9db0',
  },
  comment: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
});

// ─── CourseDetailScreen ───────────────────────────────────────────────────────

export function CourseDetailScreen() {
  const navigation = useNavigation<DetailNavProp>();
  const route = useRoute<DetailRouteProp>();
  const { courseId } = route.params;

  // ── Course state: sync init from mockCourses, async fallback for user courses ─
  const [course, setCourse] = useState<Course | null>(
    () => mockCourses.find((c) => c.id === courseId) ?? null,
  );
  const [courseLoaded, setCourseLoaded] = useState<boolean>(
    () => mockCourses.some((c) => c.id === courseId),
  );

  useEffect(() => {
    if (courseLoaded) return;
    let active = true;
    findCourse(courseId).then((found) => {
      if (active) { setCourse(found); setCourseLoaded(true); }
    });
    return () => { active = false; };
  }, [courseId, courseLoaded]);

  // ── Review state (all hooks before early return) ───────────────────────────
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);

  // Reload reviews every time screen gains focus (e.g. after completing Trace)
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        try {
          const [reviewList, rating] = await Promise.all([
            getReviewsForCourse(courseId),
            getAverageRating(courseId),
          ]);
          if (active) {
            setReviews(reviewList);
            setAvgRating(rating);
          }
        } catch {
          // silently ignore — reviews section simply stays empty
        }
      })();
      return () => { active = false; };
    }, [courseId]),
  );

  // ── Not-found guard (after all hooks) ─────────────────────────────────────
  if (!courseLoaded) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>코스 불러오는 중…</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (!course) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>코스를 찾을 수 없습니다.</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.notFoundBack}>← 돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Score calculation (use stored avgRating when available) ───────────────
  const accent = THEME_ACCENT[course.theme] ?? '#0f8b6d';
  const effectiveRating = avgRating ?? course.averageRating;
  const tripickScore = calculateTripickScore({
    ...course,
    averageRating: effectiveRating,
  });
  const trustScore = calculateTrustScore(course, reviews);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DetailHeader course={course} onBack={() => navigation.goBack()} />

        <View style={styles.body}>
          <ScoreCard result={tripickScore} />
          <TrustCard result={trustScore} />

          {course.recommendationReasons && course.recommendationReasons.length > 0 && (
            <View style={styles.reasonsCard}>
              <Text style={styles.reasonsTitle}>추천 이유</Text>
              {course.recommendationReasons.map((reason, i) => (
                <View key={i} style={styles.reasonRow}>
                  <Text style={[styles.reasonDot, { color: accent }]}>•</Text>
                  <Text style={styles.reasonText}>{reason}</Text>
                </View>
              ))}
            </View>
          )}

          <SpotList spots={course.spots} accentColor={accent} />

          {/* Reviews loaded from AsyncStorage */}
          <ReviewsCard reviews={reviews} avgRating={avgRating} />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Fixed start button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: accent }]}
          onPress={() => navigation.navigate('Trace', { courseId: course.id })}
          activeOpacity={0.85}
        >
          <Text style={styles.startButtonText}>코스 시작하기</Text>
          <Text style={styles.startButtonSub}>
            {course.spotCount}개 장소 · {course.distance}
            {avgRating !== null ? `  ·  ★ ${avgRating.toFixed(1)}` : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f3f6f8' },
  scroll: { flex: 1 },
  content: { paddingBottom: 0 },
  body: { padding: 16 },

  reasonsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  reasonsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  reasonRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  reasonDot: { fontSize: 14, lineHeight: 20 },
  reasonText: { flex: 1, fontSize: 13, color: '#334155', lineHeight: 20 },

  bottomSpacer: { height: 100 },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e8f0ec',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  startButton: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  startButtonText: { color: '#ffffff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  startButtonSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 2 },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  notFoundText: { fontSize: 16, color: '#5c6b7a' },
  notFoundBack: { fontSize: 14, color: '#0f8b6d', fontWeight: '600' },
});
