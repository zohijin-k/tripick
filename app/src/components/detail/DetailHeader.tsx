import React from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Course } from '../../types/course';
import { getCourseImage } from '../../data/courseImages';
import { formatAverageRating, formatCompletionRate } from '../../utils/courseMetrics';

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
  onBack: () => void;
}

export function DetailHeader({ course, onBack }: Props) {
  const accent = THEME_ACCENT[course.theme] ?? '#0f8b6d';
  const imageUrl = getCourseImage(course);
  const hasActivity = course.performers > 0;

  const inner = (
    <View style={[styles.inner, imageUrl ? styles.innerDim : null]}>
      <TouchableOpacity style={styles.backButton} onPress={onBack} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{course.theme}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{course.area}</Text>
          </View>
        </View>
        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.distance}>{course.distance} · 장소 {course.spotCount}곳</Text>
      </View>

      {/* 수행 데이터가 쌓인 코스만 지표 노출 */}
      {hasActivity && (
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{course.performers}명</Text>
            <Text style={styles.statLabel}>수행자</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>★ {formatAverageRating(course)}</Text>
            <Text style={styles.statLabel}>평균 평점</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{formatCompletionRate(course)}</Text>
            <Text style={styles.statLabel}>완주율</Text>
          </View>
        </View>
      )}
    </View>
  );

  if (imageUrl) {
    return (
      <ImageBackground source={{ uri: imageUrl }} style={styles.container} resizeMode="cover">
        {inner}
      </ImageBackground>
    );
  }

  return <View style={[styles.container, { backgroundColor: accent }]}>{inner}</View>;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1f2937',
  },
  inner: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  innerDim: {
    backgroundColor: 'rgba(15,23,42,0.45)',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 22,
    fontWeight: '600',
  },
  content: {
    paddingTop: 32,
    paddingBottom: 16,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  badge: {
    backgroundColor: 'rgba(15,23,42,0.4)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 6,
  },
  distance: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    paddingVertical: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});
