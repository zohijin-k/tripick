import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Course } from '../../types/course';

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

  return (
    <View style={[styles.container, { backgroundColor: accent }]}>
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

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{course.performers}명</Text>
          <Text style={styles.statLabel}>수행자</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>★ {course.averageRating}</Text>
          <Text style={styles.statLabel}>평균 평점</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{course.completionRate}%</Text>
          <Text style={styles.statLabel}>완주율</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 20,
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
    backgroundColor: 'rgba(255,255,255,0.2)',
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
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.15)',
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
