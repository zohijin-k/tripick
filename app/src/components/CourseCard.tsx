import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import type { Course } from '../types/course';
import { calculateTripickScore } from '../utils/score';
import { getCourseImage } from '../data/courseImages';
import { formatAverageRating, formatCompletionRate, isVerifiedCourse } from '../utils/courseMetrics';

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

interface Props {
  course: Course;
  rank: number;
}

export function CourseCard({ course, rank }: Props) {
  const { totalScore } = calculateTripickScore(course);
  const accent = THEME_ACCENT[course.theme] ?? '#0f8b6d';
  const verified = isVerifiedCourse(course);
  const imageUrl = getCourseImage(course);

  const headerContent = (
    <View style={styles.overlay}>
      <View style={styles.badgeRow}>
        <View style={[styles.badge, verified && styles.badgeStrong]}>
          <Text style={styles.badgeText}>{verified ? `TOP ${rank}` : '신규'}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{course.theme}</Text>
        </View>
      </View>
      <View>
        <Text style={styles.headerTitle} numberOfLines={1}>{course.title}</Text>
        <Text style={styles.headerMeta}>
          {course.area} · {course.distance} · {course.spotCount}곳
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      {/* Photo header (colored fallback when no image) */}
      {imageUrl ? (
        <ImageBackground source={{ uri: imageUrl }} style={styles.header} resizeMode="cover">
          {headerContent}
        </ImageBackground>
      ) : (
        <View style={[styles.header, { backgroundColor: accent }]}>{headerContent}</View>
      )}

      {/* Body — 검증된 코스만 지표 노출 */}
      {verified ? (
        <View style={styles.body}>
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{totalScore}</Text>
              <Text style={styles.metricLabel}>TRIPICK</Text>
            </View>
            <View style={styles.metricSep} />
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{formatCompletionRate(course)}</Text>
              <Text style={styles.metricLabel}>완주율</Text>
            </View>
            <View style={styles.metricSep} />
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{formatAverageRating(course)}</Text>
              <Text style={styles.metricLabel}>만족도</Text>
            </View>
            <View style={styles.metricSep} />
            <View style={styles.metric}>
              <Text style={styles.metricValue}>{course.performers}명</Text>
              <Text style={styles.metricLabel}>수행자</Text>
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.body}>
          <Text style={styles.freshNote}>
            아직 아무도 걷지 않은 코스예요 · 첫 수행자가 되어보세요
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 14,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Android shadow
    elevation: 3,
  },
  header: {
    height: 148,
    backgroundColor: '#1f2937',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.34)',
    padding: 14,
    justifyContent: 'space-between',
  },
  badgeRow: { flexDirection: 'row', gap: 6 },
  badge: {
    backgroundColor: 'rgba(15,23,42,0.45)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeStrong: { backgroundColor: '#0f8b6d' },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  headerMeta: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#13315c',
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: '#8a9db0',
  },
  metricSep: {
    width: 1,
    height: 28,
    backgroundColor: '#dce6ec',
  },
  freshNote: {
    fontSize: 12,
    color: '#5c6b7a',
  },
});
