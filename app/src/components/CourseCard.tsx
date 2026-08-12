import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  const overlay = (
    <LinearGradient
      colors={['rgba(15,23,42,0.30)', 'rgba(15,23,42,0.02)', 'rgba(15,23,42,0.72)']}
      locations={[0, 0.42, 1]}
      style={styles.overlay}
    >
      <View style={styles.badgeRow}>
        <View style={[styles.pill, verified && styles.pillStrong]}>
          <Text style={styles.pillText}>{verified ? `TOP ${rank}` : '신규'}</Text>
        </View>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{course.theme}</Text>
        </View>
      </View>
      <View>
        <Text style={styles.headerTitle} numberOfLines={1}>{course.title}</Text>
        <Text style={styles.headerMeta}>
          {course.area} · {course.distance} · {course.spotCount}곳
        </Text>
      </View>
    </LinearGradient>
  );

  return (
    <View style={styles.card}>
      {/* Photo (colored fallback when no image) */}
      {imageUrl ? (
        <ImageBackground source={{ uri: imageUrl }} style={styles.image} resizeMode="cover">
          {overlay}
        </ImageBackground>
      ) : (
        <View style={[styles.image, { backgroundColor: accent }]}>{overlay}</View>
      )}

      {/* 검증된 코스만 지표 노출 */}
      {verified && (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#13315c',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    // Android shadow
    elevation: 4,
  },
  image: {
    height: 208,
    backgroundColor: '#1f2937',
  },
  overlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  badgeRow: { flexDirection: 'row', gap: 6 },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillStrong: { backgroundColor: '#0f8b6d' },
  pillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 3,
  },
  headerMeta: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12.5,
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
});
