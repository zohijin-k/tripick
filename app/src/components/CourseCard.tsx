import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Course } from '../types/course';
import { calculateTripickScore } from '../utils/score';
import { calculateTrustScore } from '../utils/trustScore';

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
  const { score: trustScore } = calculateTrustScore(course);
  const accent = THEME_ACCENT[course.theme] ?? '#0f8b6d';

  return (
    <View style={styles.card}>
      {/* Colored header band */}
      <View style={[styles.header, { backgroundColor: accent }]}>
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>TOP {rank}</Text>
        </View>
        <View style={styles.themeBadge}>
          <Text style={styles.themeText}>{course.theme}</Text>
        </View>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {course.title}
        </Text>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Title row */}
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {course.title}
            </Text>
            <Text style={styles.meta}>
              {course.area} · {course.theme} · {course.distance}
            </Text>
          </View>
          <View style={styles.scoreBlock}>
            <Text style={styles.scoreLabel}>TRIPICK</Text>
            <Text style={styles.scoreValue}>{totalScore}</Text>
            <View style={[styles.trustBadge, { borderColor: accent }]}>
              <Text style={[styles.trustText, { color: accent }]}>
                신뢰도 {trustScore}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Metric grid */}
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{course.completionRate}%</Text>
            <Text style={styles.metricLabel}>완주율</Text>
          </View>
          <View style={styles.metricSep} />
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{course.averageRating}</Text>
            <Text style={styles.metricLabel}>만족도</Text>
          </View>
          <View style={styles.metricSep} />
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{course.performers}명</Text>
            <Text style={styles.metricLabel}>수행자</Text>
          </View>
          <View style={styles.metricSep} />
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{course.spotCount}곳</Text>
            <Text style={styles.metricLabel}>지점 수</Text>
          </View>
        </View>
      </View>
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
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
  },
  rankBadge: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  rankText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  themeBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  themeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  body: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleBlock: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#13315c',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#5c6b7a',
  },
  scoreBlock: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#8a9db0',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#13315c',
    lineHeight: 26,
  },
  trustBadge: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
    marginTop: 4,
  },
  trustText: {
    fontSize: 10,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#dce6ec',
    marginBottom: 12,
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
